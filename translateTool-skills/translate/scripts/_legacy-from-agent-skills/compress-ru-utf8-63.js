#!/usr/bin/env node
/**
 * Compress 俄文翻译 to UTF-8 byte length ≤ 63 (C++ strlen / UTF-8 source size).
 * Standalone: does not load translateCsv.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const XLSX = require('xlsx');
const axios = require('axios');

const MAX_BYTES = 63;
const ROOT = path.resolve(__dirname, '../../..');
const SRC =
  process.argv[2] ||
  'F:/Documents/Repertory/Sieyuan/暂放/翻译工具文档/平台-测试部/mon-1.9.0/重导后再检查对象数据和元数据/对象数据和元数据都不超过63/俄文都压缩到63个字符.xlsx';

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnvFile(path.join(ROOT, '.env'));
loadDotEnvFile(path.join(ROOT, '.env.local'));

const TLS_INSECURE = !['0', 'false', 'no', 'off'].includes(
  String(process.env.TRANSLATE_TLS_INSECURE === undefined ? '1' : process.env.TRANSLATE_TLS_INSECURE).toLowerCase()
);
const HTTPS_AGENT = new https.Agent({ rejectUnauthorized: !TLS_INSECURE });

function utf8Len(s) {
  return Buffer.byteLength(String(s || ''), 'utf8');
}

function truncateUtf8(s, maxBytes) {
  let buf = Buffer.from(String(s || ''), 'utf8');
  if (buf.length <= maxBytes) return buf.toString('utf8');
  buf = buf.subarray(0, maxBytes);
  while (buf.length > 0) {
    const t = buf.toString('utf8');
    if (t.includes('\uFFFD')) {
      buf = buf.subarray(0, buf.length - 1);
      continue;
    }
    return t;
  }
  return '';
}

function chatUrl(base) {
  const b = String(base || '').replace(/\/$/, '');
  return /\/chat\/completions$/i.test(b) ? b : `${b}/chat/completions`;
}

async function callDeepseek(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY missing');
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';
  const url = chatUrl(process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com');
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const response = await axios.post(
        url,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'You compress Russian UI strings to fit UTF-8 byte limits for C++.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 8000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          timeout: 180000,
          httpsAgent: HTTPS_AGENT
        }
      );
      const text = response.data?.choices?.[0]?.message?.content;
      if (!text) throw new Error('empty response');
      return String(text).trim();
    } catch (e) {
      lastErr = e;
      const detail = e.response?.data
        ? JSON.stringify(e.response.data).slice(0, 200)
        : e.message;
      if (attempt < 4) {
        await new Promise((r) => setTimeout(r, 1500 * attempt));
        continue;
      }
      throw new Error(`DeepSeek failed: ${detail}`);
    }
  }
  throw lastErr;
}

function buildPrompt(chunk) {
  const list = chunk
    .map((x, i) => `${i + 1}. ZH:${x.zh} | EN:${x.en} | RU:${x.ru} | bytes=${x.bytes}`)
    .join('\n');
  return `把下面每条俄文压缩，使 UTF-8 字节长度 ≤ ${MAX_BYTES}（C++ strlen：西里尔约 2 字节/字，ASCII 1 字节）。

规则：
1. 西里尔俄语为主，可保留 ASCII 专名/_app2/TDB/下划线分段
2. 必须 ≤ ${MAX_BYTES} UTF-8 字节，尽量保原意
3. 禁止中文与英括注
4. 每行：序号. 压缩后俄文

${list}
`;
}

function parseNumbered(raw, n) {
  const by = new Map();
  for (const line of String(raw || '').split(/\r?\n/)) {
    const m = line.trim().match(/^(\d+)[.、:)]\s*(.+)$/);
    if (!m) continue;
    const idx = Number(m[1]);
    if (idx < 1 || idx > n) continue;
    let ru = m[2].trim().replace(/^["「]|["」]$/g, '');
    ru = ru.replace(/\s*\([^)]*[A-Za-z]{3,}[^)]*\)\s*$/, '').trim();
    by.set(idx, ru);
  }
  return by;
}

async function main() {
  const abs = path.resolve(SRC);
  if (!fs.existsSync(abs)) throw new Error('not found: ' + abs);

  console.log('MAX_BYTES', MAX_BYTES, 'model', process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash');

  const bak = abs.replace(/(\.xlsx?)$/i, `_preCompress63$1`);
  if (!fs.existsSync(bak)) {
    fs.copyFileSync(abs, bak);
    console.log('backup', bak);
  }

  const wb = XLSX.readFile(abs);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: '' });

  const over = [];
  for (let i = 0; i < rows.length; i++) {
    const ru = String(rows[i]['俄文翻译'] || '');
    const b = utf8Len(ru);
    if (b > MAX_BYTES) {
      over.push({
        index: i,
        zh: String(rows[i]['词条'] || ''),
        en: String(rows[i]['英文翻译'] || ''),
        ru,
        bytes: b
      });
    }
  }
  console.log('toCompress', over.length, '/', rows.length);

  const batchSize = 15;
  let truncatedFallback = 0;

  for (let i = 0; i < over.length; i += batchSize) {
    const chunk = over.slice(i, i + batchSize);
    console.log(`batch ${i + 1}-${Math.min(i + chunk.length, over.length)}/${over.length}`);
    const raw = await callDeepseek(buildPrompt(chunk));
    const by = parseNumbered(raw, chunk.length);
    for (let j = 0; j < chunk.length; j++) {
      let ru = by.get(j + 1) || '';
      if (/[\u4e00-\u9fff]/.test(ru)) ru = '';
      if (ru && utf8Len(ru) > MAX_BYTES) ru = truncateUtf8(ru, MAX_BYTES);
      if (!ru || utf8Len(ru) > MAX_BYTES) {
        ru = truncateUtf8(chunk[j].ru, MAX_BYTES);
        truncatedFallback += 1;
      }
      rows[chunk[j].index]['俄文翻译'] = ru;
    }
    // checkpoint write every 5 batches
    if ((i / batchSize) % 5 === 4 || i + batchSize >= over.length) {
      wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
      XLSX.writeFile(wb, abs);
      console.log('  checkpoint written');
    }
  }

  let still = 0;
  let maxB = 0;
  for (const r of rows) {
    const b = utf8Len(r['俄文翻译']);
    if (b > maxB) maxB = b;
    if (b > MAX_BYTES) still += 1;
  }

  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  XLSX.writeFile(wb, abs);
  const dir = path.dirname(abs);
  const base = path.basename(abs, path.extname(abs));
  XLSX.writeFile(wb, path.join(dir, `${base}_已压63.xlsx`));
  XLSX.writeFile(wb, path.join(dir, `${base}_已压63.csv`), { bookType: 'csv' });

  console.log(
    JSON.stringify(
      {
        compressed: over.length,
        truncatedFallback,
        stillOver: still,
        maxBytesAfter: maxB,
        source: abs
      },
      null,
      2
    )
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
