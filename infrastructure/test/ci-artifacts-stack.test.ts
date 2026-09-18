import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { CiArtifactsStack } from "../lib/ci-artifacts-stack";

describe("CiArtifactsStack", () => {
  it("creates a private, lifecycle-limited S3 bucket for build artifacts", () => {
    const app = new cdk.App();
    const stack = new CiArtifactsStack(app, "ci-artifacts-stack", {
      env: { account: "123456789012", region: "us-east-1" },
    });
    const template = Template.fromStack(stack);

    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: "canine-sports-board-ci-artifacts",
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      LifecycleConfiguration: {
        Rules: [
          {
            Status: "Enabled",
            ExpirationInDays: 30,
          },
        ],
      },
    });
  });
});
