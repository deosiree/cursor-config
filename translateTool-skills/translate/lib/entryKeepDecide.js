/**
 * 整词条 KEEP/TRANSLATE：去重后交 DeepSeek 判定（不用长度/形态启发式）
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_BATCH_SIZE = 40;
const CJK_RE = /[\u4e00-\u9fff]/;

/**
 * @param {string} text
 * @returns {string}
 */
function normalizeEntryKey(text) {
  return String(text || '').trim().toLowerCase();
}

/**
 * 是否需要送 DeepSeek 做整词 KEEP 判定（无 CJK、含拉丁）
 * @param {string} text
 */
function isEntryKeepDecideCandidate(text) {
  const s = String(text || '').trim();
  if (!s || CJK_RE.test(s)) return false;
  if (!/[A-Za-z]/.test(s)) return false;
  return true;
}

/**
 * @param {string} cachePath
 * @returns {Map<string, { action: 'KEEP'|'TRANSLATE', reason?: string }>}
 */
function loadEntryKeepCache(cachePath) {
  const map = new Map();
  if (!cachePath || !fs.existsSync(cachePath)) return map;
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const entries = raw.decisions || raw;
    if (entries && typeof entries === 'object') {
      for (const [k, v] of Object.entries(entries)) {
        if (!v || !v.action) continue;
        const action = String(v.action).toUpperCase() === 'KEEP' ? 'KEEP' : 'TRANSLATE';
        map.set(normalizeEntryKey(k), { action, reason: v.reason || null });
      }
    }
  } catch (_) {
    /* ignore */
  }
  return map;
}

/**
 * @param {string} cachePath
 * @param {Map<string, { action: string, reason?: string }>} map
 */
function saveEntryKeepCache(cachePath, map) {
  if (!cachePath) return;
  const dir = path.dirname(cachePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const decisions = {};
  for (const [k, v] of map.entries()) {
    decisions[k] = { action: v.action, reason: v.reason || null };
  }
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ updatedAt: new Date().toISOString(), decisions }, null, 2),
    'utf8'
  );
}

function loadEntryKeepPromptTemplate(promptDir) {
  return fs.readFileSync(path.join(promptDir, 'prompt-batch-entry-keep-decide.md'), 'utf8');
}

function buildEntryKeepBatchPrompt(template, entries) {
  const lines = entries.map((e, i) => `${i + 1}. ${e.stem}`);
  return template.replace('{{ENTRY_LIST}}', lines.join('\n'));
}

/**
 * @param {string} body
 * @returns {'KEEP'|'TRANSLATE'|null}
 */
function parseOneEntryKeepBody(body) {
  const s = String(body || '').trim();
  if (/^KEEP\b/i.test(s)) return 'KEEP';
  if (/^TRANSLATE\b/i.test(s)) return 'TRANSLATE';
  return null;
}

/**
 * @param {string[]|string} raw
 * @param {number} n
 * @returns {Array<'KEEP'|'TRANSLATE'|null>}
 */
function parseEntryKeepBatch(raw, n) {
  const lines = [];
  if (Array.isArray(raw)) {
    for (let i = 0; i < n; i++) lines.push(String(raw[i] || '').trim());
  } else {
    const text = String(raw || '');
    for (let i = 1; i <= n; i++) {
      const m = text.match(new RegExp(`(?:^|\\n)\\s*${i}\\s*[.、:)：]\\s*(.+)`, 'm'));
      lines.push(m ? m[1].trim() : '');
    }
  }
  return lines.map(parseOneEntryKeepBody);
}

/**
 * 收集待判定唯一词条
 * @param {string[]} texts
 * @returns {Map<string, { key: string, stem: string }>}
 */
function collectUniqueEntryKeepCandidates(texts) {
  const map = new Map();
  for (const text of texts) {
    if (!isEntryKeepDecideCandidate(text)) continue;
    const stem = String(text).trim();
    const key = normalizeEntryKey(stem);
    if (!map.has(key)) map.set(key, { key, stem });
  }
  return map;
}

/**
 * 对缺失判定的整词条分批询问 DeepSeek，写入 cache
 * API 失败默认 TRANSLATE（宁可送翻，不假 KEEP）
 * @param {Map<string, { key: string, stem: string }>} unique
 * @param {Map<string, { action: string, reason?: string }>} cache
 * @param {{ callBatch: Function, promptDir: string, batchSize?: number, onBatch?: Function }} opts
 */
async function decideMissingEntryKeepWithLlm(unique, cache, opts) {
  const batchSize = opts.batchSize || DEFAULT_BATCH_SIZE;
  const template = loadEntryKeepPromptTemplate(opts.promptDir);
  const missing = [];
  for (const [key, meta] of unique.entries()) {
    if (!cache.has(key)) missing.push({ ...meta, key });
  }
  if (missing.length === 0) {
    return { asked: 0, decided: 0, failedBatches: 0, keep: 0, translate: 0 };
  }

  let decided = 0;
  let failedBatches = 0;
  let keep = 0;
  let translate = 0;
  let cursor = 0;

  while (cursor < missing.length) {
    let size = Math.min(batchSize, missing.length - cursor);
    let succeeded = false;

    for (let attempt = 0; attempt < 3 && !succeeded; attempt++) {
      if (attempt > 0) size = Math.max(1, Math.ceil(size / 2));
      const sub = missing.slice(cursor, cursor + size);
      const prompt = buildEntryKeepBatchPrompt(template, sub);
      try {
        const raw = await opts.callBatch(prompt, sub.length);
        let parsed = parseEntryKeepBatch(raw, sub.length);
        const okCount = parsed.filter(Boolean).length;
        if (okCount < sub.length && attempt < 2 && size > 1) {
          continue;
        }
        for (let j = 0; j < sub.length; j++) {
          const term = sub[j];
          const action = parsed[j] || 'TRANSLATE';
          cache.set(term.key, {
            action,
            reason: parsed[j] ? null : 'parse_fallback_translate'
          });
          decided += 1;
          if (action === 'KEEP') keep += 1;
          else translate += 1;
        }
        cursor += sub.length;
        succeeded = true;
        if (opts.onBatch) opts.onBatch({ size: sub.length, attempt, decided });
      } catch (err) {
        if (attempt === 2) {
          failedBatches += 1;
          for (const term of sub) {
            cache.set(term.key, { action: 'TRANSLATE', reason: `api_fallback_translate:${err.message}` });
            decided += 1;
            translate += 1;
          }
          cursor += sub.length;
          succeeded = true;
        }
      }
    }
  }

  return { asked: missing.length, decided, failedBatches, keep, translate };
}

/**
 * @param {string} text
 * @param {Map<string, { action: string }>|null|undefined} cache
 * @returns {boolean}
 */
function isEntryKeepByCache(text, cache) {
  if (!cache || !isEntryKeepDecideCandidate(text)) return false;
  const d = cache.get(normalizeEntryKey(text));
  return !!(d && d.action === 'KEEP');
}

module.exports = {
  normalizeEntryKey,
  isEntryKeepDecideCandidate,
  loadEntryKeepCache,
  saveEntryKeepCache,
  collectUniqueEntryKeepCandidates,
  decideMissingEntryKeepWithLlm,
  isEntryKeepByCache,
  parseEntryKeepBatch
};
