"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const SKILL_ROOT = path.join(__dirname, "..");
const CONFIG_PATH = path.join(SKILL_ROOT, "references", "sample-source.config.json");
const EXAMPLE_CONFIG = path.join(SKILL_ROOT, "references", "sample-source.config.example.json");
const SECTION4_PWD = "密码对 pwdPair";

const NAMING_HINTS = [
  { apex: "pwdPair", microfb: "pwdConfirmPair" },
  { apex: "PwdCtx", microfb: "PwdConfirmCtx" },
  { apex: "PwdPolicy", microfb: "PwdConfirmPolicy" },
  { apex: "pwdMinRules", microfb: "createPasswordRules" },
  { apex: "cfmPwdRules", microfb: "createConfirmPasswordRules" },
];

function parseArgs(argv) {
  const out = { dryRun: true, apply: false, apex: null, microfb: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--apply") {
      out.apply = true;
      out.dryRun = false;
    } else if (a === "--dry-run") {
      out.dryRun = true;
      out.apply = false;
    } else if (a === "--apex" && argv[i + 1]) {
      out.apex = argv[++i];
    } else if (a === "--microfb" && argv[i + 1]) {
      out.microfb = argv[++i];
    } else if (a === "--help" || a === "-h") {
      out.help = true;
    }
  }
  return out;
}

function loadConfig() {
  const p = fs.existsSync(CONFIG_PATH) ? CONFIG_PATH : EXAMPLE_CONFIG;
  if (!fs.existsSync(p)) {
    console.error("Missing config. Copy references/sample-source.config.example.json → sample-source.config.json");
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function sha256File(filePath) {
  const buf = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function resolveRepoRoot(configRoot, cliOverride) {
  const raw = cliOverride || configRoot;
  if (!raw) return null;
  return path.resolve(raw);
}

function formRulesPath(repoRoot, relative) {
  return path.join(repoRoot, relative.replace(/\//g, path.sep));
}

function ensureFile(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`Not found (${label}): ${filePath}`);
    process.exit(1);
  }
}

function reportCompareVsCanonical(canonicalPath, comparePath, compareLabel) {
  const a = fs.readFileSync(canonicalPath, "utf8");
  const b = fs.readFileSync(comparePath, "utf8");
  const sameHash = sha256File(canonicalPath) === sha256File(comparePath);
  console.log(`\n--- ${compareLabel} vs apex_dev (canonical) ---`);
  if (sameHash) {
    console.log("  Files are byte-identical (unusual for apex vs microfb).");
    return;
  }
  const linesA = a.split("\n").length;
  const linesB = b.split("\n").length;
  console.log(`  Line count: apex ${linesA}, ${compareLabel} ${linesB}`);
  console.log("  Expected naming differences (see references/password-pair-model.md):");
  for (const { apex, microfb } of NAMING_HINTS) {
    const inA = a.includes(apex);
    const inB = b.includes(microfb);
    if (inA || inB) {
      console.log(`    apex: ${apex} (${inA ? "yes" : "no"}) | ${compareLabel}: ${microfb} (${inB ? "yes" : "no"})`);
    }
  }
  console.log("  Skill sample is NOT updated from microfb — apex_dev only.");
}

function ensureSection4Comment(content) {
  if (content.includes(SECTION4_PWD)) return content;
  return content.replace(
    /§4 预定义规则集（([^）]+)）/,
    "§4 预定义规则集（$1 | 密码对 pwdPair）"
  );
}

function runSyncSamples() {
  const r = spawnSync(process.execPath, ["scripts/sync-samples.js"], {
    cwd: SKILL_ROOT,
    stdio: "inherit",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function printHelp() {
  console.log(`Usage: node scripts/sync-from-repos.js [--dry-run|--apply] [--apex <root>] [--microfb <root>]

  --dry-run   Report drift only (default)
  --apply     Copy apex formRules.ts → skill template, then sync-samples.js

  Config: references/sample-source.config.json (copy from .example.json)
`);
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const config = loadConfig();
  const apexRoot = resolveRepoRoot(config.canonicalRepo.root, args.apex);
  const skillTarget = path.join(SKILL_ROOT, config.skillTargetRelative);
  const apexFormRules = formRulesPath(apexRoot, config.canonicalRepo.formRulesRelative);

  ensureFile(apexFormRules, "apex_dev canonical");
  ensureFile(skillTarget, "skill target");

  const apexHash = sha256File(apexFormRules);
  const skillHash = sha256File(skillTarget);
  const drift = apexHash !== skillHash;

  console.log("canonical:", apexFormRules);
  console.log("skill target:", skillTarget);
  console.log("mode:", args.apply ? "apply" : "dry-run");
  console.log("drift (apex vs skill):", drift ? "YES" : "no");

  if (config.compareRepos?.length) {
    for (const repo of config.compareRepos) {
      const cliOverride = repo.label === "microfb" ? args.microfb : null;
      const compareRoot = resolveRepoRoot(repo.root, cliOverride);
      if (!compareRoot) continue;
      const compareFile = formRulesPath(compareRoot, repo.formRulesRelative);
      if (!fs.existsSync(compareFile)) {
        console.warn(`Skip compare (${repo.label}): not found ${compareFile}`);
        continue;
      }
      reportCompareVsCanonical(apexFormRules, compareFile, repo.label);
    }
  }

  if (!drift && !args.apply) {
    console.log("\nsync-from-repos: no drift — skill sample matches apex_dev.");
    process.exit(0);
  }

  if (args.dryRun && !args.apply) {
    if (drift) {
      console.warn("\nWARN: drift detected. Run with --apply after review to copy apex → skill and sync fragments.");
    }
    process.exit(0);
  }

  if (!args.apply) {
    process.exit(0);
  }

  let content = fs.readFileSync(apexFormRules, "utf8");
  content = ensureSection4Comment(content);
  fs.writeFileSync(skillTarget, content, "utf8");
  console.log("\nApplied: copied apex_dev → skill template.");
  runSyncSamples();
  console.log("\nsync-from-repos: OK");
}

main();
