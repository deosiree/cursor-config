#!/usr/bin/env node
/**
 * 菜单管理 E2E — 跑全部 8 个场景
 *
 * 用法：
 *   node run-all-scenarios.js [--admin p2ejw7ww] [--test q5prwymq]
 *
 * 内部调用 run-e2e-scenario.node.js 逐场景执行。
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const scenariosDir = path.join(__dirname, '..', 'scenarios');
const runnerScript = path.join(__dirname, 'run-e2e-scenario.node.js');

const scenarioFiles = fs.readdirSync(scenariosDir)
  .filter(f => f.endsWith('.json'))
  .sort();

const args = process.argv.slice(2);
const extraArgs = args.join(' ');

console.log('========================================');
console.log('  菜单管理 E2E — 全部 8 场景');
console.log('========================================\n');
console.log(`  场景文件: ${scenarioFiles.length} 个`);
console.log(`  额外参数: ${extraArgs || '(无)'}\n`);

const results = [];
let passCount = 0;
let failCount = 0;

for (const file of scenarioFiles) {
  const scenarioPath = path.join(scenariosDir, file);
  const scenario = JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
  console.log(`\n━━━ ${scenario.id} ${scenario.title} ━━━`);

  try {
    const cmd = `node "${runnerScript}" "${scenarioPath}" ${extraArgs}`;
    const out = execSync(cmd, { timeout: 300000, encoding: 'utf-8', stdio: 'pipe' });
    console.log(out);

    const verdict = out.includes('PASS') && !out.includes('PARTIAL') && !out.includes('FAIL') ? 'PASS' : 'CHECK';
    results.push({ id: scenario.id, title: scenario.title, verdict });
    if (verdict === 'PASS') passCount++;
    else failCount++;
  } catch (e) {
    console.error(`  ❌ ${file} 执行失败: ${e.stderr?.toString()?.substring(0, 500) || e.message}`);
    results.push({ id: scenario.id, title: scenario.title, verdict: 'ERROR' });
    failCount++;
  }
}

console.log('\n========================================');
console.log('  结果汇总');
console.log('========================================');
console.log(`  PASS: ${passCount}  FAIL/CHECK: ${failCount}  TOTAL: ${scenarioFiles.length}`);
console.table(results);
