const path = require('path');
const fs = require('fs');
const axios = require('axios');

const ROOT = path.resolve('F:/Documents/Default-Obsidian/huiyanSkills');
for (const raw of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/)) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const eq = line.indexOf('=');
  if (eq <= 0) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (process.env[k] === undefined) process.env[k] = v;
}

const apiKey = process.env.XFYUN_API_KEY;
const models = [
  'Hy-MT2-7B',
  'hy-mt2-7b',
  'HY-MT2-7B',
  'translation',
  'tencent/Hy-MT2-7B',
  'xdeepseekv3',
  'generalv3.5'
];

const urls = [
  'https://maas-api.cn-huabei-1.xf-yun.com/v2/chat/completions',
  'https://maas-api.cn-huabei-1.xf-yun.com/v1/chat/completions',
  'http://maas-api.cn-huabei-1.xf-yun.com/v1/chat/completions'
];

async function tryOnce(url, model) {
  const res = await axios.post(
    url,
    {
      model,
      messages: [{ role: 'user', content: 'Translate to Russian: Hello' }],
      max_tokens: 32,
      temperature: 0
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      timeout: 30000,
      validateStatus: () => true
    }
  );
  const text = res.data?.choices?.[0]?.message?.content || '';
  const err = res.data?.error?.message || res.data?.message || '';
  return { status: res.status, ok: !!(text && res.status < 300), text: String(text).slice(0, 80), err: String(err).slice(0, 180) };
}

(async () => {
  // list models if available
  for (const listUrl of [
    'https://maas-api.cn-huabei-1.xf-yun.com/v2/models',
    'https://maas-api.cn-huabei-1.xf-yun.com/v1/models'
  ]) {
    try {
      const res = await axios.get(listUrl, {
        headers: { Authorization: `Bearer ${apiKey}` },
        timeout: 20000,
        validateStatus: () => true
      });
      console.log('LIST', listUrl, 'status=', res.status, JSON.stringify(res.data).slice(0, 500));
    } catch (e) {
      console.log('LIST', listUrl, 'EX', e.message);
    }
  }

  for (const url of urls) {
    for (const model of models) {
      try {
        const r = await tryOnce(url, model);
        const mark = r.ok ? 'OK' : 'FAIL';
        console.log(`[${mark}] ${url} model=${model} status=${r.status} sample=${r.text || '-'} err=${r.err || '-'}`);
        if (r.ok) process.exit(0);
      } catch (e) {
        console.log(`[EX] ${url} model=${model} ${e.code || ''} ${e.message}`);
      }
    }
  }
})();
