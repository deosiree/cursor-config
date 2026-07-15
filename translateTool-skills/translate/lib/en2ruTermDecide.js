/**
 * 分批 LLM：俄文残留英文 KEEP/REPLACE 判定 + 缓存
 */
const fs = require('fs');
const path = require('path');
const {
  collectUniqueResidualTerms,
  parseTermDecideResponse,
  applyTermDecisionsToRussian,
  extractResidualEnglishSpans,
  isUnsafeReplaceRu,
  shouldSkipResidualSpan
} = require('./en2ruResidualEnglish');

const DEFAULT_BATCH_SIZE = 50;

/**
 * @param {string} cachePath
 * @returns {Map<string, { action: string, ru: string|null, reason?: string }>}
 */
function loadTermDecisionCache(cachePath) {
  /** @type {Map<string, { action: string, ru: string|null, reason?: string }>} */
  const map = new Map();
  if (!cachePath || !fs.existsSync(cachePath)) return map;
  try {
    const raw = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    const entries = raw.decisions || raw;
    if (entries && typeof entries === 'object') {
      for (const [k, v] of Object.entries(entries)) {
        if (!v || !v.action) continue;
        map.set(String(k).toLowerCase(), {
          action: String(v.action).toUpperCase() === 'REPLACE' ? 'REPLACE' : 'KEEP',
          ru: v.ru != null ? String(v.ru) : null,
          reason: v.reason
        });
      }
    }
  } catch (_) {
    /* ignore */
  }
  return map;
}

/**
 * @param {string} cachePath
 * @param {Map<string, { action: string, ru: string|null }>} map
 */
function saveTermDecisionCache(cachePath, map) {
  if (!cachePath) return;
  const dir = path.dirname(cachePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const decisions = {};
  for (const [k, v] of map.entries()) {
    decisions[k] = { action: v.action, ru: v.ru || null, reason: v.reason || null };
  }
  fs.writeFileSync(
    cachePath,
    JSON.stringify({ updatedAt: new Date().toISOString(), decisions }, null, 2),
    'utf8'
  );
}

function loadTermDecidePromptTemplate(promptDir) {
  const p = path.join(promptDir, 'prompt-batch-en2ru-term-decide.md');
  return fs.readFileSync(p, 'utf8');
}

function buildTermDecideBatchPrompt(template, terms) {
  const lines = terms.map((t, i) => {
    const ex = (t.examples || []).slice(0, 2).join(' | ');
    return `${i + 1}. ${t.stem}${ex ? ` | ${ex}` : ''}`;
  });
  return template.replace('{{ENTRY_LIST}}', lines.join('\n'));
}

/**
 * @param {string} body
 * @returns {{ action: 'KEEP'|'REPLACE', ru: string|null }|null}
 */
function parseOneDecisionBody(body) {
  const s = String(body || '').trim();
  if (/^KEEP\b/i.test(s)) return { action: 'KEEP', ru: null };
  const rm = s.match(/^REPLACE\s*[:：]\s*(.+)$/i);
  if (rm) return { action: 'REPLACE', ru: rm[1].trim().replace(/^["「]|["」]$/g, '') };
  return null;
}

/**
 * @param {string[]|string} raw
 * @param {number} n
 */
function parseBatchDecisions(raw, n) {
  if (Array.isArray(raw) && raw.length === n) {
    return raw.map((line) => parseOneDecisionBody(line));
  }
  const text = Array.isArray(raw)
    ? raw.map((t, i) => `${i + 1}. ${String(t || '').trim()}`).join('\n')
    : String(raw || '');
  return parseTermDecideResponse(text, n);
}

/**
 * 对缺失判定的术语分批询问 LLM，写入 cache Map
 * @param {Map<string, any>} uniqueTerms
 * @param {Map<string, { action: string, ru: string|null }>} cache
 * @param {{ callBatch: Function, promptDir: string, batchSize?: number, onBatch?: Function }} opts
 */
async function decideMissingTermsWithLlm(uniqueTerms, cache, opts) {
  const batchSize = opts.batchSize || DEFAULT_BATCH_SIZE;
  const template = loadTermDecidePromptTemplate(opts.promptDir);
  const missing = [];
  for (const [key, meta] of uniqueTerms.entries()) {
    if (!cache.has(key)) missing.push({ ...meta, key });
  }
  if (missing.length === 0) {
    return { asked: 0, decided: 0, failedBatches: 0 };
  }

  let decided = 0;
  let failedBatches = 0;
  let cursor = 0;

  while (cursor < missing.length) {
    let size = Math.min(batchSize, missing.length - cursor);
    let succeeded = false;

    for (let attempt = 0; attempt < 3 && !succeeded; attempt++) {
      if (attempt > 0) size = Math.max(1, Math.ceil(size / 2));
      const sub = missing.slice(cursor, cursor + size);
      const prompt = buildTermDecideBatchPrompt(template, sub);
      try {
        const raw = await opts.callBatch(prompt, sub.length);
        let parsed = parseBatchDecisions(raw, sub.length);
        const okCount = parsed.filter(Boolean).length;
        if (okCount < sub.length && attempt < 2 && size > 1) {
          continue;
        }
        for (let j = 0; j < sub.length; j++) {
          const term = sub[j];
          let d = parsed[j] || { action: 'KEEP', ru: null, reason: 'parse_fallback_keep' };
          if (shouldSkipResidualSpan(term.stem) || shouldSkipResidualSpan(term.key)) {
            d = { action: 'KEEP', ru: null, reason: 'skip_span' };
          } else if (d.action === 'REPLACE' && isUnsafeReplaceRu(term.stem, d.ru)) {
            d = { action: 'KEEP', ru: null, reason: 'unsafe_replace_keep' };
          }
          cache.set(term.key, {
            action: d.action,
            ru: d.ru,
            reason: d.reason || null
          });
          decided += 1;
        }
        cursor += sub.length;
        succeeded = true;
        if (opts.onBatch) opts.onBatch({ size: sub.length, attempt, decided });
      } catch (err) {
        if (attempt === 2) {
          failedBatches += 1;
          for (const term of sub) {
            cache.set(term.key, { action: 'KEEP', ru: null, reason: 'api_fallback_keep' });
            decided += 1;
          }
          cursor += sub.length;
          succeeded = true;
        }
      }
    }
  }

  return { asked: missing.length, decided, failedBatches };
}

/**
 * @param {Array<{ id?: string, ru: string }>} rows
 * @param {{ callBatch, promptDir, cachePath?, cache?: Map, batchSize?: number, onBatch?: Function }} opts
 */
async function remediateRussianRows(rows, opts) {
  const cache = opts.cache || loadTermDecisionCache(opts.cachePath);
  const prepared = rows.map((r) => {
    const ru0 = String(r.ru || '');
    return { id: r.id, ru: ru0, spans: extractResidualEnglishSpans(ru0) };
  });
  const unique = collectUniqueResidualTerms(prepared);
  const stats = await decideMissingTermsWithLlm(unique, cache, opts);
  if (opts.cachePath) saveTermDecisionCache(opts.cachePath, cache);

  const out = [];
  let replaceCount = 0;
  let keepCount = 0;
  for (const row of prepared) {
    const applied = applyTermDecisionsToRussian(row.ru, cache);
    if (applied.replaced.length) replaceCount += applied.replaced.length;
    if (applied.kept.length) keepCount += applied.kept.length;
    out.push({
      id: row.id,
      ru: applied.text,
      replaced: applied.replaced,
      kept: applied.kept
    });
  }
  return { rows: out, cache, stats, replaceCount, keepCount, uniqueCount: unique.size };
}

module.exports = {
  loadTermDecisionCache,
  saveTermDecisionCache,
  decideMissingTermsWithLlm,
  remediateRussianRows,
  buildTermDecideBatchPrompt,
  parseOneDecisionBody,
  DEFAULT_BATCH_SIZE
};
