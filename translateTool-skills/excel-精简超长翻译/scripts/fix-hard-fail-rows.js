#!/usr/bin/env node
const path = require('path');
const translateNm = path.join(__dirname, '../../translate/node_modules');
if (!module.paths.includes(translateNm)) module.paths.unshift(translateNm);
const XLSX = require('xlsx');
const { validateRuCompressHard, stripEn2RuEnglishGlossParen } = require('../lib/ruQualityGate');
const { utf8Len, truncateUtf8Boundary } = require('../lib/utf8Budget');
const { resolveVerifyWorker, writeXlsxPreviewFile } = require('../lib/workers');

async function main() {
  const xlsxPath = path.resolve(process.argv[2] || '');
  if (!xlsxPath) {
    console.error('Usage: node scripts/fix-hard-fail-rows.js <xlsx>');
    process.exit(2);
  }
  const wb = XLSX.readFile(xlsxPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
  const headers = Object.keys(rows[0] || {});
  const fail = [];
  for (let i = 0; i < rows.length; i++) {
    const g = validateRuCompressHard(rows[i]['俄文翻译'], rows[i]['英文翻译'], 63);
    if (!g.ok) fail.push({ i, issues: g.issues, en: rows[i]['英文翻译'], zh: rows[i]['词条'], ru: rows[i]['俄文翻译'] });
  }
  console.log('hardFail', fail.length);
  if (!fail.length) return;

  const worker = resolveVerifyWorker();
  for (const f of fail) {
    const prompt = [
      '缩短并净化下面俄文到 UTF-8≤63 字节。禁止中文；禁止可译英文残留（如 Dic/token/Run 须译成俄语）。只输出俄文一行，无序号。',
      `EN: ${f.en}`,
      `ZH: ${f.zh}`,
      `RU: ${f.ru}`
    ].join('\n');
    let text = String(await worker.callSingle(prompt) || '')
      .trim()
      .replace(/^\d+[.、]\s*/, '');
    text = stripEn2RuEnglishGlossParen(text).text.trim();
    if (utf8Len(text) > 63) text = truncateUtf8Boundary(text, 63);
    const g = validateRuCompressHard(text, f.en, 63);
    console.log(`row ${f.i + 2}: ${g.ok ? 'OK' : g.issues.join('|')} | ${text}`);
    rows[f.i]['俄文翻译'] = g.ok ? g.text : text;
  }
  writeXlsxPreviewFile(xlsxPath, headers, rows);
  const clean = path.join(path.dirname(xlsxPath), '俄文都压缩到63个字符_已压63.xlsx');
  writeXlsxPreviewFile(clean, headers, rows);
  console.log('wrote', xlsxPath);
  console.log('wrote', clean);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
