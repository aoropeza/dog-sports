#!/usr/bin/env node
/**
 * Writes the given semver version into every package.json that ships as
 * part of a release. Used by semantic-release's exec plugin (prepareCmd) so
 * all packages stay in lockstep with the version it computed. Only app/ is
 * user-facing today — add more paths here if microservices/other packages
 * join the release later, same as citius does.
 * Usage: node scripts/bump-monorepo-versions.js <version>
 */

const fs = require("fs");
const path = require("path");

const version = process.argv[2];
if (!version) {
  console.error("Usage: bump-monorepo-versions.js <version>");
  process.exit(1);
}

const packagePaths = ["app/package.json"];

for (const relativePath of packagePaths) {
  const absolutePath = path.join(__dirname, "..", relativePath);
  const pkg = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  pkg.version = version;
  fs.writeFileSync(absolutePath, JSON.stringify(pkg, null, 2) + "\n");
}
