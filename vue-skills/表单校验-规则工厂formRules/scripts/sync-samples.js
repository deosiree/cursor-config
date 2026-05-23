"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const scriptsDir = __dirname;

function run(script) {
  const scriptPath = path.join(scriptsDir, script);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    cwd: path.join(scriptsDir, ".."),
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("extract-fragments.js");
run("verify-template-sync.js");
console.log("\nsync-samples: OK");
