/**
 * 菜单管理 E2E — 运行单个场景
 *
 * 前置条件（请确保已执行）：
 *   1. admin 已在角色编辑弹窗中
 *   2. 已切换到「菜单权限」Tab
 *   3. 已搜索目标页面并点击树节点
 *   4. 功能项面板已显示（wait selector ".el-checkbox__label"）
 *
 * 用法：
 *   opencli --profile <admin> browser <session> eval "
 *     window.__SCENARIO__ = {check:['查询菜单树','编辑菜单']};
 *   "
 *   opencli --profile <admin> browser <session> eval "$(cat run-scenario.js)"
 *
 * 返回 JSON（供外层 skill 消费）：
 *   {
 *     "action": "completed" | "failed",
 *     "checked": ["查询菜单树", ...],
 *     "state": { "新增菜单": false, "查询菜单树": true, ... },
 *     "warnings": ["编辑菜单 被 Vue 回滚"],
 *     "error": "..."  // 仅失败时
 *   }
 */

(function() {
  var scenario = window.__SCENARIO__;
  if (!scenario) {
    return JSON.stringify({action: 'failed', error: 'No scenario config. Set window.__SCENARIO__ first.'});
  }

  var checkItems = scenario.check || [];

  // ====== 0. 诊断：记录清空前状态 ======
  var before = readCheckboxState();
  var warnings = [];

  // ====== 1. 清空功能项 ======
  var btns = document.querySelectorAll('#pane-permission button');
  if (btns.length < 4) {
    return JSON.stringify({action: 'failed', error: 'permission panel buttons not found', found: btns.length});
  }
  btns[3].click();

  // ====== 2. 逐个勾选目标项 ======
  var labels = document.querySelectorAll('.el-dialog__body .el-checkbox__label');
  var checked = [];
  for (var i = 0; i < labels.length; i++) {
    var t = labels[i].textContent.trim();
    if (checkItems.indexOf(t) !== -1) {
      labels[i].closest('.el-checkbox').click();
      checked.push(t);
    }
  }

  // ====== 3. 验证勾选状态（Vue 响应式可能回滚） ======
  var after = readCheckboxState();
  for (var k = 0; k < checkItems.length; k++) {
    var item = checkItems[k];
    if (after[item] !== true) {
      // 被 Vue 回滚了 — 重试一次
      var labels2 = document.querySelectorAll('.el-dialog__body .el-checkbox__label');
      for (var m = 0; m < labels2.length; m++) {
        if (labels2[m].textContent.trim() === item) {
          labels2[m].closest('.el-checkbox').click();
          break;
        }
      }
      var after2 = readCheckboxState();
      if (after2[item] !== true) {
        warnings.push(item + ' 勾选失败（Vue 回滚，可能缺页面节点权限）');
      }
    }
  }

  // ====== 4. 检查不应当勾选的项 ======
  for (var key in after) {
    if (after[key] === true && checkItems.indexOf(key) === -1) {
      // 有残留权限 — 尝试点击取消
      var labels3 = document.querySelectorAll('.el-dialog__body .el-checkbox__label');
      for (var n = 0; n < labels3.length; n++) {
        if (labels3[n].textContent.trim() === key) {
          labels3[n].closest('.el-checkbox').click();
          break;
        }
      }
      warnings.push(key + ' 残留，已尝试取消');
    }
  }

  // ====== 5. 保存 ======
  // 检查 dialog 是否还在（未意外关闭）
  var dialog = document.querySelector('.el-dialog');
  if (!dialog || dialog.offsetParent === null) {
    return JSON.stringify({action: 'failed', error: 'dialog closed before save', warnings: warnings});
  }

  var saveBtn = document.querySelector('.el-dialog__footer .el-button--primary');
  if (!saveBtn) {
    return JSON.stringify({action: 'failed', error: 'save button not found', warnings: warnings});
  }
  saveBtn.click();

  return JSON.stringify({
    action: 'completed',
    checked: checked,
    state: readCheckboxState(),
    warnings: warnings.length > 0 ? warnings : undefined
  });

  // ====== 辅助函数 ======
  function readCheckboxState() {
    var inps = document.querySelectorAll('.el-dialog__body input[type=checkbox]');
    var state = {};
    for (var i = 0; i < inps.length; i++) {
      var txt = inps[i].parentElement.parentElement.textContent.trim();
      if (txt.match(/菜单|API/)) state[txt] = inps[i].checked;
    }
    return state;
  }
})();
