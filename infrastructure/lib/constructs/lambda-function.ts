import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

interface LambdaFunctionProps {
  readonly roleName: string;
  readonly code: cdk.aws_lambda.Code;
  readonly handler: string;
  readonly runtime?: cdk.aws_lambda.Runtime;
  readonly memorySize?: number;
  readonly timeout?: cdk.Duration;
  readonly environment?: Record<string, string>;
  readonly layers?: cdk.aws_lambda.ILayerVersion[];
  readonly logRetention?: cdk.aws_logs.RetentionDays;
  /** Expose a public, response-streaming Function URL (e.g. to front it with CloudFront). */
  readonly publicUrl?: boolean;
}

// Lambda function with its own execution role (basic logging only — grant
// anything else through `function`'s role, e.g. `table.grantReadWriteData(fn)`).
export class LambdaFunction extends Construct {
  readonly function: cdk.aws_lambda.Function;
  readonly functionUrl?: cdk.aws_lambda.FunctionUrl;

  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    super(scope, id);

    const role = new cdk.aws_iam.Role(this, "lambda-role", {
      roleName: props.roleName,
      assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
    });
    role.addManagedPolicy(
      cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
    );

    this.function = new cdk.aws_lambda.Function(this, "function", {
      runtime: props.runtime ?? cdk.aws_lambda.Runtime.NODEJS_22_X,
      architecture: cdk.aws_lambda.Architecture.X86_64,
      code: props.code,
      handler: props.handler,
      memorySize: props.memorySize,
      timeout: props.timeout,
      role,
      environment: props.environment,
      logRetention: props.logRetention,
      layers: props.layers,
    });

    if (props.publicUrl) {
      this.functionUrl = this.function.addFunctionUrl({
        authType: cdk.aws_lambda.FunctionUrlAuthType.NONE,
        invokeMode: cdk.aws_lambda.InvokeMode.RESPONSE_STREAM,
      });

      // Since Oct 2025, AWS requires BOTH lambda:InvokeFunctionUrl (added
      // automatically above for authType NONE) and lambda:InvokeFunction on
      // the resource policy for a public Function URL — without the latter,
      // every caller (including CloudFront) gets 403 "Forbidden" even though
      // the URL itself is public. This CDK version's addFunctionUrl() only
      // adds the first one. https://docs.aws.amazon.com/lambda/latest/dg/urls-auth.html
      this.function.addPermission("invoke-function", {
        principal: new cdk.aws_iam.AnyPrincipal(),
        action: "lambda:InvokeFunction",
      });
    }
  }
}
