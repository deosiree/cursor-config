#!/usr/bin/env node
/**
 * Clear 俄文翻译 cells that look like English echo (RU===EN or no Cyrillic),
 * so resume without --force can retranslate them.
 *
 * Usage:
 *   node scripts/clear-en-echo-ru.js --in path/to/*_RU机翻.xlsx [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { validateEn2RuNotEcho } = require('../translateCsv.js');

function parseArgs(argv) {
  const out = { in: '', dryRun: false, sourceCol: '英文翻译', targetCol: '俄文翻译' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') out.in = argv[++i];
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--sourceCol') out.sourceCol = argv[++i];
    else if (a === '--targetCol') out.targetCol = argv[++i];
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.in) {
    console.error('Usage: node scripts/clear-en-echo-ru.js --in <xlsx> [--dry-run]');
    process.exit(2);
  }
  const abs = path.resolve(args.in);
  if (!fs.existsSync(abs)) throw new Error('file not found: ' + abs);

  const wb = XLSX.readFile(abs);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  let cleared = 0;
  const samples = [];
  for (const r of rows) {
    const src = String(r[args.sourceCol] || '');
    const tgt = String(r[args.targetCol] || '');
    if (!tgt.trim()) continue;
    const v = validateEn2RuNotEcho(src, tgt);
    if (!v.isValid) {
      cleared += 1;
      if (samples.length < 8) {
        samples.push({ id: r.id, src: src.slice(0, 60), tgt: tgt.slice(0, 60), issues: v.issues });
      }
      if (!args.dryRun) {
        r[args.targetCol] = '';
        const note = String(r['备注1'] || '').trim();
        const tag = '已清空:疑似英文回显待重译';
        r['备注1'] = note.includes(tag) ? note : [note, tag].filter(Boolean).join('; ');
      }
    }
  }

  console.log(JSON.stringify({ file: abs, dryRun: args.dryRun, cleared, samples }, null, 2));

  if (!args.dryRun && cleared > 0) {
    const bak = abs.replace(/(\.xlsx?)$/i, `_preClearEcho$1`);
    fs.copyFileSync(abs, bak);
    const next = XLSX.utils.json_to_sheet(rows);
    wb.Sheets[sheetName] = next;
    XLSX.writeFile(wb, abs);
    console.log('Backup:', bak);
    console.log('Cleared in-place:', abs);
  }
}

main();
