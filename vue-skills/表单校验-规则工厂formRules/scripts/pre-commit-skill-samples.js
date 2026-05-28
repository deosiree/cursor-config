"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const SKILL_REL = "vue-skills/表单校验-规则工厂formRules";
const SAMPLE_PREFIX = `${SKILL_REL}/template/sample-nebula/after/`;
const MANIFEST_REL = `${SKILL_REL}/scripts/template-sync.manifest.json`;

function git(args, cwd) {
  const r = spawnSync("git", args, { cwd, encoding: "utf8" });
  if (r.status !== 0 && r.error) {
    console.error("pre-commit-skill-samples: git not available", r.error.message);
    process.exit(1);
  }
  return (r.stdout || "").trim();
}

function isRelevant(stagedPath) {
  const n = stagedPath.replace(/\\/g, "/");
  if (!n.includes(SKILL_REL)) return false;
  if (n === `${SAMPLE_PREFIX}formRules.ts`) return true;
  if (n.includes(`${SAMPLE_PREFIX}formRules.`) && n.endsWith(".fragment.ts")) return true;
  if (n === MANIFEST_REL) return true;
  return false;
}

function main() {
  const gitRoot = git(["rev-parse", "--show-toplevel"], process.cwd());
  if (!gitRoot) {
    process.exit(0);
  }

  const staged = git(["diff", "--cached", "--name-only"], gitRoot);
  if (!staged) {
    process.exit(0);
  }

  const paths = staged.split("\n").filter(Boolean);
  if (!paths.some(isRelevant)) {
    process.exit(0);
  }

  const skillRoot = path.join(gitRoot, SKILL_REL);
  console.log("formRules skill: staged sample files detected — running sync-samples.js");

  const result = spawnSync(process.execPath, ["scripts/sync-samples.js"], {
    cwd: skillRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    console.error(
      "\npre-commit failed: sync-samples did not pass.",
      "Edit template/sample-nebula/after/formRules.ts (not AUTO-GENERATED fragments),",
      "then run: node scripts/sync-samples.js"
    );
    process.exit(result.status ?? 1);
  }

  const restaged = spawnSync("git", ["add", "-A", path.join(SKILL_REL, "template"), path.join(SKILL_REL, "scripts", "template-sync.manifest.json")], {
    cwd: gitRoot,
    stdio: "inherit",
  });
  if (restaged.status !== 0) {
    console.warn("pre-commit: sync OK but git add restage failed — stage updated fragments manually");
  }

  process.exit(0);
}

main();
