// parse-report.js — Parse .report files for v2 object data
// KEY: interpretation length/limit are UTF-8 BYTES, not character counts
// Usage: node parse-report.js <report_file>
const fs = require("fs");

function utf8ByteLen(str) {
  return Buffer.byteLength(str, "utf-8");
}

/** 判断字符是否为单字节（ASCII） */
function isSingleByteChar(ch) {
  return ch.charCodeAt(0) < 128;
}

/**
 * 计算俄语字符预算（复用 v1 check-russian.js 的逻辑）
 * byteLimit 减去已有单字节字符数后 ÷ 2 = 可写入的俄文字母数
 */
function calcCharBudget(text, byteLimit) {
  const singleByteCount = [...text].filter(isSingleByteChar).length;
  const remaining = byteLimit - singleByteCount;
  return Math.max(0, Math.floor(remaining / 2));
}

function parseReport(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(content); // .report 是 JSON 数组格式

  if (!Array.isArray(data)) {
    return { entries: [], errors: [{ line: 0, error: "Report is not a JSON array" }] };
  }

  const entries = [], errors = [];

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const entry = item.entry;
    if (!entry || !entry.translation) {
      errors.push({ line: i + 1, error: "Missing entry.translation" });
      continue;
    }

    // Auto-detect lang key
    const keys = Object.keys(entry.translation);
    const langKey = keys.find(k => entry.translation[k] && typeof entry.translation[k] === "string");
    if (!langKey) {
      errors.push({ line: i + 1, error: "No valid translation key" });
      continue;
    }
    const langText = entry.translation[langKey];

    // Parse interpretation
    const interp = item.interpretation || "";
    const match = interp.match(/译文长度:(\d+),限制:(\d+)/);
    if (!match) {
      errors.push({ line: i + 1, error: "interpretation format invalid: " + interp });
      continue;
    }

    const currentBytes = parseInt(match[1], 10);  // UTF-8 字节数
    const maxBytes = parseInt(match[2], 10);       // UTF-8 字节上限
    const actualMax = maxBytes - 1;                // 开区间

    const actualBytes = utf8ByteLen(langText);     // 实际 UTF-8 字节数
    const overBy = actualBytes - actualMax;
    const charBudget = calcCharBudget(langText, actualMax);

    entries.push({
      source: entry.source || "",
      tag: entry.tag || "",
      langKey,
      langText,
      interpCurrentBytes: currentBytes,            // interpretation 中声明的字节数
      maxBytes,
      actualMax,                                   // 实际最大字节（开区间）
      actualBytes,                                 // 实际 UTF-8 字节数
      overBy,
      charBudget,                                  // 可写入俄文字母数
      originalEntry: entry,
    });
  }

  return { entries, errors };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error("Usage: node parse-report.js <report_file>");
    process.exit(1);
  }
  const result = parseReport(args[0]);

  // 简洁输出
  console.log("Entries: " + result.entries.length + ", Errors: " + result.errors.length);
  const overlong = result.entries.filter(e => e.overBy > 0);
  console.log("Overlong: " + overlong.length);
  for (const e of overlong) {
    console.log("  [" + e.source + "] " + e.actualBytes + "/" + e.actualMax + "B (budget:" + e.charBudget + " Cyr) " + e.langText);
  }
  if (result.errors.length > 0) {
    console.log("\nErrors:");
    for (const e of result.errors) {
      console.log("  Line " + e.line + ": " + e.error);
    }
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { parseReport, calcCharBudget, utf8ByteLen };
