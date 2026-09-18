import * as cdk from "aws-cdk-lib";
import type { AssetOptions } from "aws-cdk-lib/aws-s3-assets";
import { Match, Template } from "aws-cdk-lib/assertions";
import { BoardWebsiteStack } from "../lib/infrastructure-stack";
import { getEnvConfig } from "../lib/env.config";

// The Lambda points at "../app/.next/standalone", which only exists after a
// production `next build`. Every other Code.fromAsset call in this stack
// (e.g. the BucketDeployment construct's internal AwsCliLayer) must keep
// using the real implementation, so only that one path is stubbed out.
const buildTemplate = (stage: string) => {
  const realFromAsset = cdk.aws_lambda.Code.fromAsset;
  jest.spyOn(cdk.aws_lambda.Code, "fromAsset").mockImplementation((path: string, options?: AssetOptions) => {
    if (typeof path === "string" && path.includes(".next/standalone")) {
      return cdk.aws_lambda.Code.fromInline("exports.handler = async () => ({});") as unknown as cdk.aws_lambda.AssetCode;
    }
    return realFromAsset(path, options);
  });

  // Same problem for the BucketDeployment source: "../app/.next/static" is
  // also build output that only exists after `next build`, so CI's fresh
  // checkout has no such directory. Redirect that one source to the
  // repo-tracked "../app/public" — its content doesn't matter here, only
  // that CDK's asset staging finds a real directory to hash.
  const realSourceAsset = cdk.aws_s3_deployment.Source.asset;
  jest.spyOn(cdk.aws_s3_deployment.Source, "asset").mockImplementation((path: string, options?: AssetOptions) => {
    if (typeof path === "string" && path.includes(".next/static")) {
      return realSourceAsset("../app/public", options);
    }
    return realSourceAsset(path, options);
  });

  const app = new cdk.App();
  const stack = new BoardWebsiteStack(app, `canine-sports-board-${stage}`, {
    env: { account: "123456789012", region: "us-east-1" },
    envConfig: getEnvConfig(stage),
  });

  return Template.fromStack(stack);
};

describe("BoardWebsiteStack", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("develop stage", () => {
    let template: Template;

    beforeAll(() => {
      template = buildTemplate("develop");
    });

    it("creates the SSR lambda with the expected runtime and configuration", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "nodejs22.x",
        Handler: "run.sh",
        MemorySize: 512,
        Timeout: 30,
      });
    });

    it("configures the lambda environment for the develop stage", () => {
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            STAGE: "develop",
            AWS_LWA_INVOKE_MODE: "response_stream",
          }),
        },
      });
    });

    it("uses a one week log retention for the develop stage", () => {
      template.hasResourceProperties("Custom::LogRetention", {
        RetentionInDays: 7,
      });
    });

    it("creates a private S3 bucket for static assets", () => {
      template.hasResourceProperties("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });

    it("creates exactly one CloudFront distribution", () => {
      template.resourceCountIs("AWS::CloudFront::Distribution", 1);
    });

    it("does not create a custom domain, certificate or Route53 record", () => {
      template.resourceCountIs("AWS::CertificateManager::Certificate", 0);
      template.resourceCountIs("AWS::Route53::RecordSet", 0);
    });
  });

  describe("main stage", () => {
    it("uses a one month log retention for the main stage", () => {
      const template = buildTemplate("main");

      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({ STAGE: "main" }),
        },
      });
      template.hasResourceProperties("Custom::LogRetention", {
        RetentionInDays: 30,
      });
    });
  });
});
