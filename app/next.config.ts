import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Mirrors citius's deployment shape: bundled into a self-contained
  // server (.next/standalone) that runs in Lambda behind the aws-lambda-web
  // -adapter layer, fronted by CloudFront — see infrastructure/.
  output: "standalone",
};

export default nextConfig;
