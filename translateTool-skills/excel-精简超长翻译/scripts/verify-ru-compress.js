#!/usr/bin/env node
/**
 * 硬规则验收：字节 / CJK / 括注 / 可译英文残留
 *   node scripts/verify-ru-compress.js --in path/to.xlsx [--byte-limit 63]
 */
const fs = require('fs');
const path = require('path');
const translateNm = path.join(__dirname, '../../translate/node_modules');
if (!module.paths.includes(translateNm)) module.paths.unshift(translateNm);
const XLSX = require('xlsx');
const { validateRuCompressHard } = require('../lib/ruQualityGate');
const { utf8Len } = require('../lib/utf8Budget');

function parseArgs(argv) {
  const out = { in: '', byteLimit: 63, targetCol: '俄文翻译', sourceCol: '英文翻译' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') out.in = argv[++i];
    else if (a === '--byte-limit') out.byteLimit = Number(argv[++i]) || 63;
    else if (a === '--targetCol') out.targetCol = argv[++i];
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.in) {
    console.error('Usage: node scripts/verify-ru-compress.js --in <xlsx> [--byte-limit 63]');
    process.exit(2);
  }
  const abs = path.resolve(args.in);
  const wb = XLSX.readFile(abs);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });

  const stillOver = [];
  const cjkInRu = [];
  const residualEn = [];
  const glossParen = [];
  let maxBytes = 0;

  for (let i = 0; i < rows.length; i++) {
    const ru = String(rows[i][args.targetCol] || '');
    const en = String(rows[i][args.sourceCol] || '');
    const g = validateRuCompressHard(ru, en, args.byteLimit);
    maxBytes = Math.max(maxBytes, g.bytes || utf8Len(ru));
    const excelRow = i + 2;
    if (g.issues.some((x) => x.startsWith('over_bytes'))) stillOver.push(excelRow);
    if (g.issues.includes('cjk_in_ru')) cjkInRu.push(excelRow);
    if (g.issues.some((x) => x.startsWith('residual_en'))) residualEn.push({ row: excelRow, spans: g.residualBad });
    if (g.issues.includes('gloss_paren')) glossParen.push(excelRow);
  }

  const report = {
    file: abs,
    rows: rows.length,
    byteLimit: args.byteLimit,
    stillOver: stillOver.length,
    stillOverRows: stillOver.slice(0, 50),
    cjkInRu,
    glossParen,
    residualEn: residualEn.slice(0, 50),
    residualEnCount: residualEn.length,
    maxBytesAfter: maxBytes,
    pass:
      stillOver.length === 0 &&
      cjkInRu.length === 0 &&
      glossParen.length === 0 &&
      residualEn.length === 0
  };

  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.pass ? 0 : 1;
}

main();
