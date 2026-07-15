const fs = require('fs');
const p = process.argv[2];
const lines = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);

function parseLine(line) {
  const out = [];
  let c = '', inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if (ch === ',' && !inQ) { out.push(c); c = ''; }
    else c += ch;
  }
  out.push(c);
  return out;
}

const h = parseLine(lines[0]);
const iCi = h.indexOf('词条');
const iEn = h.indexOf('英文翻译');
const iRu = h.indexOf('俄文翻译');
const iNote = h.indexOf('备注1');

let emptyNoSrc = 0, emptyHasSrc = 0, emptyWithFailNote = 0;
const samples = [];
for (let i = 1; i < lines.length; i++) {
  const row = parseLine(lines[i]);
  const ru = String(row[iRu] || '').trim();
  if (ru) continue;
  const ci = String(row[iCi] || '').trim();
  const en = String(row[iEn] || '').trim();
  const note = String(row[iNote] || '').trim();
  const hasSrc = !!(ci || en);
  if (!hasSrc) emptyNoSrc++;
  else {
    emptyHasSrc++;
    if (/翻译失败/.test(note)) emptyWithFailNote++;
    if (samples.length < 8) samples.push({ id: row[0], ci: ci.slice(0, 60), en: en.slice(0, 60), note: note.slice(0, 80) });
  }
}
console.log(JSON.stringify({ emptyNoSrc, emptyHasSrc, emptyWithFailNote, samples }, null, 2));
