"use strict";

const fs = require("fs");
const path = require("path");
const { readManifest, readSource, buildFragmentFile, SKILL_ROOT } = require("./extract-sync-lib");

function main() {
  const manifest = readManifest();
  const source = readSource(manifest);
  const outDir = path.join(SKILL_ROOT, "template", "sample-nebula", "after");

  for (const [fileName, config] of Object.entries(manifest.fragments)) {
    const content = buildFragmentFile(source, fileName, config);
    const outPath = path.join(outDir, fileName);
    fs.writeFileSync(outPath, content, "utf8");
    console.log("wrote " + path.relative(SKILL_ROOT, outPath));
  }
}

main();
