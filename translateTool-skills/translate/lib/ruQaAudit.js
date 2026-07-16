/**
 * 对去重后的 词条/英/俄 做 DeepSeek 质检并回写 FIX
 */
const fs = require('fs');
const path = require('path');

const DEFAULT_BATCH = 25;

function loadQaPrompt(promptDir) {
  return fs.readFileSync(path.join(promptDir, 'prompt-batch-ru-qa.md'), 'utf8');
}

function buildQaPrompt(template, items) {
  const lines = items.map((it, i) => {
    const ci = String(it.ci || '').replace(/\n/g, ' ');
    const en = String(it.en || '').replace(/\n/g, ' ');
    const ru = String(it.ru || '').replace(/\n/g, ' ');
    return `${i + 1}. CI<<<${ci}>>> EN<<<${en}>>> RU<<<${ru}>>>`;
  });
  return template.replace('{{ENTRY_LIST}}', lines.join('\n'));
}

/**
 * @param {string} body
 * @returns {{ ok: boolean, fix: string|null, reason: string|null }}
 */
function parseOneQa(body) {
  const s = String(body || '').trim();
  if (/^OK\b/i.test(s)) return { ok: true, fix: null, reason: null };
  const fix = s.match(/^FIX\s*[:：]\s*(.+)$/i);
  if (fix) return { ok: false, fix: fix[1].trim(), reason: 'fix' };
  const fail = s.match(/^FAIL\s*[:：]\s*(.+)$/i);
  if (fail) return { ok: false, fix: null, reason: fail[1].trim() };
  return { ok: false, fix: null, reason: 'parse_fail' };
}

function parseQaBatch(raw, n) {
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
  return lines.map(parseOneQa);
}

/**
 * @param {Array<{ key: string, ci: string, en: string, ru: string }>} items
 * @param {{ callBatch: Function, promptDir: string, batchSize?: number, onBatch?: Function }} opts
 */
async function qaUniqueRuWithLlm(items, opts) {
  const batchSize = opts.batchSize || DEFAULT_BATCH;
  const template = loadQaPrompt(opts.promptDir);
  const results = new Map();
  let cursor = 0;
  let failBatches = 0;

  while (cursor < items.length) {
    let size = Math.min(batchSize, items.length - cursor);
    let succeeded = false;
    for (let attempt = 0; attempt < 3 && !succeeded; attempt++) {
      if (attempt > 0) size = Math.max(1, Math.ceil(size / 2));
      const sub = items.slice(cursor, cursor + size);
      const prompt = buildQaPrompt(template, sub);
      try {
        const raw = await opts.callBatch(prompt, sub.length);
        const parsed = parseQaBatch(raw, sub.length);
        const okCount = parsed.filter((p) => p && (p.ok || p.fix || p.reason)).length;
        if (okCount < sub.length && attempt < 2 && size > 1) continue;
        for (let j = 0; j < sub.length; j++) {
          results.set(sub[j].key, parsed[j] || { ok: false, fix: null, reason: 'empty' });
        }
        cursor += sub.length;
        succeeded = true;
        if (opts.onBatch) opts.onBatch({ size: sub.length, attempt, done: results.size });
      } catch (e) {
        if (attempt === 2) {
          failBatches += 1;
          for (const it of sub) {
            results.set(it.key, { ok: true, fix: null, reason: `qa_skip:${e.message}` });
          }
          cursor += sub.length;
          succeeded = true;
        }
      }
    }
  }

  return { results, failBatches };
}

module.exports = {
  qaUniqueRuWithLlm,
  parseQaBatch,
  buildQaPrompt
};
