import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const files = [
  "agents.md",
  "CHATGPT.md",
  "GEMINI.md",
  "common-skills/obsidian-skills/README.md",
  "common-skills/obsidian-skills/intention-skills/route-obsidian/README.md",
  "common-skills/obsidian-skills/intention-skills/route-obsidian/SKILL.md",
  "common-skills/obsidian-skills/intention-skills/route-obsidian/evals/evals.json",
];
const requiredPhrases = new Map([
  ["agents.md", "工具调用次数不设固定硬上限"],
  ["CHATGPT.md", "工具调用次数不设固定硬上限"],
  ["GEMINI.md", "工具调用次数不设固定硬上限"],
  ["common-skills/obsidian-skills/README.md", "工具调用次数不设固定硬上限"],
  ["common-skills/obsidian-skills/intention-skills/route-obsidian/README.md", "工具调用次数不设固定硬上限"],
  ["common-skills/obsidian-skills/intention-skills/route-obsidian/SKILL.md", "工具调用次数不设固定硬上限"],
  ["common-skills/obsidian-skills/intention-skills/route-obsidian/evals/evals.json", "不因调用次数停止；沿当前可行路径继续"],
]);

const forbidden = [
  /Token\s*(?:硬)?止损/iu,
  /(?:超过|累计|>+)\s*20\s*(?:次)?\s*个?工具.{0,50}(?:停止|止损|不得继续)/iu,
  /(?:调用|工具调用).{0,30}(?:超过|累计|>+)\s*20.{0,50}(?:停止|止损|不得继续)/iu,
];

const legacyExamples = [
  "Token 硬止损：连续调用超过 20 个工具仍未完成 → 停止并给出中间结论",
  "| Token 止损 | >20 个工具调用未解决 → 停止并报告 |",
  "连续调用超过 20 个工具仍未完成 → 停止并给出中间结论",
  ">20 个工具调用未解决 → 停止并报告",
];
if (legacyExamples.some((line) => !forbidden.some((pattern) => pattern.test(line)))) {
  console.error("规则检查器自测失败：未能识别旧版固定次数停止措辞。");
  process.exitCode = 1;
}

const violations = [];
for (const file of files) {
  const contents = readFileSync(resolve(file), "utf8");
  if (!contents.includes(requiredPhrases.get(file))) {
    violations.push(`${file}: 缺少按进展收敛的规则或评测预期。`);
  }
  for (const [index, line] of contents.split(/\r?\n/u).entries()) {
    if (forbidden.some((pattern) => pattern.test(line))) {
      violations.push(`${file}:${index + 1}: ${line.trim()}`);
    }
  }
}

if (violations.length > 0) {
  console.error("检测到按工具调用次数强制停止的旧规则，请改为按有效进展和真实阻塞判断：");
  console.error(violations.join("\n"));
  process.exitCode = 1;
} else {
  console.log("规则检查通过：没有固定工具调用次数的强制停止规则。");
}
