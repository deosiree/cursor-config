// ==UserScript==
// @name        操作列权限诊断（OpenCLI）
// @description 用户管理页操作列「只有编辑」排查脚本。检查 isCurrentUser、角色 perm、FUNCTION isVisible、inline-visible-count
// @usage       opencli browser <session> eval "$(cat scripts/diagnose-op-column.js)"
// @source      自生长的OpenCLI自动化知识体系/opencli-ux-user-perm/
// ==/UserScript==

// 诊断链（判定链详见 references/permission-op-column-pitfalls.md）
// 1. isCurrentUser → 本人行隐藏停用/删除/重置密码
// 2. 角色 perms → 命中哪些 sys:user:*
// 3. FUNCTION isVisible → 显示兜底
// 4. inline-visible-count → 行内可见 vs 更多折叠

(function diagnoseOpColumn() {
  'use strict';

  const result = {
    session: {},
    tableRows: [],
    diagnosis: [],
    action: ''
  };

  // ── 1. 获取当前 session 用户信息 ──
  const userInfoRaw = sessionStorage.getItem('userInfo');
  let sessionUser = {};
  try {
    sessionUser = JSON.parse(userInfoRaw || '{}');
  } catch (e) {
    sessionUser = {};
  }
  const userId = sessionUser.id || sessionUser.userId || '';
  const userName = sessionUser.userName || sessionUser.nickname || '';
  const sessionPerms = (sessionUser.permissions || sessionUser.perms || [])
    .filter(p => p.startsWith('sys:user:'));

  result.session = {
    userId,
    userName,
    userPerms: sessionPerms
  };

  // ── 2. 遍历表格行 ──
  const rows = [...document.querySelectorAll('.el-table__body tbody tr')];

  if (rows.length === 0) {
    result.diagnosis.push('❌ 未找到表格行，确认页面已加载完整');
    result.action = 'wait_text "用户列表" → screenshot → 检查页面状态';
    return JSON.stringify(result, null, 2);
  }

  let currentUserCount = 0;
  let otherUserCount = 0;

  rows.forEach((tr, idx) => {
    // 取第二列（用户名）
    const userNameEl = tr.cells[1];
    const rowUserName = userNameEl?.innerText?.trim() || '';

    // 取操作列 OpItem
    const opItems = [...tr.querySelectorAll('.operation-column-op-item')]
      .filter(el => !el.classList.contains('operation-column-op-item--hidden'))
      .map(el => ({
        label: el.dataset?.opLabel || el.innerText?.trim() || 'unknown',
        visible: !el.classList.contains('operation-column-op-item--hidden')
      }));

    const hasMore = !!tr.querySelector('.operation-column-more-trigger');
    const rowUserId = tr.dataset?.userId || '';

    const isCurrentUser =
      rowUserId === userId ||
      rowUserName === userName ||
      (rowUserId === '' && idx === 0 && rows.length === 1); // 可能仅本人一行

    if (isCurrentUser) currentUserCount++;
    else otherUserCount++;

    result.tableRows.push({
      index: idx,
      userName: rowUserName,
      isCurrentUser,
      opItems: opItems.map(o => o.label),
      hasMore
    });
  });

  // ── 3. 诊断分析 ──

  // 3a. 检查 isCurrentUser 守卫
  if (currentUserCount > 0 && otherUserCount === 0) {
    result.diagnosis.push('⚠️ 列表仅有本人行，!isCurrentUser 守卫隐藏了停用/删除等操作');
    result.diagnosis.push('   → 创建他人用户后重跑诊断: 使用 seed_users flow');
  }

  // 3b. 检查 perm 覆盖
  const ownedPerms = sessionPerms;
  const allPerms = ['sys:user:add', 'sys:user:edit', 'sys:user:lock', 'sys:user:unlock',
    'sys:user:resendActivation', 'sys:user:resetPassword', 'sys:user:delete'];
  const missing = allPerms.filter(p => !ownedPerms.includes(p));

  if (missing.length > 5) {
    result.diagnosis.push(`❌ session 仅有 ${ownedPerms.length} 个 sys:user:* perm: [${ownedPerms.join(', ')}]`);
    result.diagnosis.push('   → 角色 perm 不足，操作列受限');
  } else {
    result.diagnosis.push(`✅ session 有 ${ownedPerms.length} 个 sys:user:* perm: [${ownedPerms.join(', ')}]`);
    if (missing.length > 0) {
      result.diagnosis.push(`   ⚠️ 缺少: [${missing.join(', ')}]`);
    }
  }

  // 3c. 检查 more 触发器（是否被折叠）
  const rowsWithMore = result.tableRows.filter(r => r.hasMore);
  if (rowsWithMore.length > 0) {
    result.diagnosis.push(`ℹ️ ${rowsWithMore.length} 行有「更多」折叠，inline-visible-count 限制行内可见数`);
    result.diagnosis.push('   → 确认 menu YAML 中各 OpItem 的 isVisible 是否返回 true');
  }

  // 3d. 仅编辑模式检测
  const otherRows = result.tableRows.filter(r => !r.isCurrentUser);
  if (otherRows.length > 0) {
    const onlyEditRows = otherRows.filter(r =>
      r.opItems.length === 1 && r.opItems[0] === '编辑'
    );
    if (onlyEditRows.length > 0) {
      result.diagnosis.push('⚠️ 他人行操作列仅「编辑」');
      result.diagnosis.push('   排查方向：');
      result.diagnosis.push('   1. 角色 perm 是否缺少 sys:user:lock/delete/resetPassword 等');
      result.diagnosis.push('   2. FUNCTION isVisible() 是否返回 false');
      result.diagnosis.push('   3. inline-visible-count=2 + 可渲染 OpItem 仅 1 个 → 无「更多」');
    }
  }

  // ── 4. 建议操作 ──
  if (missing.length > 5) {
    result.action = '补充角色 perm → 重新登录 → 再次诊断';
  } else if (currentUserCount > 0 && otherUserCount === 0) {
    result.action = '先创建他人用户 → seed_users flow → 再次诊断';
  } else {
    result.action = '如有疑问，对照 references/permission-op-column-pitfalls.md 逐项排查';
  }

  return JSON.stringify(result, null, 2);
})();
