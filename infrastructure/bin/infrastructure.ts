#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { BoardWebsiteStack } from "../lib/infrastructure-stack";
import { CiArtifactsStack } from "../lib/ci-artifacts-stack";
import { getEnvConfig } from "../lib/env.config";

// "develop" (staging) or "main" (production) — set by the CI workflow that
// invokes `cdk deploy`/`cdk synth`; defaults to "develop" for local runs.
const stage = process.env.STAGE ?? "develop";

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? "us-east-1",
};

const app = new cdk.App();

// Not stage-specific — same bucket backs both develop and main deploys.
new CiArtifactsStack(app, "canine-sports-board-ci-artifacts-stack", { env });

new BoardWebsiteStack(app, `canine-sports-board-${stage}`, {
  env,
  envConfig: getEnvConfig(stage),
});
