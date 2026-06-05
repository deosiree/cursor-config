#!/usr/bin/env node
/**
 * 菜单管理 index.vue 简化回归 — OpenCLI 冒烟（bind 模式）
 *
 * 前置：p2ejw7ww Chrome 已登录 8080，当前标签在基座内（建议先手动打开菜单管理页）
 *
 * 用法：
 *   node run-menu-index-smoke.node.js
 *   node run-menu-index-smoke.node.js --bind-only
 *   node run-menu-index-smoke.node.js --profile p2ejw7ww --session p2ejw7ww
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const OPENCLI = 'opencli';
const DEFAULT_PROFILE = 'p2ejw7ww';
const DEFAULT_SESSION = 'p2ejw7ww';
const MENU_URL = 'http://localhost:8080/cloud/Apex/system/menu';

const args = process.argv.slice(2);
const bindOnly = args.includes('--bind-only');
const profile = args.includes('--profile') ? args[args.indexOf('--profile') + 1] : DEFAULT_PROFILE;
const session = args.includes('--session') ? args[args.indexOf('--session') + 1] : DEFAULT_SESSION;

const SKILL_ROOT = path.resolve(__dirname, '..');
const EXAMPLES_DIR = path.join(SKILL_ROOT, 'evals', 'opencli-results');

function runOpencli(...opencliArgs) {
  const full = ['--profile', profile, 'browser', session, ...opencliArgs];
  const label = [OPENCLI, ...full].join(' ').substring(0, 140);
  console.log(`  > ${label}`);
  const r =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/s', '/c', OPENCLI, ...full], {
          timeout: 90000,
          encoding: 'utf-8',
        })
      : spawnSync(OPENCLI, full, { timeout: 90000, encoding: 'utf-8' });
  const out = (r.stdout || '').trim();
  const err = (r.stderr || '').trim();
  if (r.error) console.log(`    ⚠️  ${r.error.message}`);
  if (out) console.log(`    ${out.substring(0, 400)}`);
  if (err && !err.includes('Update available')) console.log(`    ⚠️  ${err.substring(0, 200)}`);
  return { ok: r.status === 0 && !r.error, out, err, status: r.status };
}

const SMOKE_EVAL = [
  'JSON.stringify({',
  '  url: location.href,',
  '  onMenuPage: location.pathname.includes("/system/menu"),',
  '  hasProjectSelect: !!document.querySelector(".project-select"),',
  '  hasSearch: !!document.querySelector(".search-input"),',
  '  hasTabs: !!document.querySelector(".menu-tabs"),',
  '  hasTableOrEmpty: !!(document.querySelector(".data-table__content") || document.querySelector(".menu-empty-panel")),',
  '  refreshTag: (document.querySelector(".menu-list-refresh-tag")?.textContent || "").trim(),',
  '  hasWhitelistBtn: !!document.querySelector(\'[data-testid="sys-menu-whitelist-btn"]\'),',
  '  tabCount: document.querySelectorAll(".el-tabs__item").length,',
  '  tableLoaded: !!document.querySelector(".el-table__body"),',
  '})',
].join('');

function parseSmoke(out) {
  try {
    return JSON.parse(out);
  } catch {
    return null;
  }
}

function verdictFromSmoke(s) {
  if (!s) return { pass: false, reason: 'eval 解析失败' };
  if (!s.onMenuPage) return { pass: false, reason: '未在菜单管理页，请先手动打开菜单页后 --bind-only 重跑' };
  if (!s.hasProjectSelect) return { pass: false, reason: '缺少项目下拉 .project-select' };
  if (!s.hasSearch) return { pass: false, reason: '缺少搜索框 .search-input' };
  if (!s.hasTabs) return { pass: false, reason: '缺少 PageTabShell .menu-tabs' };
  if (!s.hasTableOrEmpty) return { pass: false, reason: '缺少表格或空态面板' };
  if (!s.hasWhitelistBtn) return { pass: false, reason: '缺少白名单按钮 data-testid' };
  return { pass: true, reason: '核心 DOM 与 index.vue 简化后结构一致' };
}

console.log(`\n=== menu-index-smoke 菜单管理页-index简化回归-smoke ===`);
console.log(`  profile=${profile} session=${session}`);
console.log(`  url=${MENU_URL}`);
console.log(`  mode=${bindOnly ? 'bind-only' : 'bind+nav-eval'}\n`);

function parseBindUrl(out) {
  try {
    const m = out.match(/"url"\s*:\s*"([^"]+)"/);
    return m ? m[1] : '';
  } catch {
    return '';
  }
}

if (bindOnly) {
  console.log('📎 Step 0: bind 当前 Chrome 标签（请先聚焦 p2ejw7ww 中已登录的 localhost:8080 标签）');
  const bind = runOpencli('bind');
  if (!bind.ok) {
    console.error('\n❌ FAIL: bind 失败，请确认 OpenCLI 扩展已连接');
    process.exit(1);
  }
  const boundUrl = parseBindUrl(bind.out);
  if (!boundUrl.includes('localhost:8080')) {
    console.error(`\n❌ FAIL: bind 到了非 nebula 标签: ${boundUrl}`);
    console.error('   请切换到 http://localhost:8080 已登录页后再执行: node scripts/run-menu-index-smoke.node.js --bind-only');
    process.exit(1);
  }
} else {
  console.log('📋 Step 1: bind + eval 导航到菜单页（避免 open 触发 extension 冲突）');
  runOpencli('bind');
  runOpencli('eval', `if(!location.pathname.includes('/system/menu')){location.assign('${MENU_URL}');'nav'}else{'already'}`);
  runOpencli('wait', 'time', '4');
}

console.log('\n🔍 Step 2: 页面结构断言');
const smoke = runOpencli('eval', SMOKE_EVAL);
const parsed = parseSmoke(smoke.out);
const verdict = verdictFromSmoke(parsed);

console.log('\n📊 smoke:', JSON.stringify(parsed, null, 2));
console.log(`\n🏁 ${verdict.pass ? 'PASS' : 'FAIL'}: ${verdict.reason}`);

if (!fs.existsSync(EXAMPLES_DIR)) fs.mkdirSync(EXAMPLES_DIR, { recursive: true });
const stamp = new Date().toISOString().slice(0, 10);
const reportPath = path.join(EXAMPLES_DIR, `menu-index-smoke-${stamp}.json`);
fs.writeFileSync(
  reportPath,
  JSON.stringify(
    {
      testDate: stamp,
      scenario: 'menu-index-smoke',
      profile,
      session,
      bindOnly,
      verdict: verdict.pass ? 'PASS' : 'FAIL',
      reason: verdict.reason,
      smoke: parsed,
    },
    null,
    2
  ),
  'utf-8'
);
console.log(`报告: ${reportPath}\n`);

process.exit(verdict.pass ? 0 : 1);
