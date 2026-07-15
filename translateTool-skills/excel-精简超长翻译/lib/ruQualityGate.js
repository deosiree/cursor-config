/**
 * 俄文压缩硬门禁：字节 / CJK / 括注英注 / 可译英文残留
 * 复用 translate 的残留英文工具
 */
const path = require('path');
const {
  hasEnglishGlossParen,
  stripEn2RuEnglishGlossParen,
  extractResidualEnglishSpans
} = require(path.join(__dirname, '../../translate/lib/en2ruResidualEnglish.js'));
const { utf8Len } = require('./utf8Budget');

const CJK_RE = /[\u4e00-\u9fff]/;

/** 明显应 KEEP 的拉丁技术 token（协议、类名后缀等） */
function isKeepLatinSpan(span) {
  const t = String(span || '');
  if (!t) return true;
  if (/_app\d+$/i.test(t)) return true;
  // LATIN_TOKEN 会把 `_app2` 拆成 `app` / `app2`
  if (/^app\d*$/i.test(t)) return true;
  if (/\.(dll|so|exe|scd|cid|icd|ssd)$/i.test(t)) return true;
  if (/^(TDB|HTTP|HTTPS|SSL|TLS|TCP|UDP|IP|URL|URI|JSON|XML|IEC|GOOSE|SV|MMS|SCD|CID|IED|Qt|Q[A-Z][a-zA-Z0-9]+)$/i.test(t)) {
    return true;
  }
  // 全大写缩写 ≤12
  if (/^[A-Z0-9]{2,12}$/.test(t)) return true;
  // 含数字的标识符：IPv4、SOCKSv5、Context3
  if (/\d/.test(t) && /^[A-Za-z][A-Za-z0-9+._\-]*$/.test(t)) return true;
  // CamelCase / PascalCase 技术名（≥2 驼峰段）且首字母大写后仍有大写
  if (/^[A-Z][a-z0-9]*(?:[A-Z][a-z0-9]+)+$/.test(t) && t.length <= 24) return true;
  return false;
}

/**
 * 是否疑似「可译英文」残留（应被门禁失败）
 * @param {string} span
 */
function isTranslatableEnglishSpan(span) {
  const t = String(span || '');
  if (!t || t.length <= 2) return false;
  if (isKeepLatinSpan(t)) return false;
  // TitleCase 单词：Type / Status / File
  if (/^[A-Z][a-z]{2,}$/.test(t)) return true;
  // 全小写英语词
  if (/^[a-z]{3,}$/.test(t)) return true;
  // 多词英文（若 span 含空格——通常不会从 token 抽出）
  if (/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(t)) return true;
  return false;
}

/**
 * @param {string} ru
 * @param {string} [en]
 * @param {number} [byteLimit=63]
 * @returns {{ ok: boolean, issues: string[], text: string, bytes: number, residualBad: string[] }}
 */
function validateRuCompressHard(ru, en = '', byteLimit = 63) {
  const issues = [];
  const stripped = stripEn2RuEnglishGlossParen(String(ru || '')).text.trim();
  const bytes = utf8Len(stripped);

  if (!stripped) {
    return { ok: false, issues: ['empty'], text: stripped, bytes, residualBad: [] };
  }
  if (bytes > byteLimit) {
    issues.push(`over_bytes:${bytes}>${byteLimit}`);
  }
  if (CJK_RE.test(stripped)) {
    issues.push('cjk_in_ru');
  }
  if (/[\u0100-\u024F\u1E00-\u1EFF]/.test(stripped)) {
    issues.push('latin_ext_garbage');
  }
  if (hasEnglishGlossParen(stripped)) {
    issues.push('gloss_paren');
  }

  const spans = extractResidualEnglishSpans(stripped);
  const residualBad = spans.filter(isTranslatableEnglishSpan);
  if (residualBad.length > 0) {
    issues.push(`residual_en:${[...new Set(residualBad)].join(',')}`);
  }

  return {
    ok: issues.length === 0,
    issues,
    text: stripped,
    bytes,
    residualBad
  };
}

module.exports = {
  CJK_RE,
  isKeepLatinSpan,
  isTranslatableEnglishSpan,
  validateRuCompressHard,
  hasEnglishGlossParen,
  stripEn2RuEnglishGlossParen,
  extractResidualEnglishSpans
};
