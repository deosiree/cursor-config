---
name: 角色菜单权限树快速配置
description: 在角色编辑弹窗中，通过搜索树节点+清空功能项+opencli check/uncheck 精准配置页面功能项权限。触发词：角色权限树、功能项勾选、菜单权限Tab、btns清空。
---

# 角色菜单权限树快速配置

## TL;DR

**仅配置角色弹窗内功能项时使用**（不是完整 E2E）。完整菜单 8 场景测试 → `[[../菜单管理功能项依赖链验证]]`。

流程：搜索页面 → 点树节点 → `btns[3]` 清空 → **`opencli check/uncheck --role checkbox --name`** → textContent「确 定」保存。

通用双会话/checkbox 陷阱见 `[[../OpenCLI双会话权限验证]]` §1a。

## RED

- 没有本 skill 时，agent 容易在懒加载的树中手动展开每级目录找目标页面，浪费大量时间
- 也容易直接操作功能项 checkbox（eval/nativeSetter）而发现 Vue 响应式回滚——必须先勾选页面节点
- 容易点错「清空」按钮——树面板和功能项面板各有一组全选/清空
- 提交时 nativeSetter 只改了 DOM、未更新 Vue 内部状态 → 保存的是旧值

## 输入

- `目标页面名`：必填（如 `菜单管理`）
- `目标功能项`：必填（要勾选的功能项 perm 列表，如 `['查询菜单树','编辑菜单','API配置']`）
- `角色编辑弹窗`：假定 admin 已进入「权限测试角色」编辑弹窗

## GREEN

### 工作流

总策略：**搜索树节点 → 点击节点 → 清空功能项 → 精准勾选 → 保存**

🔴 **CHECKPOINT · 功能项面板门禁**：点击树节点后 `.el-checkbox__label` 未出现 → **停止**，检查是否误点目录节点或未勾选 page checkbox。

```
                    ┌─────────────────────────────┐
                    │   点击编辑角色 → 打开弹窗     │
                    └──────────┬────────────────  ┘
                               ↓
                    ┌─────────────────────────────┐
                    │   切换到「菜单权限」Tab        │
                    └──────────┬────────────────  ┘
                               ↓
                    ┌─────────────────────────────┐
                    │   在搜索框输入「目标页面名」   │ （绕过树懒加载）
                    └──────────┬────────────────  ┘
                               ↓
                    ┌─────────────────────────────┐
                    │   点击目标页面树节点          │ （功能项面板出现）
                    └──────────┬────────────────  ┘
                               ↓
                    ┌─────────────────────────────┐
                 ┌──┤   清空/全选按钮策略选择      ├──┐
                 │  └───────────────────────────  │  │
                 ↓                                ↓
           ┌───────────┐               ┌───────────────┐
           │ 点击「清空」│               │ 点击「全选」    │
           │ btns[3]   │               │ btns[2]       │
           └─────┬─────┘               └──────┬────────┘
                 ↓                            ↓
           ┌──────────────┐          ┌──────────────────┐
           │ 只勾选目标项   │          │ 逐个取消不需的项  │
           └──────┬───────┘          └──────┬───────────┘
                  └──────────┬──────────────┘
                             ↓
                    ┌─────────────────────────────┐
                    │   点击「确 定」保存           │
                    │   textContent === "确 定"    │
                    │   ⚠️ 勿用 .el-button--primary │
                    └─────────────────────────────┘
```

### 失败兜底（if-then）

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| 功能项勾选后 Vue 回滚 | 先确认 page 树节点 checkbox 为 checked | 改用 `opencli check --role checkbox --name` |
| 点了树的清空，功能项未变 | 用 `#pane-permission button` 的 btns[2]/[3]（功能项面板） | 勿用树面板 btns[0]/[1] |
| eval click checkbox 无效 | **禁止** nativeSetter 点 `.el-checkbox` | 只用 `opencli check/uncheck --name` |
| 保存后弹窗仍 open | textContent「确 定」按钮未命中 | 勿用 `.el-button--primary` |
| 弹窗意外关闭 | 重新打开角色编辑弹窗 | 从 Tab 切换重做 |
| qiankun 搜索框 Illegal invocation | 改用 `opencli type` | 勿用 eval nativeSetter 设值 |

### 1. 切换菜单权限 Tab

```javascript
// eval 点击"菜单权限" tab
var ts = document.querySelectorAll('.el-tabs__item');
for (var i = 0; i < ts.length; i++) {
  if (ts[i].textContent.trim() === '菜单权限') { ts[i].click(); break; }
}
```

### 2. 搜索目标页面（绕过树懒加载）

```javascript
// 用 opencli type 命令搜索
opencli browser <session> type <search-input-ref> "菜单管理"

// 或 eval 用 native setter 设值（需配合 opencli type）
// 推荐用 opencli type，因 native setter 在 qiankun 子应用会报 Illegal invocation
```

### 3. 点击目标树节点

```javascript
// 点击 菜单管理 树节点标签
var ls = document.querySelectorAll('#pane-permission .node-label, .node-label');
for (var i = 0; i < ls.length; i++) {
  if (ls[i].textContent.trim() === '菜单管理') { ls[i].click(); break; }
}

// 等待功能项面板加载
// opencli browser <session> wait selector ".el-checkbox__label"
```

### 4. 清空 + 勾选

> **勾选必须用 `opencli check/uncheck --role checkbox --name <label>`**（与菜单 E2E 脚本一致）。手操 eval 点 `.el-checkbox` 仅 debug 时用。

**策略 A（推荐）：btns[3] 清空 → check 目标项**

```bash
opencli --profile <admin> browser admin eval "document.querySelectorAll('#pane-permission button')[3].click();'cleared'"
opencli --profile <admin> browser admin check --role checkbox --name 查询菜单树
opencli --profile <admin> browser admin check --role checkbox --name 编辑菜单
# 对其余功能项 uncheck ...
```

**策略 B（大量勾选）：btns[2] 全选 → uncheck 不要的项**

### 5. 保存

🔴 **CHECKPOINT · 保存前确认**：目标功能项 checkbox 状态与预期一致 → 再点「确 定」；否则保存的是旧值。

```javascript
// qiankun 子应用中 class selector 不可靠，必须用可见按钮 textContent
var btns = document.querySelectorAll('button');
for (var i = 0; i < btns.length; i++) {
  if (btns[i].offsetParent !== null && btns[i].textContent.trim() === '确 定') {
    btns[i].click(); break;
  }
}
```

### 6. 验证保存成功

```bash
# 检查弹窗关闭
opencli profile <admin-profile> browser <session> eval "var dlg=document.querySelector('.el-dialog'); dlg && dlg.offsetParent!==null ? 'open': 'closed'"

# 等待同步
opencli --profile <admin-profile> browser <session> wait time 3
```

## 已知坑

| 坑 | 表现 | 解决方法 |
|----|------|---------|
| 未勾选页面节点 | 功能项 checkbox 操作后 Vue 回滚 | 先搜索页面节点，确认 page checkbox 为 checked |
| 点了树的清空 | 功能项没变 | 树面板和功能项面板各有一套清空/全选，要用 btns[2]/[3] |
| nativeSetter / eval click checkbox | DOM 变了 Vue 未更新 | 用 `opencli check/uncheck --name` |
| 弹窗意外关闭 | 配置丢失，admin 退回到角色列表 | 重新打开编辑弹窗，重做配置 |

## 反例黑名单（不要做）

| # | 反模式 | 后果 |
|---|--------|------|
| 1 | 未勾选 page 节点直接操作功能项 checkbox | Vue 响应式回滚，保存无效 |
| 2 | eval/nativeSetter 点 `.el-checkbox` | DOM 变、Vue 状态未更新 |
| 3 | 用树面板 btns[0]/[1] 当功能项清空 | 功能项面板状态不变 |
| 4 | 保存用 `.el-button--primary` | qiankun 子应用 selector 不可靠 |
| 5 | 与完整菜单 E2E 混用本 skill | 8 场景应走 `菜单管理功能项依赖链验证` |

## REFACTOR

- 若 agent 始终无法通过 click 修改 checkbox → 考虑直接调后端 API 配置角色权限
- 若搜索框在 qiankun 子应用内 native setter 报 Illegal invocation → 改用 `opencli type` 命令
- 若 agent 混淆了 btns[0]/[1] 与 btns[2]/[3] 的用途 → 用更明确的 CSS 选择器定位功能项面板按钮
