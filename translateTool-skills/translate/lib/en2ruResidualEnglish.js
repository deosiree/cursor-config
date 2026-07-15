/**
 * en2ru：剥括号英注 + 俄文内残留拉丁词抽取 / 判定解析 / 回写
 */
const CYRILLIC_RE = /[\u0400-\u04FF]/;
const LATIN_TOKEN_RE = /[A-Za-z][A-Za-z0-9+._\-]*/g;

/**
 * 括注内容是否应保留（文件后缀、短全大写技术码、占位）
 * @param {string} inner
 * @returns {boolean}
 */
function shouldKeepParenInner(inner) {
  const t = String(inner || '').trim();
  if (!t) return true;
  if (/^\*\.\s*[A-Za-z0-9]+$/i.test(t)) return true;
  // 纯占位/尺寸：(%1) / (%1 x %2) — 不含英语词
  if (/%\d+/.test(t) && !/[A-Za-z]{3,}/.test(t)) return true;
  if (/^\d+(\.\d+)?$/.test(t)) return true;
  // 纸张/尺寸：(210 x 297 mm, 8.26 x 11.7 inches)
  if (/\bmm\b|\binch|\bcm\b|\bpt\b|\bdpi\b/i.test(t)) return true;
  if (/\d+\s*[x×]\s*\d+/i.test(t)) return true;
  // (UTF) / (RFC 3629) / 短技术码：无空格、≤12；TitleCase 单词如 Type → 不保留
  if (!/\s/.test(t) && t.length <= 12 && /^[A-Za-z0-9+.\-_<>:]+$/.test(t)) {
    if (/^[A-Z][a-z]{2,}$/.test(t)) return false;
    return true;
  }
  // 含空格的英文句/短语（含 Expecting … for %1）→ 英注，剥掉
  if (/\s/.test(t) && /[A-Za-z]/.test(t)) return false;
  if (/^[A-Za-z][A-Za-z0-9]*(?:\s+[A-Za-z][A-Za-z0-9]*)*$/.test(t)) return false;
  return true;
}

/**
 * 去掉「俄文 (English gloss)」式括号英注
 * @param {string} translatedText
 * @returns {{ text: string, issues: string[], stripped: number }}
 */
function stripEn2RuEnglishGlossParen(translatedText) {
  let text = String(translatedText || '');
  const issues = [];
  let stripped = 0;
  if (!text) return { text, issues, stripped };

  // 反复剥：西里尔附近的拉丁英注括号
  for (let round = 0; round < 8; round++) {
    const before = text;
    text = text.replace(/\s*\(([^)]*)\)/g, (full, inner, offset) => {
      const left = text.slice(Math.max(0, offset - 24), offset);
      // 仅在左侧近期有西里尔时考虑剥（避免误伤纯英文括注行）
      if (!CYRILLIC_RE.test(left) && !CYRILLIC_RE.test(text)) {
        return full;
      }
      if (shouldKeepParenInner(inner)) return full;
      if (!/[A-Za-z]/.test(inner)) return full;
      stripped += 1;
      return '';
    });
    text = text.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
    if (text === before) break;
  }

  if (stripped > 0) {
    issues.push('已去掉括号英注');
  }
  return { text, issues, stripped };
}

/**
 * Context3 → { stem: Context, digits: 3 }
 * 仅 TitleCase 词干+数字（避免 SOCKSv5 → SOCKSv + 5）
 * @param {string} span
 */
function normalizeResidualSpanKey(span) {
  const display = String(span || '');
  const m = display.match(/^([A-Z][a-z]+)(\d+)$/);
  if (m) {
    return { key: m[1].toLowerCase(), stem: m[1], digits: m[2], display };
  }
  return { key: display.toLowerCase(), stem: display, digits: null, display };
}

/**
 * 不宜做术语判定/替换的 span（尺寸乘号、过短词、纯扩展名等）
 * @param {string} span
 */
function shouldSkipResidualSpan(span) {
  const t = String(span || '');
  if (!t) return true;
  if (t.length <= 1) return true;
  if (/^[x×]$/i.test(t)) return true;
  if (/^(mm|cm|pt|dpi|px|em)$/i.test(t)) return true;
  if (/^\d+$/.test(t)) return true;
  return false;
}

/**
 * REPLACE 结果不可信则丢弃（防把 x 译成 %1）
 * @param {string} span
 * @param {string} ru
 */
function isUnsafeReplaceRu(span, ru) {
  const r = String(ru || '').trim();
  if (!r) return true;
  if (/%\d+/.test(r)) return true;
  if (r === String(span)) return true;
  if (/^[%_*]+\d*$/.test(r)) return true;
  // REPLACE 必须给出西里尔定译；仍全英文则不可信（如 Envelope→Envelope DL）
  if (!CYRILLIC_RE.test(r) && /[A-Za-z]/.test(r)) return true;
  return false;
}

/**
 * 从俄文中抽取残留拉丁 span（不去重）
 * @param {string} ru
 * @param {{ allowPureLatin?: boolean }} [opts]
 * @returns {string[]}
 */
function extractResidualEnglishSpans(ru, opts = {}) {
  const text = String(ru || '');
  if (!text) return [];
  if (!CYRILLIC_RE.test(text) && !opts.allowPureLatin) return [];
  // 暂时挡住占位与扩展名
  const masked = text
    .replace(/%\d+/g, ' ')
    .replace(/\*\.[A-Za-z0-9]+/g, ' ')
    .replace(/⟦[^⟧]*⟧/g, ' ');
  const out = [];
  let m;
  LATIN_TOKEN_RE.lastIndex = 0;
  while ((m = LATIN_TOKEN_RE.exec(masked)) !== null) {
    const tok = m[0];
    if (shouldSkipResidualSpan(tok)) continue;
    if (/^\d+$/.test(tok)) continue;
    out.push(tok);
  }
  return out;
}

/**
 * 为唯一 key 收集语境例句
 * @param {Array<{ ru: string, spans: string[] }>} rows
 * @returns {Map<string, { key: string, stem: string, digits: string|null, examples: string[], displays: Set<string> }>}
 */
function collectUniqueResidualTerms(rows) {
  /** @type {Map<string, { key: string, stem: string, digits: string|null, examples: string[], displays: Set<string> }>} */
  const map = new Map();
  for (const row of rows) {
    const ru = String(row.ru || '');
    const spans = row.spans || extractResidualEnglishSpans(ru);
    for (const span of spans) {
      const n = normalizeResidualSpanKey(span);
      let e = map.get(n.key);
      if (!e) {
        e = { key: n.key, stem: n.stem, digits: null, examples: [], displays: new Set() };
        map.set(n.key, e);
      }
      e.displays.add(span);
      // 若有任一 ContextN，记 digits 模式以 stem 判定
      if (n.digits != null) e.digits = n.digits;
      if (e.examples.length < 2) {
        const excerpt = ru.length > 80 ? ru.slice(0, 80) + '…' : ru;
        if (!e.examples.includes(excerpt)) e.examples.push(excerpt);
      }
    }
  }
  return map;
}

/**
 * 解析 LLM 术语判定批输出
 * @param {string} responseText
 * @param {number} expectedCount
 * @returns {Array<{ action: 'KEEP'|'REPLACE', ru: string|null }|null>}
 */
function parseTermDecideResponse(responseText, expectedCount) {
  const lines = String(responseText || '').split(/\n/).map((l) => l.trim()).filter(Boolean);
  /** @type {Map<number, { action: 'KEEP'|'REPLACE', ru: string|null }>} */
  const byIndex = new Map();
  for (const line of lines) {
    const m = line.match(/^(\d+)[.、)\]]\s*(.*)$/);
    if (!m) continue;
    const n = parseInt(m[1], 10);
    if (!Number.isFinite(n) || n < 1 || n > expectedCount) continue;
    const body = m[2].trim();
    if (/^KEEP\b/i.test(body)) {
      byIndex.set(n, { action: 'KEEP', ru: null });
      continue;
    }
    const rm = body.match(/^REPLACE\s*[:：]\s*(.+)$/i);
    if (rm) {
      const ru = rm[1].trim().replace(/^["「]|["」]$/g, '');
      if (ru) byIndex.set(n, { action: 'REPLACE', ru });
      continue;
    }
  }
  const out = [];
  for (let i = 1; i <= expectedCount; i++) {
    out.push(byIndex.has(i) ? byIndex.get(i) : null);
  }
  return out;
}

/**
 * 按外观调整替换串大小写
 * @param {string} originalSpan
 * @param {string} replacement
 */
function matchCaseStyle(originalSpan, replacement) {
  const src = String(originalSpan || '');
  let dest = String(replacement || '');
  if (!src || !dest) return dest;
  if (src === src.toUpperCase() && /[A-Za-z]/.test(src)) {
    // 全大写源 → 尽量全大写西里尔
    return dest.toLocaleUpperCase('ru-RU');
  }
  return dest;
}

/**
 * 将判定应用到一句俄文
 * @param {string} ru
 * @param {Map<string, { action: 'KEEP'|'REPLACE', ru?: string|null }>} decisions By normalize key
 * @returns {{ text: string, replaced: string[], kept: string[] }}
 */
function applyTermDecisionsToRussian(ru, decisions) {
  let text = String(ru || '');
  const replaced = [];
  const kept = [];
  if (!text || !decisions || decisions.size === 0) {
    return { text, replaced, kept };
  }

  // 纯拉丁短词（如 Context3）也允许替换
  const spans = extractResidualEnglishSpans(text, {
    allowPureLatin: !CYRILLIC_RE.test(text) && text.length <= 40
  });
  // 长 span 优先替换，避免短词抢先
  const unique = [...new Set(spans)].sort((a, b) => b.length - a.length);
  for (const span of unique) {
    const n = normalizeResidualSpanKey(span);
    if (shouldSkipResidualSpan(span) || shouldSkipResidualSpan(n.stem)) continue;
    const d = decisions.get(n.key);
    if (!d) continue;
    if (d.action === 'KEEP') {
      kept.push(span);
      continue;
    }
    if (d.action === 'REPLACE' && d.ru) {
      if (isUnsafeReplaceRu(span, d.ru)) {
        kept.push(span);
        continue;
      }
      let rep = matchCaseStyle(n.digits ? n.stem : span, d.ru);
      if (n.digits != null) {
        const digits = String(span).match(/(\d+)$/)?.[1] || n.digits;
        rep = `${rep} ${digits}`.replace(/\s+/g, ' ').trim();
      }
      if (text.includes(span)) {
        text = text.split(span).join(rep);
        replaced.push(`${span}→${rep}`);
      }
    }
  }
  return { text, replaced, kept: [...new Set(kept)] };
}

/**
 * 检测俄文中是否仍残留「可剥英注」括号
 * @param {string} ru
 */
function hasEnglishGlossParen(ru) {
  const text = String(ru || '');
  if (!CYRILLIC_RE.test(text)) return false;
  let found = false;
  text.replace(/\s*\(([^)]*)\)/g, (full, inner) => {
    if (/[A-Za-z]/.test(inner) && !shouldKeepParenInner(inner)) found = true;
    return full;
  });
  return found;
}

module.exports = {
  stripEn2RuEnglishGlossParen,
  shouldKeepParenInner,
  extractResidualEnglishSpans,
  normalizeResidualSpanKey,
  collectUniqueResidualTerms,
  parseTermDecideResponse,
  applyTermDecisionsToRussian,
  matchCaseStyle,
  hasEnglishGlossParen,
  CYRILLIC_RE,
  shouldSkipResidualSpan,
  isUnsafeReplaceRu
};
