"use strict";

const fs = require("fs");
const path = require("path");
const {
  SKILL_ROOT,
  readManifest,
  readSource,
  normalizeForCompare,
  extractFragmentBlocks,
  readFragmentBody,
} = require("./extract-sync-lib");

function walkFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkFiles(p, acc);
    else if (/\.(md|ts|vue|yaml|json)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const NEGATION_ALLOW =
  /勿|禁止|不要|不\s*维护|不\s*export|无\s*|已删除|删除\/|勿再|勿新增|薄包装|对齐|统一|等价|不得|勿在|内联|替代|旧\s*`?passwordConfirm/;

function grepGate() {
  const skillRoot = SKILL_ROOT;
  const files = walkFiles(skillRoot).filter((p) => !p.includes(path.join("scripts", "")));
  const banned = [
    { pattern: /\btrimNameOnBlur\b/, label: "trimNameOnBlur", allow: /无\s*`?trimNameOnBlur|禁止|不要|统一\s*`?trimFieldOnBlur/ },
    { pattern: /\btrimRoutePathOnBlur\b/, label: "trimRoutePathOnBlur", allow: /无\s*|禁止|不要/ },
    {
      pattern: /export\s+function\s+validateRoutePathSyntax/,
      label: "export validateRoutePathSyntax",
      allow: /禁止|不\s*export|模块内私有/,
    },
    { pattern: /\bconst\s+RULE_TRIGGER\b/, label: "const RULE_TRIGGER", allow: NEGATION_ALLOW },
    {
      pattern: /export\s+const\s+ROUTE_PATH_MAX_LENGTH\b/,
      label: "export const ROUTE_PATH_MAX_LENGTH",
      allow: NEGATION_ALLOW,
    },
    {
      pattern: /export\s+const\s+API_PATH_MAX_LENGTH\b/,
      label: "export const API_PATH_MAX_LENGTH",
      allow: NEGATION_ALLOW,
    },
    { pattern: /\bcreatePasswordWithMin6Rules\b/, label: "createPasswordWithMin6Rules", allow: NEGATION_ALLOW },
    {
      pattern: /\bcreateConfirmPasswordRulesWithMin\b/,
      label: "createConfirmPasswordRulesWithMin",
      allow: NEGATION_ALLOW,
    },
    {
      pattern: /\bformRules\.passwordConfirm\.fragment/,
      label: "formRules.passwordConfirm.fragment",
      allow: NEGATION_ALLOW,
    },
  ];
  let failed = false;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    const lines = text.split("\n");
    for (const { pattern, label, allow } of banned) {
      for (const line of lines) {
        if (!pattern.test(line)) continue;
        if (allow && allow.test(line)) continue;
        console.error("grep gate failed: " + label + " in " + path.relative(skillRoot, file));
        console.error("  " + line.trim());
        failed = true;
        break;
      }
    }
  }

  const skillMd = fs.readFileSync(path.join(skillRoot, "SKILL.md"), "utf8");
  if (/\btrimOnBlur\b/.test(skillMd) && !skillMd.includes("trimFieldOnBlur")) {
    console.error("grep gate failed: SKILL.md uses trimOnBlur without trimFieldOnBlur");
    failed = true;
  }
  if (/\btrimOnBlur\b/.test(skillMd)) {
  const lines = skillMd.split("\n");
  for (const line of lines) {
    if (/\btrimOnBlur\b/.test(line) && !/trimFieldOnBlur|禁止|迁移|旧/.test(line)) {
      console.error("grep gate failed: SKILL.md orphan trimOnBlur: " + line.trim());
      failed = true;
    }
  }
  }

  return failed;
}

function verifyFragments(manifest, source) {
  const expected = extractFragmentBlocks(source, manifest);
  const outDir = path.join(SKILL_ROOT, "template", "sample-nebula", "after");
  let failed = false;

  for (const [fileName, expectedBody] of Object.entries(expected)) {
    const fragmentPath = path.join(outDir, fileName);
    if (!fs.existsSync(fragmentPath)) {
      console.error("missing fragment: " + fileName);
      failed = true;
      continue;
    }
    const raw = fs.readFileSync(fragmentPath, "utf8");
    if (!raw.includes("AUTO-GENERATED from formRules.ts")) {
      console.error("missing AUTO-GENERATED header: " + fileName);
      failed = true;
    }
    let actualBody;
    try {
      actualBody = readFragmentBody(fragmentPath);
    } catch (e) {
      console.error(e.message);
      failed = true;
      continue;
    }
    const expNorm = normalizeForCompare(expectedBody);
    const actNorm = normalizeForCompare(actualBody);
    if (expNorm !== actNorm) {
      console.error("body mismatch: " + fileName);
      console.error("  expected length: " + expNorm.length + ", actual: " + actNorm.length);
      const minLen = Math.min(expNorm.length, actNorm.length);
      for (let i = 0; i < minLen; i++) {
        if (expNorm[i] !== actNorm[i]) {
          console.error("  first diff at char " + i);
          console.error("  expected: ..." + expNorm.slice(Math.max(0, i - 20), i + 40) + "...");
          console.error("  actual:   ..." + actNorm.slice(Math.max(0, i - 20), i + 40) + "...");
          break;
        }
      }
      failed = true;
    } else {
      console.log("ok " + fileName);
    }
  }
  return failed;
}

function main() {
  const manifest = readManifest();
  const source = readSource(manifest);
  let failed = verifyFragments(manifest, source);
  if (grepGate()) failed = true;
  if (failed) {
    console.error("\nverify-template-sync: FAILED — run node scripts/extract-fragments.js");
    process.exit(1);
  }
  console.log("\nverify-template-sync: OK");
}

main();
