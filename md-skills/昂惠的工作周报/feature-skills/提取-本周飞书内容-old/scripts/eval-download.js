#!/usr/bin/env node

/**
 * 测评: 提取-本周飞书内容 — 下载结果 vs 模板比对
 *
 * 被测对象: 提取-本周飞书内容 skill（内部调用 OpenCLI-下载飞书文档）
 *
 * 流程:
 *   1. 运行下载 → 生成 template/snapshot/飞书文档-全文缓存.md
 *   2. 读取下载结果
 *   3. 读取模板 references/飞书文档-全文缓存-template.md
 *   4. 文本比对，输出结论
 *
 * 约束: 下载过程中不得读取模板文件
 *
 * 用法:
 *   node scripts/eval-download.js
 *
 * 退出码:
 *   0  完全一致 ✅
 *   1  部分差异 ⚠️
 *   2  完全不一致 ❌
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");

const DOWNLOAD_PATH = path.join(ROOT, "template", "snapshot", "飞书文档-全文缓存.md");
const TEMPLATE_PATH = path.join(ROOT, "references", "飞书文档-全文缓存-template.md");

// ─── 辅助 ─────────────────────────────────────────────────

function readOrDie(filePath, label) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${label} 不存在: ${filePath}`);
    process.exit(2);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  if (!raw.trim()) {
    console.error(`❌ ${label} 为空: ${filePath}`);
    process.exit(2);
  }
  return raw;
}

function stats(raw) {
  const lines = raw.split("\n");
  return {
    bytes: Buffer.byteLength(raw, "utf-8"),
    lines: lines.length,
    nonEmptyLines: lines.filter((l) => l.trim()).length,
  };
}

// ─── 比对 ─────────────────────────────────────────────────

function compare(downloadRaw, templateRaw) {
  const dLines = downloadRaw.split("\n");
  const tLines = templateRaw.split("\n");

  const maxLen = Math.max(dLines.length, tLines.length);
  let matchCount = 0;
  let diffCount = 0;
  const diffs = [];

  for (let i = 0; i < maxLen; i++) {
    const dl = (dLines[i] || "").trimEnd();
    const tl = (tLines[i] || "").trimEnd();
    if (dl === tl) {
      matchCount++;
    } else {
      diffCount++;
      if (diffs.length < 20) {
        diffs.push({ line: i + 1, download: dl.slice(0, 120), template: tl.slice(0, 120) });
      }
    }
  }

  // 字节级相似度
  const commonBytes = [...downloadRaw].filter((ch, i) => ch === templateRaw[i]).length;
  const maxBytes = Math.max(downloadRaw.length, templateRaw.length);
  const byteSimilarity = maxBytes > 0 ? (commonBytes / maxBytes * 100).toFixed(1) : "0.0";

  return { matchCount, diffCount, diffs, byteSimilarity, totalLines: maxLen };
}

// ─── 主流程 ───────────────────────────────────────────────

console.log("=".repeat(60));
console.log("🧪 测评: 提取-本周飞书内容 → 下载结果 vs 模板");
console.log("=".repeat(60));

// Step 1: 检查下载结果是否存在（下载已在上一步完成）
console.log("\n📥 下载结果: " + DOWNLOAD_PATH);
const downloadRaw = readOrDie(DOWNLOAD_PATH, "下载结果");
const dStats = stats(downloadRaw);
console.log(`   大小: ${(dStats.bytes / 1024).toFixed(1)} KB, 行数: ${dStats.lines}, 非空行: ${dStats.nonEmptyLines}`);

// Step 2: 读取模板
console.log("\n📋 模板: " + TEMPLATE_PATH);
const templateRaw = readOrDie(TEMPLATE_PATH, "模板");
const tStats = stats(templateRaw);
console.log(`   大小: ${(tStats.bytes / 1024).toFixed(1)} KB, 行数: ${tStats.lines}, 非空行: ${tStats.nonEmptyLines}`);

// Step 3: 比对
console.log("\n🔍 文本比对...");
const result = compare(downloadRaw, templateRaw);

console.log(`   总行数: ${result.totalLines}`);
console.log(`   匹配行: ${result.matchCount}`);
console.log(`   差异行: ${result.diffCount}`);
console.log(`   字节相似度: ${result.byteSimilarity}%`);

// Step 4: 输出差异详情
if (result.diffs.length > 0) {
  console.log("\n📌 差异详情 (前 20 条):");
  console.log("-".repeat(80));
  for (const d of result.diffs) {
    console.log(`  行 ${d.line}:`);
    console.log(`    下载: ${d.download || "(空)"}`);
    console.log(`    模板: ${d.template || "(空)"}`);
    console.log();
  }
}

// Step 5: 结论
console.log("=".repeat(60));
if (result.diffCount === 0 && dStats.bytes === tStats.bytes) {
  console.log("✅ 通过 — 下载结果与模板完全一致");
  process.exit(0);
} else if (result.diffCount === result.totalLines) {
  console.log("❌ 完全不一致 — 需修改通用下载 skill (OpenCLI-下载飞书文档) 修复");
  process.exit(2);
} else {
  const diffPct = ((result.diffCount / result.totalLines) * 100).toFixed(1);
  console.log(`⚠️ 部分差异 — ${result.diffCount} 行不一致 (${diffPct}%)，字节相似度 ${result.byteSimilarity}%`);
  process.exit(1);
}
