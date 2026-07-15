/**
 * 批线协议回归：换行哨兵 + 按序号解析拒收错位批
 * 用法：node evals/batch-wire-multiline.js
 */
const assert = require('assert');
const path = require('path');

const {
  protectUndistinguishablePlaceholders,
  restoreUndistinguishablePlaceholders,
  parseBatchTranslationResponse,
  extractPlaceholders,
  validateTranslation,
  BATCH_NL_TOKEN
} = require('../translateCsv.js');

function section(title) {
  console.log(`\n== ${title} ==`);
}

section('protect: multiline has no raw newline on wire');
{
  const src = "Could not write\n%1";
  const { protectedText, hadNewlines, tokenReplacements } = protectUndistinguishablePlaceholders(src);
  assert.strictEqual(hadNewlines, true);
  assert.ok(!protectedText.includes('\n'), 'wire text must be single-line');
  assert.ok(protectedText.includes(BATCH_NL_TOKEN), 'must contain NL sentinel');
  assert.ok(protectedText.includes('%1'));
  assert.strictEqual(tokenReplacements.length, 0);
}

section('protect: CRLF normalized then masked');
{
  const src = "LineA\r\nLineB\rLineC";
  const { protectedText } = protectUndistinguishablePlaceholders(src);
  assert.ok(!/\r|\n/.test(protectedText));
  const parts = protectedText.split(BATCH_NL_TOKEN);
  assert.strictEqual(parts.length, 3);
  assert.deepStrictEqual(parts, ['LineA', 'LineB', 'LineC']);
}

section('restore: NL + curly round-trip');
{
  const src = "目标[{:.3f}]\n下一行 %1";
  const { protectedText, tokenReplacements } = protectUndistinguishablePlaceholders(src);
  assert.ok(!protectedText.includes('\n'));
  // 模拟模型保留哨兵与 curly token
  const restored = restoreUndistinguishablePlaceholders(protectedText, tokenReplacements);
  assert.strictEqual(restored, src.replace(/\r\n/g, '\n').replace(/\r/g, '\n'));
}

section('restore: model drops brackets around NL');
{
  const raw = `Не удалось записать __NL__%1`;
  const out = restoreUndistinguishablePlaceholders(raw, []);
  assert.strictEqual(out, 'Не удалось записать \n%1');
}

section('parse: full numbered lines OK');
{
  const resp = `1. Alpha${BATCH_NL_TOKEN}more\n2. Beta\n3. Gamma`;
  const got = parseBatchTranslationResponse(resp, 3);
  assert.strictEqual(got.length, 3);
  assert.ok(got[0].includes(BATCH_NL_TOKEN));
  assert.strictEqual(got[1], 'Beta');
}

section('parse: missing index → empty (reject batch)');
{
  const resp = `1. Alpha\n3. Gamma`;
  const got = parseBatchTranslationResponse(resp, 3);
  assert.deepStrictEqual(got, []);
}

section('parse: duplicate index → empty');
{
  const resp = `1. Alpha\n1. Dup\n2. Beta`;
  const got = parseBatchTranslationResponse(resp, 2);
  assert.deepStrictEqual(got, []);
}

section('parse: unnumbered junk ignored if 1..N present');
{
  const resp = `Here is the result:\n1. One\n2. Two\nThanks`;
  const got = parseBatchTranslationResponse(resp, 2);
  assert.deepStrictEqual(got, ['One', 'Two']);
}

section('validate: placeholder parity after restore');
{
  const src = "Could not write\n%1";
  const { protectedText, tokenReplacements } = protectUndistinguishablePlaceholders(src);
  const modelOut = `Не удалось записать${BATCH_NL_TOKEN}%1`;
  const restored = restoreUndistinguishablePlaceholders(modelOut, tokenReplacements);
  const ph = extractPlaceholders(src);
  const v = validateTranslation(src, restored, ph);
  assert.strictEqual(v.isValid, true, v.issues.join('; '));
}

section('fixture file exists');
{
  const fs = require('fs');
  const fixture = path.join(__dirname, '..', 'template', 'few-shot-example', 'multiline-wire-guard.csv');
  assert.ok(fs.existsSync(fixture), fixture);
}

console.log('\nAll batch-wire-multiline checks passed.\n');
