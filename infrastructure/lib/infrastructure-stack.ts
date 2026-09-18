import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { AppEnv } from "./env.config";
import { DynamoTable } from "./constructs/dynamo-table";
import { LambdaFunction } from "./constructs/lambda-function";

interface AppStackProps extends cdk.StackProps {
  readonly envConfig: AppEnv;
}

// Same shape as citius's SsrWebsiteStack (Lambda + aws-lambda-web-adapter +
// Function URL, fronted by CloudFront) minus what this app doesn't need:
// no VPC/security groups (DynamoDB is reached over its public endpoint), no
// DynamoDB cache table (no ISR/revalidation — citius itself runs with
// DISABLED_CACHE anyway; the one table here holds training sessions), no
// Route53/ACM (no domain yet, see the CfnOutput below for the CloudFront
// URL to use meanwhile).
export class BoardWebsiteStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const staticAssetsBucket = this.buildStaticAssetsBucket(id);

    const sessions = new DynamoTable(this, "SessionsTable", {
      // Name must match TABLE_NAME in app/src/lib/actions/sessions.ts.
      tableName: `training-sessions-${props.envConfig.stage}`,
      partitionKey: { name: "id", type: cdk.aws_dynamodb.AttributeType.STRING },
      retain: true, // user data, unlike citius's disposable cache table
      pointInTimeRecovery: props.envConfig.stage === "main",
    });

    // Id "Default" keeps this construct's children out of their logical IDs, so
    // the already-deployed role keeps its ID instead of being replaced (it has
    // a fixed name, so replacement would fail). Only one child per scope can use it.
    const ssr = this.buildSsrLambda(props.envConfig);
    sessions.table.grantReadWriteData(ssr.function);

    const distribution = this.buildDistribution(ssr.functionUrl!, staticAssetsBucket);

    this.deployStaticAssets(staticAssetsBucket, distribution);

    new cdk.CfnOutput(this, "SiteURL", {
      value: `https://${distribution.distributionDomainName}`,
    });
  }

  buildStaticAssetsBucket(id: string): cdk.aws_s3.Bucket {
    return new cdk.aws_s3.Bucket(this, `${id}-bucket-assets`, {
      objectOwnership: cdk.aws_s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }

  buildSsrLambda(envConfig: AppEnv): LambdaFunction {
    // https://github.com/awslabs/aws-lambda-web-adapter — lets the
    // standalone Next.js server (a plain Node HTTP server, `node server.js`)
    // run inside Lambda unmodified instead of needing a custom handler.
    const webAdapterLayer = cdk.aws_lambda.LayerVersion.fromLayerVersionArn(
      this,
      "web-adapter-layer",
      `arn:aws:lambda:${this.region}:753240598075:layer:LambdaAdapterLayerX86:24`,
    );

    return new LambdaFunction(this, "Default", {
      roleName: `board-lambda-role-${envConfig.stage}`,
      code: cdk.aws_lambda.Code.fromAsset("../app/.next/standalone"),
      handler: "run.sh",
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        STAGE: envConfig.stage,
        AWS_LAMBDA_EXEC_WRAPPER: "/opt/bootstrap",
        PORT: "8080",
        AWS_LWA_INVOKE_MODE: "response_stream",
      },
      logRetention:
        envConfig.stage === "main" ? cdk.aws_logs.RetentionDays.ONE_MONTH : cdk.aws_logs.RetentionDays.ONE_WEEK,
      layers: [webAdapterLayer],
      publicUrl: true,
    });
  }

  buildDistribution(
    functionUrl: cdk.aws_lambda.FunctionUrl,
    staticAssetsBucket: cdk.aws_s3.Bucket,
  ): cdk.aws_cloudfront.Distribution {
    // Pages render on every request (no meaningfully "static" HTML to cache
    // at the edge, same reasoning as citius's near-zero-TTL policy) — the
    // _next/static/* behavior below is where the real caching happens.
    const originCachePolicy = new cdk.aws_cloudfront.CachePolicy(this, "origin-cache-policy", {
      comment: "Near-zero cache for the Lambda origin — real caching happens on _next/static/*",
      minTtl: cdk.Duration.seconds(0),
      maxTtl: cdk.Duration.seconds(1),
      defaultTtl: cdk.Duration.seconds(0),
      queryStringBehavior: cdk.aws_cloudfront.CacheQueryStringBehavior.all(),
    });

    const distribution = new cdk.aws_cloudfront.Distribution(this, "cloud-distribution", {
      defaultBehavior: {
        origin: new cdk.aws_cloudfront_origins.FunctionUrlOrigin(functionUrl),
        viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: originCachePolicy,
        originRequestPolicy: cdk.aws_cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
        allowedMethods: cdk.aws_cloudfront.AllowedMethods.ALLOW_ALL,
      },
      additionalBehaviors: {
        // Hashed, immutable build output — safe to cache aggressively and
        // serve straight from S3 instead of round-tripping through Lambda.
        "_next/static/*": {
          origin: cdk.aws_cloudfront_origins.S3BucketOrigin.withOriginAccessControl(staticAssetsBucket),
          viewerProtocolPolicy: cdk.aws_cloudfront.ViewerProtocolPolicy.HTTPS_ONLY,
          cachePolicy: cdk.aws_cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
      minimumProtocolVersion: cdk.aws_cloudfront.SecurityPolicyProtocol.TLS_V1_2_2018,
    });

    return distribution;
  }

  deployStaticAssets(staticAssetsBucket: cdk.aws_s3.Bucket, distribution: cdk.aws_cloudfront.Distribution) {
    // Only _next/static ships to S3 — public/ (favicon, svgs) is copied into
    // the Lambda bundle itself (see app/package.json's postbuild), so the
    // standalone server can serve it directly without a second CloudFront
    // path-pattern per asset.
    new cdk.aws_s3_deployment.BucketDeployment(this, "deploy-next-static-assets", {
      sources: [cdk.aws_s3_deployment.Source.asset("../app/.next/static")],
      destinationBucket: staticAssetsBucket,
      destinationKeyPrefix: "_next/static",
      distribution,
      distributionPaths: ["/_next/static/*"],
    });
  }
}
