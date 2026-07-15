const fs = require('fs');
const p = process.argv[2];
if (!fs.existsSync(p)) {
  console.log(JSON.stringify({ missing: true, path: p }));
  process.exit(0);
}
const lines = fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
const header = lines[0];
const cols = [];
let cur = '', q = false;
for (const ch of header) {
  if (ch === '"') q = !q;
  else if (ch === ',' && !q) { cols.push(cur); cur = ''; }
  else cur += ch;
}
cols.push(cur);
const ri = cols.indexOf('俄文翻译');

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

let filled = 0, empty = 0;
for (let i = 1; i < lines.length; i++) {
  const row = parseLine(lines[i]);
  const ru = String(row[ri] || '').trim();
  if (ru) filled++;
  else empty++;
}
console.log(JSON.stringify({
  rows: lines.length - 1,
  filled,
  empty,
  pct: ((filled / (lines.length - 1)) * 100).toFixed(1)
}));
