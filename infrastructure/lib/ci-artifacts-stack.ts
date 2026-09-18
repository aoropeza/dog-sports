import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

// Shared bucket holding the build.tar.gz produced once per push to main
// (see .github/workflows/cd.yml's build-and-package job) — deploy-staging
// and promote-production.yml both pull from here instead of rebuilding
// from source, so what gets promoted to production is byte-for-byte what
// was already tested in staging. Not stage-specific — same bucket backs
// both environments.
export class CiArtifactsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new cdk.aws_s3.Bucket(this, "CiArtifactsBucket", {
      bucketName: "canine-sports-board-ci-artifacts",
      blockPublicAccess: cdk.aws_s3.BlockPublicAccess.BLOCK_ALL,
      lifecycleRules: [{ expiration: cdk.Duration.days(30) }],
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new cdk.CfnOutput(this, "CiArtifactsBucketName", {
      value: bucket.bucketName,
    });
  }
}
