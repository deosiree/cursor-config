#!/usr/bin/env node
/**
 * 菜单管理 E2E — 8 场景全矩阵
 *
 * 用法：
 *   node run-all.node.js
 *   node run-all.node.js --from 2        # 从 S2 开始（跳过 S1）
 *   node run-all.node.js --only 6,7,8
 *   node run-all.node.js --no-warmup     # 跳过首轮 admin 预热
 *   node run-all.node.js --no-rerun      # 首轮失败后不重跑失败用例
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OPENCLI = 'opencli';
const DEFAULT_ADMIN_PROFILE = 'p2ejw7ww';
const BASE_URL = 'http://localhost:8080';

const ROOT = path.resolve(__dirname, '..');
const SCENARIOS_DIR = path.join(ROOT, 'scenarios');
const RUNNER = path.join(__dirname, 'run-e2e-scenario.node.js');
const EXAMPLES_DIR = path.join(ROOT, 'examples');

const ALL = [
  '01-only-import.json',
  '02-only-export.json',
  '03-only-add.json',
  '04-only-query.json',
  '05-query-add.json',
  '06-query-edit.json',
  '07-query-delete.json',
  '08-query-edit-configapi.json',
];

const args = process.argv.slice(2);
const skipWarmup = args.includes('--no-warmup');
const skipRerun = args.includes('--no-rerun');
const adminProfile = args.includes('--admin')
  ? args[args.indexOf('--admin') + 1]
  : DEFAULT_ADMIN_PROFILE;

let files = ALL.map(f => path.join(SCENARIOS_DIR, f));

if (args.includes('--from')) {
  const n = parseInt(args[args.indexOf('--from') + 1], 10);
  files = files.filter(f => {
    const m = path.basename(f).match(/^(\d+)/);
    return m && parseInt(m[1], 10) >= n;
  });
}
if (args.includes('--only')) {
  const ids = args[args.indexOf('--only') + 1].split(',').map(s => s.trim().padStart(2, '0'));
  files = files.filter(f => ids.some(id => path.basename(f).startsWith(id + '-')));
}

function runOpencli(profile, session, cmd, ...extraArgs) {
  const opencliArgs = ['--profile', profile, 'browser', session, cmd, ...extraArgs];
  return process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', OPENCLI, ...opencliArgs], { timeout: 60000, encoding: 'utf-8' })
    : spawnSync(OPENCLI, opencliArgs, { timeout: 60000, encoding: 'utf-8' });
}

function warmupAdminSession() {
  console.log('🔥 Admin 会话预热（避免首轮弹窗未就绪）...');
  runOpencli(adminProfile, 'admin', 'open', `${BASE_URL}/cloud/Apex/system/role`);
  runOpencli(adminProfile, 'admin', 'wait', 'time', '2');
  console.log('  预热完成\n');
}

function runScenario(file, runnerArgs = [], verbose = false) {
  const t0 = Date.now();
  const r = spawnSync(process.execPath, [RUNNER, file, ...runnerArgs], {
    encoding: 'utf-8',
    timeout: 300000,
    stdio: verbose ? ['ignore', 'inherit', 'inherit'] : ['ignore', 'pipe', 'pipe'],
  });
  const stdout = verbose ? '' : (r.stdout || '');
  return {
    ok: r.status === 0,
    exitCode: r.status,
    elapsedSec: parseFloat(((Date.now() - t0) / 1000).toFixed(1)),
    stdout,
  };
}

function printStdoutTail(stdout, lines = 8) {
  if (!stdout) return;
  const tail = stdout.trim().split('\n').slice(-lines).join('\n');
  console.log(tail);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`菜单管理 E2E 全矩阵 — ${files.length} 场景`);
console.log(`Admin 预热: ${skipWarmup ? '关' : '开'} | 失败补跑: ${skipRerun ? '关' : '首轮全跑完后单独重跑'}`);
console.log(`${'='.repeat(60)}\n`);

if (!skipWarmup && files.length > 0) {
  warmupAdminSession();
}

const runnerArgs = [];
if (args.includes('--admin')) runnerArgs.push('--admin', adminProfile);
if (args.includes('--test')) runnerArgs.push('--test', args[args.indexOf('--test') + 1]);

const results = [];
let pass = 0;
let fail = 0;

// 首轮：与原来一样，失败不重试
for (const file of files) {
  const scenario = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const runResult = runScenario(file, runnerArgs);
  const ok = runResult.ok;
  if (ok) pass++; else fail++;
  results.push({
    id: scenario.id,
    title: scenario.title,
    file,
    status: ok ? 'PASS' : 'FAIL',
    exitCode: runResult.exitCode,
    elapsedSec: runResult.elapsedSec,
  });
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`${ok ? '✅' : '❌'} ${scenario.id} ${scenario.title} — ${ok ? 'PASS' : 'FAIL'} (${runResult.elapsedSec}s)`);
  if (!ok) printStdoutTail(runResult.stdout);
}

// 首轮结束后：仅对失败用例单独重跑一遍，输出完整日志
const failedEntries = results.filter(r => r.status === 'FAIL');
if (!skipRerun && failedEntries.length > 0) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`失败补跑 — ${failedEntries.length} 个用例（详细日志）`);
  console.log(`${'='.repeat(60)}\n`);

  for (const entry of failedEntries) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`↻ ${entry.id} ${entry.title}`);
    const runResult = runScenario(entry.file, runnerArgs, true);
    entry.rerun = {
      status: runResult.ok ? 'PASS' : 'FAIL',
      exitCode: runResult.exitCode,
      elapsedSec: runResult.elapsedSec,
    };
    if (runResult.ok) {
      entry.status = 'PASS';
      fail--;
      pass++;
      console.log(`\n补跑结果: ✅ PASS (${runResult.elapsedSec}s)`);
    } else {
      console.log(`\n补跑结果: ❌ 仍 FAIL (${runResult.elapsedSec}s)`);
    }
  }
}

if (!fs.existsSync(EXAMPLES_DIR)) fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const outFile = path.join(EXAMPLES_DIR, `result-${stamp}.json`);
const report = {
  testDate: stamp,
  total: results.length,
  passed: pass,
  failed: fail,
  results: results.map(({ file, ...rest }) => rest),
};
fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf-8');

console.log(`\n${'='.repeat(60)}`);
console.log(`汇总: ${pass}/${results.length} PASS, ${fail} FAIL`);
if (failedEntries.length > 0 && !skipRerun) {
  const rerunCount = results.filter(r => r.rerun).length;
  const rerunPass = results.filter(r => r.rerun?.status === 'PASS').length;
  console.log(`首轮失败 ${failedEntries.length} 个，补跑 ${rerunCount} 个（${rerunPass} 个转 PASS）`);
}
console.log(`报告: ${outFile}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(fail > 0 ? 1 : 0);
h} 个，补跑 ${rerunCount} 个（${rerunPass} 个转 PASS）`);
}
console.log(`报告: ${outFile}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(fail > 0 ? 1 : 0);
 0);
h} 个，补跑 ${rerunCount} 个（${rerunPass} 个转 PASS）`);
}
console.log(`报告: ${outFile}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(fail > 0 ? 1 : 0);
: 0);
 0);
h} 个，补跑 ${rerunCount} 个（${rerunPass} 个转 PASS）`);
}
console.log(`报告: ${outFile}`);
console.log(`${'='.repeat(60)}\n`);

process.exit(fail > 0 ? 1 : 0);
