#!/usr/bin/env node
/**
 * 只读扫描 CLI（本 skill 自包含，不依赖 apex_dev）。
 *
 * 用法:
 *   node scripts/scan-menu-rules.mjs --input ./menu.json
 *   node scripts/scan-menu-rules.mjs --input ./menu.json --out ./report.json
 *   node scripts/scan-menu-rules.mjs --input ./menu.json --project-id platform
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseMenuDump, scanMenuRules } from "./lib/scan-menu-rules.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function printHelp() {
  console.log(`scan-menu-rules — 只读扫描菜单是否符合《菜单管理校验规则》（不推送）

用法:
  node ${path.relative(process.cwd(), path.join(__dirname, "scan-menu-rules.mjs")) || "scripts/scan-menu-rules.mjs"} --input <menu.json> [--out report.json] [--project-id <id>]

输入:
  菜单树 JSON（浏览器导出 / 接口 list / YAML 转换产物）

输出:
  控制台汇总 + 可选 JSON 报告；退出码 0=无违规，1=有违规，2=参数/读文件错误
`);
}

function parseArgs(argv) {
  const args = { input: "", out: "", projectId: "", help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--input" || a === "-i") args.input = argv[++i] ?? "";
    else if (a === "--out" || a === "-o") args.out = argv[++i] ?? "";
    else if (a === "--project-id") args.projectId = argv[++i] ?? "";
  }
  return args;
}

function summarize(hits) {
  const byCode = new Map();
  for (const h of hits) {
    byCode.set(h.code, (byCode.get(h.code) ?? 0) + 1);
  }
  console.log("\n按规则码汇总:");
  for (const [code, n] of [...byCode.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    console.log(`  ${code.padEnd(16)} ${n}`);
  }
  console.log(`\n合计违规 ${hits.length} 条`);
  console.log(`
解读建议（对照《菜单管理校验规则》；不以 seccenter 仓库为准）：
  route.syntax     → path 语法 / dir·page 禁 *
  route.dup        → 同项目 directory|page 的 route_path 唯一
  route.combo      → directory|page 的 route_path+params 全库唯一
  route.anc        → function 不得与父链 path 相同
  perm.empty       → function 必填 perm
  perm.sibling     → 同 parent_id 下 perm 唯一（允许跨父复用）
  perm.mustEmpty   → 非 function 不得有 perm
  params.invalid   → page params 条目格式
  params.mustEmpty → 非 page 的 params 必须为空
`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.input) {
    printHelp();
    process.exit(args.help ? 0 : 2);
  }

  const inputPath = path.resolve(args.input);
  if (!fs.existsSync(inputPath)) {
    console.error(`找不到输入文件: ${inputPath}`);
    process.exit(2);
  }

  let raw;
  try {
    raw = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  } catch (e) {
    console.error(`JSON 解析失败: ${e.message}`);
    process.exit(2);
  }

  let tree;
  try {
    tree = parseMenuDump(raw);
  } catch (e) {
    console.error(e.message);
    process.exit(2);
  }

  const hits = scanMenuRules(tree, {
    projectId: args.projectId || undefined,
  });

  console.log(`输入: ${inputPath}`);
  console.log(`节点树根数: ${tree.length}`);
  if (args.projectId) console.log(`过滤 projectId: ${args.projectId}`);

  if (hits.length === 0) {
    console.log("\n未发现违规（对照《菜单管理校验规则》文档）");
  } else {
    console.log("\n违规明细:");
    for (const h of hits) {
      const detail = h.detail ? ` | ${h.detail}` : "";
      console.log(
        `- [${h.source}/${h.code}] id=${h.id} type=${h.type} name=${JSON.stringify(h.name)} path=${h.routePath || "-"} perm=${h.perm || "-"} proj=${h.projectId || "-"} :: ${h.message}${detail}`
      );
    }
    summarize(hits);
  }

  if (args.out) {
    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(
      outPath,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          input: inputPath,
          projectId: args.projectId || null,
          hitCount: hits.length,
          hits,
        },
        null,
        2
      ),
      "utf-8"
    );
    console.log(`\n报告已写: ${outPath}`);
  }

  process.exit(hits.length > 0 ? 1 : 0);
}

main();
