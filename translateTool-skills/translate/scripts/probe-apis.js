/**
 * 探测根目录 .env 中智谱 / 讯飞星辰 API 是否可用（不打印完整 Key）
 * 用法: node scripts/probe-apis.js
 */
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const ROOT = path.resolve(__dirname, '../../..');

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const raw of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnvFile(path.join(ROOT, '.env'));
loadDotEnvFile(path.join(ROOT, '.env.local'));

function mask(key) {
  const s = String(key || '');
  if (!s) return '(empty)';
  if (s.length <= 8) return '****';
  return `${s.slice(0, 4)}...${s.slice(-4)} (len=${s.length})`;
}

function chatUrl(base) {
  const b = String(base || '').replace(/\/$/, '');
  return /\/chat\/completions$/i.test(b) ? b : `${b}/chat/completions`;
}

async function probeXfyun() {
  const apiKey = process.env.XFYUN_API_KEY || process.env.XINGCHEN_API_KEY || '';
  const baseURL = chatUrl(process.env.XFYUN_BASE_URL || 'https://maas-api.cn-huabei-1.xf-yun.com/v2');
  const model = process.env.XFYUN_MODEL || 'Hy-MT2-7B';
  const service = process.env.XFYUN_SERVICE || 'translation';
  if (!apiKey) return { name: 'xfyun', ok: false, reason: 'missing key (请填写 XFYUN_API_KEY)' };
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
    'X-Service-Name': service
  };
  const res = await axios.post(
    baseURL,
    {
      model,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 16,
      temperature: 0
    },
    { headers, timeout: 30000, validateStatus: () => true }
  );
  const text = res.data?.choices?.[0]?.message?.content || '';
  return {
    name: 'xfyun',
    ok: res.status >= 200 && res.status < 300 && !!text,
    status: res.status,
    key: mask(apiKey),
    url: baseURL,
    model,
    sample: String(text).slice(0, 40),
    error: res.data?.error?.message || res.data?.message || ''
  };
}

async function probeZhipu() {
  const apiKey = process.env.ZHIPU_API_KEY || '';
  const baseURL = process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  const model = process.env.ZHIPU_MODEL || 'glm-4-flash';
  if (!apiKey) return { name: 'zhipu', ok: false, reason: 'missing key' };
  const res = await axios.post(
    baseURL,
    {
      model,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 16,
      temperature: 0
    },
    {
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      timeout: 30000,
      validateStatus: () => true
    }
  );
  const text = res.data?.choices?.[0]?.message?.content || '';
  return {
    name: 'zhipu',
    ok: res.status >= 200 && res.status < 300 && !!text,
    status: res.status,
    key: mask(apiKey),
    sample: String(text).slice(0, 40),
    error: res.data?.error?.message || res.data?.msg || ''
  };
}

async function main() {
  console.log(`ROOT .env: ${path.join(ROOT, '.env')}`);
  console.log('Probing APIs...\n');
  const results = [];
  for (const fn of [probeXfyun, probeZhipu]) {
    try {
      const r = await fn();
      results.push(r);
      const mark = r.ok ? 'OK' : 'FAIL';
      console.log(
        `[${mark}] ${r.name} status=${r.status ?? '-'} key=${r.key || '-'} ${r.url ? `url=${r.url}` : ''} ${r.model ? `model=${r.model}` : ''} sample=${r.sample || r.reason || ''} err=${r.error || ''}`
      );
    } catch (e) {
      results.push({ name: fn.name, ok: false, error: e.message });
      console.log(`[FAIL] ${fn.name} exception=${e.message}`);
    }
  }
  const okCount = results.filter((r) => r.ok).length;
  console.log(`\nSummary: ${okCount}/${results.length} usable`);
  process.exit(okCount > 0 ? 0 : 2);
}

main();
