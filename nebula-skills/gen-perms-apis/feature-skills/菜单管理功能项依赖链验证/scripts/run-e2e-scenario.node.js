#!/usr/bin/env node
/**
 * 菜单管理 E2E — 单场景执行脚本（Node.js 本地）
 *
 * 用法：
 *   node run-e2e-scenario.node.js scenarios/01-only-import.json
 *   node run-e2e-scenario.node.js scenarios/06-query-edit.json --admin p2ejw7ww --test q5prwymq
 *
 * 不需要 AI token——直接调用 opencli CLI 执行所有步骤。
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ====== 参数解析 ======
const args = process.argv.slice(2);
const scenarioFile = args.find(a => a.endsWith('.json'));
const adminProfile = args.includes('--admin') ? args[args.indexOf('--admin') + 1] : 'p2ejw7ww';
const testProfile  = args.includes('--test')  ? args[args.indexOf('--test') + 1]  : 'q5prwymq';
const OPENCLI = 'opencli';
const BASE_URL = 'http://localhost:8080';

if (!scenarioFile || !fs.existsSync(scenarioFile)) {
  console.error('Usage: node run-e2e-scenario.node.js <scenarios/XX-name.json> [--admin p2ejw7ww] [--test q5prwymq]');
  process.exit(1);
}

const scenario = JSON.parse(fs.readFileSync(scenarioFile, 'utf-8'));
const checkItems = scenario.check || [];
console.log(`\n=== ${scenario.id || '?'} ${scenario.title} ===`);
console.log(`  check: [${checkItems.join(', ')}]`);

// ====== opencli 封装 ======
// Windows: opencli 是 .cmd 包装，spawnSync 直调会 ENOENT；须 cmd.exe /c
function run(profile, session, cmd, ...extraArgs) {
  const opencliArgs = ['--profile', profile, 'browser', session, cmd, ...extraArgs];
  const label = [OPENCLI, ...opencliArgs].join(' ').substring(0, 130);
  console.log(`  > ${label}`);
  const r = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', OPENCLI, ...opencliArgs], { timeout: 60000, encoding: 'utf-8' })
    : spawnSync(OPENCLI, opencliArgs, { timeout: 60000, encoding: 'utf-8' });
  const out = (r.stdout || '').trim();
  const err = (r.stderr || '').trim();
  if (r.error) console.log(`    ⚠️  ${r.error.message}`);
  if (out) console.log(`    ${out.substring(0, 200)}`);
  if (err && !err.includes('Update available')) console.log(`    ⚠️  ${err.substring(0, 200)}`);
  return out;
}

function adminEval(js) { return run(adminProfile, 'admin', 'eval', js); }
function testEval(js)  { return run(testProfile,  'test',  'eval', js); }
function adminWait(n)  { return run(adminProfile, 'admin', 'wait', 'time', String(n)); }
function testWait(n)   { return run(testProfile,  'test',  'wait', 'time', String(n)); }
function testOpen(url) { return run(testProfile,  'test',  'open', url); }
function adminType(ref, text) { return run(adminProfile, 'admin', 'type', String(ref), text); }
function adminFind(selector) { return run(adminProfile, 'admin', 'find', '--css', selector); }
function adminWaitSelector(sel) { return run(adminProfile, 'admin', 'wait', 'selector', sel); }
function adminOpen(url) { return run(adminProfile, 'admin', 'open', url); }
function testFillRole(role, name, text) { return run(testProfile, 'test', 'fill', '--role', role, '--name', name, text); }
function testClickRole(role, name) { return run(testProfile, 'test', 'click', '--role', role, '--name', name); }
function adminCheck(name) { return run(adminProfile, 'admin', 'check', '--role', 'checkbox', '--name', name); }
function adminUncheck(name) { return run(adminProfile, 'admin', 'uncheck', '--role', 'checkbox', '--name', name); }

const ALL_FUNC_ITEMS = ['新增菜单', '查询菜单树', 'API配置', '导出菜单', '导入菜单', '编辑菜单', '删除菜单'];

// ====== Step 0: 打开弹窗 ======
console.log('\n📋 Step 0:打开弹窗...');
adminOpen(BASE_URL + '/cloud/Apex/system/role');
adminWait(2);

// 编辑权限测试角色
const r0 = adminEval('var rows=document.querySelectorAll("table tbody tr");for(var i=0;i<rows.length;i++){if(rows[i].textContent.includes("权限测试角色")){rows[i].querySelector("[data-op-label=\\"编辑\\"]").click();break;}}"done"');
console.log('  edit:', r0.substring(0, 80) || 'clicked');
adminWait(2);

// 切换到菜单权限 Tab
adminEval('var ts=document.querySelectorAll(".el-tabs__item");for(var i=0;i<ts.length;i++){if(ts[i].textContent.trim()==="菜单权限"){ts[i].click();break;}}"tab"');
adminWait(2);

// 搜索"菜单管理" — 直接操作 placeholder 输入框（比 ref 索引更稳）
const searchRes = adminEval([
  'var inp=document.querySelector(\'input[placeholder="请输入关键字进行搜索"]\');',
  'inp?(inp.focus(),inp.value="菜单管理",inp.dispatchEvent(new Event("input",{bubbles:true})),JSON.stringify({found:true}))',
  ':JSON.stringify({found:false})',
].join(''));
let searchOk = false;
try { searchOk = JSON.parse(searchRes).found === true; } catch (e) {}
if (!searchOk) { console.error('❌ 搜索框未找到，dialog=', adminEval('document.querySelector(".el-dialog")?"open":"closed"')); process.exit(1); }
adminWait(1);

// 点击树节点
adminEval('var ls=document.querySelectorAll(".node-label");for(var i=0;i<ls.length;i++){if(ls[i].textContent.trim()==="菜单管理"){ls[i].click();break;}}"node"');
adminWaitSelector('.el-checkbox__label');
console.log('  ✅ 弹窗就绪');

// ====== Step 2a: 清空 ======
console.log('\n🧹 Step 2a:清空...');
adminEval('var btns=document.querySelectorAll("#pane-permission button");btns[3].click();"cleared"');

// ====== Step 2b: 精确同步（opencli check/uncheck，避免 Vue 回滚） ======
console.log('\n☑️  Step 2b:精确同步...');
const readStateJS = 'var inps=document.querySelectorAll(".el-dialog__body input[type=checkbox]");var s={};for(var i=0;i<inps.length;i++){var t=inps[i].parentElement.parentElement.textContent.trim();if(t.match(/菜单|API/))s[t]=inps[i].checked;};JSON.stringify(s)';
for (const name of ALL_FUNC_ITEMS) {
  if (checkItems.includes(name)) adminCheck(name);
  else adminUncheck(name);
}
for (const name of checkItems) adminCheck(name);

// ====== Step 2c: 保存前门禁 + 保存 ======
console.log('\n💾 Step 2c:验证+保存...');
const stateRes = adminEval(readStateJS);
console.log('  state:', stateRes);

let stateOk = false;
try {
  const st = JSON.parse(stateRes);
  stateOk = checkItems.every(t => st[t] === true)
    && Object.keys(st).every(k => checkItems.includes(k) ? st[k] === true : st[k] === false);
} catch (e) { /* fall through */ }
if (!stateOk) {
  console.error('❌ 功能项状态与 check 不一致，拒绝保存');
  process.exit(1);
}

adminEval('var btns=document.querySelectorAll("button");for(var i=0;i<btns.length;i++){if(btns[i].offsetParent!==null&&btns[i].textContent.trim()==="确 定"){btns[i].click();break;}}"saved"');
adminWait(3);
const dlgCheck = adminEval('var d=document.querySelector(".el-dialog");d&&d.offsetParent!==null?"open":"closed"');
console.log('  dialog:', dlgCheck);

// ====== Step 4: Test 退出重登 ======
console.log('\n🔄 Step 4:Test退出重登...');
testEval('var u=document.querySelector("[id*=\\"el-id\\"][role=button][aria-haspopup=menu]");if(u)u.click();var ms=document.querySelectorAll("[role=menuitem]");for(var i=0;i<ms.length;i++){if(ms[i].textContent.trim()==="退出登录"){ms[i].click();break;}}"logout"');
testWait(1);
testEval('var b=document.querySelector(".el-message-box__btns .el-button--primary");if(b)b.click();"confirmed"');
testWait(3);
testEval('sessionStorage.clear();localStorage.clear();"cleared"');
testOpen(BASE_URL + '/cloud/login');
testWait(2);

console.log('  📝 登录中...');
const onLogin = testEval('JSON.stringify({login:location.href.includes("/login")})');
let onLoginPage = false;
try { onLoginPage = JSON.parse(onLogin).login === true; } catch (e) {}
if (onLoginPage) {
  testFillRole('textbox', '手机号/邮箱地址', '13813815913');
  testFillRole('textbox', '密码', '123456');
  testClickRole('button', '登录');
} else {
  testEval('var u=document.querySelector("[id*=\\"el-id\\"][role=button][aria-haspopup=menu]");if(u)u.click();"menu"');
  testWait(1);
  testEval('var ms=document.querySelectorAll("[role=menuitem]");for(var i=0;i<ms.length;i++){if(ms[i].textContent.trim()==="退出登录"){ms[i].click();break;}}"logout"');
  testWait(1);
  testEval('var b=document.querySelector(".el-message-box__btns .el-button--primary");if(b)b.click();"confirmed"');
  testWait(3);
  testEval('sessionStorage.clear();localStorage.clear();"cleared"');
  testOpen(BASE_URL + '/cloud/login');
  testWait(2);
  testFillRole('textbox', '手机号/邮箱地址', '13813815913');
  testFillRole('textbox', '密码', '123456');
  testClickRole('button', '登录');
}
testWait(6);
let loginCheck = testEval('JSON.stringify({url:location.href,name:JSON.parse(sessionStorage.getItem("userInfo")||"{}").username||""})');
try {
  const lc = JSON.parse(loginCheck);
  if (!lc.name && lc.url.includes('/login')) {
    testClickRole('button', '登录');
    testWait(6);
    loginCheck = testEval('JSON.stringify({url:location.href,name:JSON.parse(sessionStorage.getItem("userInfo")||"{}").username||""})');
  }
} catch (e) { /* ignore */ }
console.log('  login:', loginCheck);

// ====== Step 5: 验证 ======
console.log('\n✅ Step 5:验证...');
testOpen(BASE_URL + '/cloud/Apex/system/menu');
testWait(3);
const verifyRes = testEval([
  'var ui=JSON.parse(sessionStorage.getItem("userInfo")||"{}");',
  'var names=["搜索","新增","导入","导出"];',
  'var btns=names.map(function(n){',
  '  var b=Array.from(document.querySelectorAll("button")).find(function(x){return x.textContent.trim()===n;});',
  '  return n+(b&&b.offsetParent!==null?":VIS":":hid");',
  '});',
  'var visibleRowOps=Array.from(document.querySelectorAll(".operation-buttons-inline .operation-column-op-item"))',
  '  .filter(function(x){return x.offsetParent!==null;})',
  '  .map(function(x){return x.getAttribute("data-op-label");});',
  'var uniq=[];for(var i=0;i<visibleRowOps.length;i++){if(uniq.indexOf(visibleRowOps[i])===-1)uniq.push(visibleRowOps[i]);}',
  'JSON.stringify({perms:ui.perms||[],btns:btns,visibleRowOps:uniq,tableLoaded:!!document.querySelector(".el-table__body")})',
].join(''));
console.log('  verify:', verifyRes);

// S8 额外：行内权限配置 → 弹窗内 API配置
let apiConfigOk = true;
if (scenario.expectApiConfigInDialog) {
  testEval([
    'var b=Array.from(document.querySelectorAll(\'[data-op-label="权限配置"]\'))',
    '  .find(function(x){return x.offsetParent!==null;});',
    'if(b)b.click();',
    '"open-perm-dlg"',
  ].join(''));
  testWait(2);
  const apiRes = testEval([
    'var dlg=document.querySelector(".el-dialog");',
    'var open=!!(dlg&&dlg.offsetParent!==null);',
    'var api=open&&!!Array.from(dlg.querySelectorAll(\'[data-op-label="API配置"]\'))',
    '  .find(function(x){return x.offsetParent!==null;});',
    'JSON.stringify({dialogOpen:open,hasApiConfig:!!api})',
  ].join(''));
  console.log('  apiConfig:', apiRes);
  try {
    const a = JSON.parse(apiRes);
    apiConfigOk = a.dialogOpen && a.hasApiConfig;
  } catch (e) { apiConfigOk = false; }
  testEval('var b=document.querySelectorAll(".el-dialog__headerbtn");if(b.length)b[b.length-1].click();"close"');
  testWait(1);
}

// ====== 对比 ======
const expectedPerms = scenario.expectedPerms || [];
const expectedToolbar = scenario.expectToolbar || [];
const expectedRowOps = scenario.expectRowOps || [];
const expectHiddenToolbar = scenario.expectHiddenToolbar || [];
const expectHiddenRowOps = scenario.expectHiddenRowOps || [];
let verdict = 'CHECK';
try {
  const v = JSON.parse(verifyRes);
  const hp = expectedPerms.every(p => v.perms.includes(p));
  const hb = expectedToolbar.every(b => v.btns.includes(b));
  const hr = expectedRowOps.every(op => v.visibleRowOps.includes(op));
  const ht = scenario.expectTree ? v.tableLoaded === true : true;
  const hnt = expectHiddenToolbar.every(x => v.btns.includes(x));
  const hnr = !expectHiddenRowOps.some(op => v.visibleRowOps.includes(op));
  if (hp && hb && hr && ht && hnt && hnr && apiConfigOk) verdict = 'PASS';
  else if (!hp || (expectedRowOps.length && !hr) || (scenario.expectTree && !ht) || !hnt || !hnr || !apiConfigOk) verdict = 'FAIL';
  console.log(`\n🏁 ${verdict}`);
  console.log(`  perms: expected=[${expectedPerms}] got=[${v.perms}] ${hp ? '✓' : '✗'}`);
  console.log(`  toolbar: expected=[${expectedToolbar}] got=[${v.btns}] ${hb ? '✓' : '✗'}`);
  if (expectedRowOps.length) console.log(`  rowOps: expected=[${expectedRowOps}] got=[${v.visibleRowOps}] ${hr ? '✓' : '✗'}`);
  if (scenario.expectTree) console.log(`  tree: expected=loaded got=${v.tableLoaded} ${ht ? '✓' : '✗'}`);
  if (expectHiddenToolbar.length) console.log(`  hiddenToolbar: expected=[${expectHiddenToolbar}] ${hnt ? '✓' : '✗'}`);
  if (expectHiddenRowOps.length) console.log(`  hiddenRowOps: expected absent [${expectHiddenRowOps}] got=[${v.visibleRowOps}] ${hnr ? '✓' : '✗'}`);
  if (scenario.expectApiConfigInDialog) console.log(`  apiConfigInDialog: ${apiConfigOk ? '✓' : '✗'}`);
} catch (e) {
  verdict = 'PARSE_ERR';
  console.log(`\n🏁 ${verdict}: ${e.message}`);
}
process.exit(verdict === 'PASS' ? 0 : 1);
