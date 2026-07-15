#!/usr/bin/env node
/**
 * Probe which free-tier models echo English on en2ru.
 * Usage: node scripts/probe-en2ru-echo.js
 */
const { resolveActiveTranslateWorkers } = require('../translateCsv.js');

function hasCyrillic(s) {
  return /[\u0400-\u04FF]/.test(s);
}

const PROBE = [
  'Cancel',
  'Save',
  'The signature of the certificate is invalid',
  'Could not instantiate corner delegate',
  'Select signal'
];

async function main() {
  const workers = resolveActiveTranslateWorkers({ multiModel: true, models: 'all' });
  console.log('workers', workers.map((w) => w.id));

  const prompt =
    `Translate each UI string to Russian. Output ONLY Russian with Cyrillic letters.\n` +
    `Format: N. translation\nDo NOT copy English.\n\n` +
    PROBE.map((t, i) => `${i + 1}. ${t}`).join('\n');

  const results = [];
  for (const w of workers) {
    const row = { id: w.id, name: w.name, ok: false, echoRate: null, samples: [], error: '' };
    try {
      const texts = await w.callBatch(prompt, PROBE.length);
      if (!Array.isArray(texts) || texts.length === 0) {
        row.error = 'parse_empty';
        results.push(row);
        console.log(JSON.stringify(row));
        continue;
      }
      let echo = 0;
      const samples = [];
      for (let i = 0; i < PROBE.length; i++) {
        const src = PROBE[i];
        const tgt = String(texts[i] || '').trim();
        const isEcho =
          !tgt || src === tgt || (!hasCyrillic(tgt) && /[A-Za-z]{4,}/.test(src));
        if (isEcho) echo += 1;
        samples.push({ src, tgt: tgt.slice(0, 80), isEcho });
      }
      row.ok = true;
      row.echoRate = echo / PROBE.length;
      row.samples = samples;
    } catch (e) {
      row.error = String(e.message || e).slice(0, 220);
    }
    results.push(row);
    console.log(JSON.stringify(row, null, 2));
  }

  const echoModels = results.filter((r) => r.ok && r.echoRate >= 0.4).map((r) => r.id);
  const goodModels = results.filter((r) => r.ok && r.echoRate < 0.4).map((r) => r.id);
  console.log('\n=== SUMMARY ===');
  console.log('echo-prone (>=40%):', echoModels);
  console.log('ok-ish:', goodModels);
  console.log(
    'failed:',
    results.filter((r) => !r.ok).map((r) => r.id + ':' + r.error)
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
