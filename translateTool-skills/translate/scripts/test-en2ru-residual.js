#!/usr/bin/env node
/**
 * Unit tests for en2ru residual helpers + quality gates (no network).
 */
const assert = require('assert');
const {
  stripEn2RuEnglishGlossParen,
  extractResidualEnglishSpans,
  normalizeResidualSpanKey,
  parseTermDecideResponse,
  applyTermDecisionsToRussian,
  hasEnglishGlossParen
} = require('../lib/en2ruResidualEnglish.js');
const { parseOneDecisionBody } = require('../lib/en2ruTermDecide.js');
const {
  isAllowedEnRuIdentity,
  validateEn2RuNotEcho,
  validateEn2RuQuality,
  isSuspectEn2RuMisalign,
  countNewlines
} = require('../translateCsv.js');

function testStripParen() {
  const a = stripEn2RuEnglishGlossParen('Тип (Type)');
  assert.strictEqual(a.text, 'Тип');
  assert.ok(a.stripped >= 1);

  const b = stripEn2RuEnglishGlossParen(
    'Переместить курсор на следующий строку (Move the cursor to the next line)'
  );
  assert.ok(!/\(Move/.test(b.text));
  assert.ok(/Переместить/.test(b.text));

  const c = stripEn2RuEnglishGlossParen('файл (*.scd)');
  assert.ok(c.text.includes('*.scd'));

  const d = stripEn2RuEnglishGlossParen('режим Unicode (UTF)');
  assert.ok(d.text.includes('(UTF)'));

  const e = stripEn2RuEnglishGlossParen('A4 (210 x 297 mm, 8.26 x 11.7 inches)');
  assert.ok(e.text.includes('210'));
  assert.ok(e.text.includes('mm'));

  const f = stripEn2RuEnglishGlossParen('Система (%1 x %2)');
  assert.ok(f.text.includes('%1'));

  const g = stripEn2RuEnglishGlossParen(
    'Ожидается передача объекта типа QByteArray для обработки (Expecting QByteArray for %1)'
  );
  assert.ok(!/\(Expecting/.test(g.text), g.text);
}

function testExtractContext() {
  const spans = extractResidualEnglishSpans('Не удалось проверить NULL, колонка %1');
  assert.ok(spans.includes('NULL'));
  const n = normalizeResidualSpanKey('Context3');
  assert.strictEqual(n.stem, 'Context');
  assert.strictEqual(n.digits, '3');
  assert.strictEqual(n.key, 'context');
}

function testParseDecide() {
  const parsed = parseTermDecideResponse(
    '1. KEEP\n2. REPLACE:НУЛЕВОЙ\n3. REPLACE: Контекст\n',
    3
  );
  assert.strictEqual(parsed[0].action, 'KEEP');
  assert.strictEqual(parsed[1].action, 'REPLACE');
  assert.strictEqual(parsed[1].ru, 'НУЛЕВОЙ');
  assert.strictEqual(parsed[2].ru, 'Контекст');
  assert.strictEqual(parseOneDecisionBody('REPLACE:НУЛЕВОЙ').ru, 'НУЛЕВОЙ');
}

function testApply() {
  const map = new Map([
    ['null', { action: 'REPLACE', ru: 'НУЛЕВОЙ' }],
    ['socksv5', { action: 'KEEP', ru: null }],
    ['context', { action: 'REPLACE', ru: 'Контекст' }],
    ['x', { action: 'REPLACE', ru: '%1' }]
  ]);
  const a = applyTermDecisionsToRussian(
    'Общая ошибка сервера SOCKSv5 и NULL',
    map
  );
  assert.ok(a.text.includes('SOCKSv5'));
  assert.ok(a.text.includes('НУЛЕВОЙ'));
  assert.ok(!/\bNULL\b/.test(a.text));

  const b = applyTermDecisionsToRussian('пункт Context3 здесь', map);
  assert.ok(/Контекст 3/.test(b.text), b.text);

  const c = applyTermDecisionsToRussian('Система (%1 x %2)', map);
  assert.ok(
    (c.text.includes('%1 x %2') || (c.text.includes('%1') && c.text.includes('%2'))),
    c.text
  );
  assert.ok(!c.text.includes('%1 %1'), c.text);

  const d = applyTermDecisionsToRussian('A4 (210 x 297 mm)', map);
  assert.ok(/210\s*x\s*297/.test(d.text), d.text);
}

function testHasGloss() {
  assert.strictEqual(hasEnglishGlossParen('Тип (Type)'), true);
  assert.strictEqual(hasEnglishGlossParen('Тип'), false);
  assert.strictEqual(hasEnglishGlossParen('файл (*.scd)'), false);
}

function testIdentityWhitelistTightened() {
  assert.strictEqual(isAllowedEnRuIdentity('Caps Lock'), false);
  assert.strictEqual(isAllowedEnRuIdentity('Val'), false);
  assert.strictEqual(isAllowedEnRuIdentity('Envelope You 4'), false);
  assert.strictEqual(isAllowedEnRuIdentity('Didot (DD)'), false);
  assert.strictEqual(isAllowedEnRuIdentity('MenuRole'), false);
  assert.strictEqual(isAllowedEnRuIdentity('Qt Widgets Designer'), false);
  // 仍允许
  assert.strictEqual(isAllowedEnRuIdentity('SSL'), true);
  assert.strictEqual(isAllowedEnRuIdentity('QLabel'), true);
  assert.strictEqual(isAllowedEnRuIdentity('Ctrl+S'), true);
  assert.strictEqual(isAllowedEnRuIdentity('JIS B10'), true);

  const echo = validateEn2RuNotEcho('Caps Lock', 'Caps Lock');
  assert.strictEqual(echo.isValid, false);
}

function testQualityGates() {
  const cjk = validateEn2RuQuality('Move String Down', 'Вниз 移动字符串');
  assert.strictEqual(cjk.isValid, false);
  assert.ok(cjk.issues.some((x) => /中日韩|中文/.test(x)));

  const nlOk = validateEn2RuQuality('Could not write\n%1', 'Не удалось записать\n%1');
  assert.strictEqual(nlOk.isValid, true);

  const nlBad = validateEn2RuQuality('Black', 'Не удалось прочитать директорию\n%1');
  assert.strictEqual(nlBad.isValid, false);

  assert.strictEqual(countNewlines('a\nb\nc'), 2);
  assert.strictEqual(isSuspectEn2RuMisalign('Black', 'Не удалось прочитать директорию\n%1'), true);
  assert.strictEqual(
    isSuspectEn2RuMisalign(
      '%1 is not a valid skin directory:\n%2',
      '%1 не является допустимым каталогом скина:\n%2'
    ),
    false
  );

  const gloss = validateEn2RuQuality(
    'Expecting QByteArray for %1',
    'Ожидается (Expecting QByteArray for %1)'
  );
  assert.strictEqual(gloss.isValid, false);

  const viet = validateEn2RuQuality('DEFINE x', 'Подмẫu DEFINE');
  assert.strictEqual(viet.isValid, false);
}

testStripParen();
testExtractContext();
testParseDecide();
testApply();
testHasGloss();
testIdentityWhitelistTightened();
testQualityGates();
console.log('en2ru residual helpers + quality gates: OK');
