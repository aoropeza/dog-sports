import type { NextConfig } from "next";
import * as path from "path";

const nextConfig: NextConfig = {
  // Mirrors citius's deployment shape: bundled into a self-contained
  // server (.next/standalone) that runs in Lambda behind the aws-lambda-web
  // -adapter layer, fronted by CloudFront — see infrastructure/.
  output: "standalone",
  // Without this, Next.js walks up to the monorepo root's package-lock.json
  // and nests the standalone output under .next/standalone/app/server.js
  // instead of .next/standalone/server.js — breaking run.sh's `node server.js`.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
