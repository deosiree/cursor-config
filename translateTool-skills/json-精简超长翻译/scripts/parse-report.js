// parse-report.js — Parse .report files for v2 object data
// KEY: interpretation length/limit are UTF-8 BYTES, not character counts
// Usage:
//   node parse-report.js <report_file> [--dedupe-stats]
//   node parse-report.js <report_file> --write-dic <outPath> [--shorten-map <jsonPath>]
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

/** 去重键：source|tag */
function entryKey(entry) {
  return (entry.source || "") + "|" + (entry.tag || "");
}

/**
 * 按 source|tag 去重 parsed entries，保留首次出现
 * @returns {{ unique: object[], duplicates: number, warnings: string[] }}
 */
function dedupeBySourceTag(entries) {
  const seen = new Map();
  const warnings = [];
  let duplicates = 0;

  for (const item of entries) {
    const key = entryKey(item);
    if (seen.has(key)) {
      duplicates++;
      const prev = seen.get(key);
      if (prev.langText !== item.langText) {
        warnings.push(
          "Conflict at " + key + ": keeping first translation, ignoring variant"
        );
      }
      continue;
    }
    seen.set(key, item);
  }

  return { unique: [...seen.values()], duplicates, warnings };
}

/**
 * 从 .report 构建去重后的 .dic 数组
 * @param {string} reportPath
 * @param {object} [shortenMap] - 可选，{ "source|tag": "缩短后译文" } 或 { "source": "缩短后译文" }
 * @param {object} [refDicMap] - 可选，{ "source|tag": "ru_RU" } 参考映射
 */
function buildDicFromReport(reportPath, shortenMap, refDicMap) {
  const { entries, errors } = parseReport(reportPath);
  if (errors.length > 0) {
    throw new Error("Parse errors: " + errors.map(e => e.error).join("; "));
  }

  const seen = new Map();
  const warnings = [];
  let duplicates = 0;

  for (const e of entries) {
    const key = entryKey(e);
    if (seen.has(key)) {
      duplicates++;
      const prevRu = seen.get(key).translation[e.langKey];
      if (prevRu !== e.langText) {
        warnings.push("Conflict at " + key + ": keeping first translation");
      }
      continue;
    }

    const entry = { ...e.originalEntry };
    let ruText = e.langText;

    if (refDicMap && refDicMap[key]) ruText = refDicMap[key];
    if (shortenMap) {
      if (shortenMap[key]) ruText = shortenMap[key];
      else if (shortenMap[e.source]) ruText = shortenMap[e.source];
    }

    entry.translation = { ...entry.translation, [e.langKey]: ruText };
    seen.set(key, entry);
  }

  return {
    dic: [...seen.values()],
    rawCount: entries.length,
    uniqueCount: seen.size,
    duplicates,
    warnings,
  };
}

/** 逐条回验 dic（需配合 report 的 actualMax） */
function verifyDicAgainstReport(reportPath, dicEntries) {
  const { entries, errors } = parseReport(reportPath);
  if (errors.length > 0) throw new Error("Parse errors in verify");

  const dicMap = new Map(dicEntries.map(e => [entryKey(e), e.translation[Object.keys(e.translation).find(k => e.translation[k])]]));
  const limits = new Map();
  for (const e of entries) {
    const key = entryKey(e);
    if (!limits.has(key)) limits.set(key, e.actualMax);
  }

  let pass = 0, fail = 0, fails = [];
  for (const [key, actualMax] of limits) {
    const text = dicMap.get(key);
    if (text === undefined) {
      fail++;
      fails.push({ key, error: "missing in dic" });
      continue;
    }
    const bytes = utf8ByteLen(text);
    if (bytes <= actualMax) pass++;
    else {
      fail++;
      fails.push({ key, bytes, actualMax, text });
    }
  }
  return { pass, fail, fails, expectedCount: limits.size };
}

function parseCliArgs(argv) {
  const opts = { dedupeStats: false, writeDic: null, shortenMap: null, reportFile: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dedupe-stats") opts.dedupeStats = true;
    else if (arg === "--write-dic") opts.writeDic = argv[++i];
    else if (arg === "--shorten-map") opts.shortenMap = JSON.parse(fs.readFileSync(argv[++i], "utf-8"));
    else if (!arg.startsWith("--") && !opts.reportFile) opts.reportFile = arg;
  }
  return opts;
}

function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  if (!opts.reportFile) {
    console.error("Usage: node parse-report.js <report_file> [--dedupe-stats] [--write-dic <outPath>] [--shorten-map <jsonPath>]");
    process.exit(1);
  }

  const result = parseReport(opts.reportFile);
  const { unique, duplicates, warnings } = dedupeBySourceTag(result.entries);

  console.log("Entries: " + result.entries.length + ", Errors: " + result.errors.length);
  if (opts.dedupeStats || duplicates > 0) {
    console.log("Unique (source|tag): " + unique.length + ", Duplicates removed: " + duplicates);
  }
  if (warnings.length > 0) {
    console.log("Warnings:");
    for (const w of warnings) console.log("  " + w);
  }

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

  if (opts.writeDic) {
    const built = buildDicFromReport(opts.reportFile, opts.shortenMap);
    fs.mkdirSync(require("path").dirname(opts.writeDic), { recursive: true });
    fs.writeFileSync(opts.writeDic, JSON.stringify(built.dic, null, 2), "utf-8");
    console.log("Wrote " + built.uniqueCount + " entries to " + opts.writeDic + " (from " + built.rawCount + " raw)");
  }
}

if (require.main === module) main();
module.exports = { parseReport, calcCharBudget, utf8ByteLen, entryKey, dedupeBySourceTag, buildDicFromReport, verifyDicAgainstReport };
