#!/usr/bin/env node
/**
 * 从源表抽前 N 行 → few-shot 夹具 xlsx
 *   node scripts/export-top5-fixture.js --from <src.xlsx> --out <dest.xlsx> [--limit 5]
 */
const fs = require('fs');
const path = require('path');
const translateNm = path.join(__dirname, '../../translate/node_modules');
if (!module.paths.includes(translateNm)) module.paths.unshift(translateNm);
const XLSX = require('xlsx');

function parseArgs(argv) {
  const out = { from: '', out: '', limit: 5 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--from') out.from = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--limit') out.limit = Number(argv[++i]) || 5;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.from || !args.out) {
    console.error('Usage: node scripts/export-top5-fixture.js --from <src.xlsx> --out <dest.xlsx> [--limit 5]');
    process.exit(2);
  }
  const wb = XLSX.readFile(path.resolve(args.from));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  const slice = rows.slice(0, args.limit);
  if (!slice.length) {
    console.error('源表无数据');
    process.exit(1);
  }
  const headers = Object.keys(slice[0]);
  const aoa = [headers, ...slice.map((r) => headers.map((h) => String(r[h] ?? '')))];
  const outWb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(outWb, ws, 'Sheet1');
  const outAbs = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outAbs), { recursive: true });
  XLSX.writeFile(outWb, outAbs);
  console.log(`写出 ${slice.length} 行 → ${outAbs}`);
}

main();
