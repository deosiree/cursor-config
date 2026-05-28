"use strict";

const fs = require("fs");
const path = require("path");

const MARKER_START = "# formRules-skill-samples BEGIN";
const MARKER_END = "# formRules-skill-samples END";
const HOOK_BODY = `${MARKER_START}
node "vue-skills/表单校验-规则工厂formRules/scripts/pre-commit-skill-samples.js"
${MARKER_END}
`;

const skillRoot = path.join(__dirname, "..");
const cursorRoot = path.resolve(skillRoot, "../..");
const huskyPreCommit = path.join(cursorRoot, ".husky", "pre-commit");

function readExisting() {
  if (!fs.existsSync(huskyPreCommit)) return "";
  return fs.readFileSync(huskyPreCommit, "utf8");
}

function stripOldBlock(text) {
  const start = text.indexOf(MARKER_START);
  if (start === -1) return text;
  const end = text.indexOf(MARKER_END);
  if (end === -1) return text.slice(0, start);
  return text.slice(0, start) + text.slice(end + MARKER_END.length);
}

function main() {
  const gitRoot = path.join(cursorRoot, ".git");
  if (!fs.existsSync(gitRoot)) {
    console.error("install-cursor-pre-commit: expected git root at", cursorRoot);
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(huskyPreCommit), { recursive: true });

  let content = stripOldBlock(readExisting()).trimEnd();
  if (!content.startsWith("#!/")) {
    content = "#!/usr/bin/env sh\n" + (content ? content + "\n" : "");
  } else if (content && !content.endsWith("\n")) {
    content += "\n";
  }
  content += "\n" + HOOK_BODY + "\n";

  fs.writeFileSync(huskyPreCommit, content, "utf8");
  try {
    fs.chmodSync(huskyPreCommit, 0o755);
  } catch {
    /* Windows may ignore */
  }

  console.log("Updated:", huskyPreCommit);
  console.log("Run once from .cursor: npm install  (registers husky via prepare)");
}

main();
