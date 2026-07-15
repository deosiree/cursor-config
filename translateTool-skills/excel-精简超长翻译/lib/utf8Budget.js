/**
 * UTF-8 字节预算（C++ strlen 口径）
 */

function utf8Len(str) {
  return Buffer.byteLength(String(str || ''), 'utf8');
}

/**
 * 估算在 byteLimit 下还可写入的西里尔字符数
 * charBudget = floor((byteLimit - singleByteCount) / 2)
 * @param {string} text
 * @param {number} byteLimit
 */
function calcCharBudget(text, byteLimit) {
  const singleByteCount = [...String(text || '')].filter((ch) => ch.charCodeAt(0) < 128).length;
  return Math.max(0, Math.floor((byteLimit - singleByteCount) / 2));
}

/**
 * 按 UTF-8 码点边界截断到 ≤ byteLimit
 * @param {string} text
 * @param {number} byteLimit
 */
function truncateUtf8Boundary(text, byteLimit) {
  const s = String(text || '');
  if (utf8Len(s) <= byteLimit) return s;
  let out = '';
  for (const ch of s) {
    const next = out + ch;
    if (utf8Len(next) > byteLimit) break;
    out = next;
  }
  return out;
}

module.exports = {
  utf8Len,
  calcCharBudget,
  truncateUtf8Boundary
};
