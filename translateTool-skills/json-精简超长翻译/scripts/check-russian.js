#!/usr/bin/env node

/**
 * check-russian.js — 检测/回验俄语翻译词条的 UTF-8 字节长度
 *
 * detect 模式：递归扫描 JSON，检测超长词条，输出字符预算
 * verify 模式：回验缩短结果是否合规，通过则写输出到 _old 目录
 *
 * 用法:
 *   node check-russian.js --mode detect --input <path> [--field-path <path>] [--byte-limit <n>]
 *   node check-russian.js --mode verify --input <path> [--field-path <path>] [--byte-limit <n>] [--output-suffix <s>]
 */

const fs = require('fs');
const path = require('path');

// ──── 参数解析 ────
function parseArgs() {
  const args = {};
  const raw = process.argv.slice(2);
  for (let i = 0; i < raw.length; i++) {
    if (raw[i].startsWith('--')) {
      const key = raw[i].replace(/^--/, '');
      const val = raw[i + 1] && !raw[i + 1].startsWith('--') ? raw[i + 1] : true;
      args[key] = val;
      if (val !== true) i++;
    }
  }
  return {
    mode: args.mode || 'detect',
    input: args.input || args['input-path'] || '',
    fieldPath: args['field-path'] || 'translation.ru_RU',
    byteLimit: parseInt(args['byte-limit'], 10) || 63,
    outputSuffix: args['output-suffix'] || '_old',
  };
}

// ──── 工具函数 ────

/** 计算字符串的 UTF-8 字节长度 */
function utf8ByteLen(str) {
  return Buffer.byteLength(str, 'utf-8');
}

/** 按点号路径从对象中取值 */
function getFieldByPath(obj, fieldPath) {
  const keys = fieldPath.split('.');
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    // 处理数组：如果当前值是数组，对每个元素递归
    if (Array.isArray(current)) {
      return current.map(item => getFieldByPath(item, fieldPath));
    }
    current = current[key];
  }
  return current;
}

/** 按点号路径设置对象中的值 */
function setFieldByPath(obj, fieldPath, value) {
  const keys = fieldPath.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}

/** 判断字符串是否为纯 ASCII / 单字节字符 */
function isSingleByteChar(ch) {
  return ch.charCodeAt(0) < 128;
}

/**
 * 计算俄语字符预算
 * 公式: byteLimit - 已有单字节字符数(空格/标点/数字) 后 ÷ 2
 * 结果向下取整 = 可写入的俄文字母数
 */
function calcCharBudget(text, byteLimit) {
  const singleByteCount = [...text].filter(isSingleByteChar).length;
  const remaining = byteLimit - singleByteCount;
  return Math.max(0, Math.floor(remaining / 2));
}

/** 递归查找目录下所有 .json 文件 */
function findJsonFiles(rootPath) {
  const results = [];
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.json')) {
        results.push(fullPath);
      }
    }
  }
  walk(rootPath);
  return results;
}

/** 读取并解析 JSON 文件 */
function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/** 获取输入的规范路径 */
function resolveInput(inputPath) {
  const absPath = path.resolve(inputPath);
  const isDir = fs.statSync(absPath).isDirectory();
  return { absPath, isDir };
}

// ──── DETECT 模式 ────

function runDetect(config) {
  const { input, fieldPath, byteLimit } = config;
  const { absPath, isDir } = resolveInput(input);

  const files = isDir ? findJsonFiles(absPath) : [absPath];
  const report = {
    inputPath: absPath,
    totalFiles: files.length,
    totalEntries: 0,
    overlongCount: 0,
    fieldPath,
    byteLimit,
    overlongEntries: [],
    files: [],
  };

  for (const filePath of files) {
    let data;
    try {
      data = readJson(filePath);
    } catch (e) {
      report.files.push({
        file: filePath,
        error: `无法解析 JSON: ${e.message}`,
      });
      continue;
    }

    if (!Array.isArray(data)) {
      report.files.push({
        file: filePath,
        error: 'JSON 根节点不是数组，跳过',
      });
      continue;
    }

    const fileReport = { file: filePath, entries: [] };
    let hasAny = false;

    for (let i = 0; i < data.length; i++) {
      const ruText = getFieldByPath(data[i], fieldPath);
      if (typeof ruText !== 'string') continue;

      hasAny = true;
      const bytes = utf8ByteLen(ruText);
      const overBy = bytes - byteLimit;
      const charBudget = calcCharBudget(ruText, byteLimit);

      const entryInfo = {
        index: i,
        source: data[i].source || data[i].key || data[i].id || '',
        originalText: ruText,
        bytes,
        limit: byteLimit,
        overBy: overBy > 0 ? overBy : 0,
        charBudget,
        overlong: bytes > byteLimit,
      };

      fileReport.entries.push(entryInfo);

      if (bytes > byteLimit) {
        report.overlongCount++;
        report.overlongEntries.push(entryInfo);
      }
    }

    if (hasAny) report.totalEntries += fileReport.entries.length;
    report.files.push(fileReport);
  }

  return report;
}

// ──── VERIFY 模式 ────

function runVerify(config) {
  const { input, fieldPath, byteLimit, outputSuffix } = config;
  const { absPath, isDir } = resolveInput(input);

  const files = isDir ? findJsonFiles(absPath) : [absPath];
  const result = {
    passed: true,
    failedEntries: [],
    outputPath: '',
    files: [],
  };

  // 计算输出根目录
  let outputRoot;
  if (isDir) {
    outputRoot = absPath + outputSuffix;
  } else {
    outputRoot = path.dirname(absPath) + outputSuffix;
  }

  for (const filePath of files) {
    let data;
    try {
      data = readJson(filePath);
    } catch (e) {
      result.passed = false;
      result.files.push({ file: filePath, error: `无法解析 JSON: ${e.message}` });
      continue;
    }

    if (!Array.isArray(data)) {
      result.files.push({ file: filePath, error: 'JSON 根节点不是数组，跳过' });
      continue;
    }

    const fileResult = { file: filePath, entries: [], allPassed: true };

    for (let i = 0; i < data.length; i++) {
      const ruText = getFieldByPath(data[i], fieldPath);
      if (typeof ruText !== 'string') continue;

      const bytes = utf8ByteLen(ruText);
      const ok = bytes <= byteLimit;
      const entryCheck = {
        index: i,
        source: data[i].source || data[i].key || data[i].id || '',
        bytes,
        limit: byteLimit,
        passed: ok,
      };
      fileResult.entries.push(entryCheck);

      if (!ok) {
        fileResult.allPassed = false;
        result.passed = false;
        result.failedEntries.push(entryCheck);
      }
    }

    result.files.push(fileResult);

    // 如果此文件全部合规，写输出
    if (fileResult.allPassed) {
      // 计算相对路径
      let relativePath;
      if (isDir) {
        relativePath = path.relative(absPath, filePath);
      } else {
        relativePath = path.basename(filePath);
      }
      const outPath = path.join(outputRoot, relativePath);
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
      fileResult.outputPath = outPath;
    }
  }

  result.outputPath = outputRoot;
  return result;
}

// ──── 主入口 ────

function main() {
  const config = parseArgs();

  if (!config.input) {
    console.error('错误: --input 是必填参数');
    process.exit(1);
  }

  if (!fs.existsSync(config.input)) {
    console.error(`错误: 输入路径不存在: ${config.input}`);
    process.exit(1);
  }

  if (config.mode === 'detect') {
    const report = runDetect(config);
    console.log(JSON.stringify(report, null, 2));
  } else if (config.mode === 'verify') {
    const result = runVerify(config);
    console.log(JSON.stringify(result, null, 2));
    if (!result.passed) {
      process.exit(1);
    }
  } else {
    console.error(`错误: 未知模式 "${config.mode}"，支持 detect / verify`);
    process.exit(1);
  }
}

main();
