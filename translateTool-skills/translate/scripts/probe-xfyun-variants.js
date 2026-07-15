const path = require('path');
const fs = require('fs');
const axios = require('axios');

const ROOT = path.resolve('F:/Documents/Default-Obsidian/huiyanSkills');

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

const apiKey = process.env.XFYUN_API_KEY || '';
const base = String(process.env.XFYUN_BASE_URL || '').replace(/\/$/, '');
const url = /\/chat\/completions$/i.test(base) ? base : `${base}/chat/completions`;
const MODEL = process.env.XFYUN_MODEL || 'Hy-MT2-7B';
const SERVICE = process.env.XFYUN_SERVICE || 'translation';

console.log('url=', url);
console.log('key_len=', apiKey.length);
console.log('MODEL=', MODEL, 'SERVICE=', SERVICE);

const cases = [
  { name: 'A model=MODEL + X-Service-Name', model: MODEL, headers: { 'X-Service-Name': SERVICE } },
  { name: 'B model=MODEL no service header', model: MODEL, headers: {} },
  { name: 'C model=SERVICE + X-Service-Name', model: SERVICE, headers: { 'X-Service-Name': SERVICE } },
  { name: 'D model=SERVICE no service header', model: SERVICE, headers: {} },
  { name: 'E model=MODEL + X-Model-Service', model: MODEL, headers: { 'X-Model-Service': SERVICE } },
  {
    name: 'F body.service=SERVICE model=MODEL',
    model: MODEL,
    headers: {},
    bodyExtra: { service: SERVICE }
  }
];

(async () => {
  for (const c of cases) {
    console.log('---');
    console.log(c.name);
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        ...c.headers
      };
      const body = {
        model: c.model,
        messages: [{ role: 'user', content: 'Translate to Russian: Hello' }],
        max_tokens: 32,
        temperature: 0,
        ...(c.bodyExtra || {})
      };
      const res = await axios.post(url, body, {
        headers,
        timeout: 45000,
        validateStatus: () => true
      });
      const text = res.data?.choices?.[0]?.message?.content || '';
      const err = res.data?.error || res.data?.message || res.data?.code || '';
      console.log('status=', res.status, 'req_model=', c.model, 'hdr=', JSON.stringify(c.headers));
      console.log('sample=', String(text).slice(0, 120) || '(empty)');
      console.log(
        'error=',
        typeof err === 'object' ? JSON.stringify(err).slice(0, 300) : String(err).slice(0, 300)
      );
    } catch (e) {
      console.log('EXCEPTION', e.code || '', e.message);
      if (e.response) {
        console.log('status', e.response.status, JSON.stringify(e.response.data).slice(0, 300));
      }
    }
  }
})();
