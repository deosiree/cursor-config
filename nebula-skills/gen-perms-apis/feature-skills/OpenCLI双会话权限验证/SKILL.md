---
name: OpenCLI双会话权限验证
description: OpenCLI 双会话单轮 E2E：admin 配置角色权限 + test 用户验证。通用底座；菜单 8 场景见菜单管理功能项依赖链验证。触发词：双会话验证、opencli权限e2e、admin配置角色、test用户验证、sessionStorage清空。
---

# OpenCLI双会话权限验证

## TL;DR

- **本 skill**：单轮「配 perm → 等 3s → test 退出重登 → 逐页验证」
- **菜单 8 场景矩阵**：不要在此手操，走 `[[../菜单管理功能项依赖链验证]]` 的 node 脚本
- **仅弹窗内勾功能项**：见 `[[../角色菜单权限树快速配置]]`
- **首次搭环境**：见 `[[../双会话OpenCLI环境初始化]]`
- session 名在本项目 node 脚本中统一为 `admin` / `test`（`--profile` 才是隔离关键）

## RED

- 没有本 skill 时，最常见的失败是 test 用户验证时 sessionStorage 残留旧权限，导致结果不可信
- 也容易忘记 admin 配置后需要等待生效（角色保存不是即时同步到 test 用户会话）
- 常见失败：
  - test 用户未清空 sessionStorage 就登录 → 读到旧 `userInfo` / `permsMap`
  - admin 保存角色后立即切 test 用户验证 → 权限未同步
  - **Session A 和 Session B 在同一 Chrome profile → Cookie 共享，只能登录同一用户**
  - **不同 session 名只是不同 tab，不是不同 profile —— 必须用 `--profile` 全局 flag**
  - **功能项显示状态为"隐藏" → 用户有 perm 但按钮不显示** —— 权限授权正确但 UI 不可见，误判为"未授权"
  - **操作列按钮需要"查询"权限为前提** —— 有 edit/delete 但行内按钮不可见，因为树数据依赖 `sys:menu:query` 加载

### 人工门禁：Chrome 用户数检测

执行前必须先 `opencli doctor`，检查 Profiles 数量：

- **≥ 2 个 profile** → 继续，按不同 profile 分配 admin 和 test 会话
- **只有 1 个 profile** → **停下来，反馈用户**：在 Chrome 中创建新用户（`设置 → 用户 → 添加`），并在新用户窗口安装 OpenCLI 扩展

### Element Plus checkbox 操作陷阱（核心经验）

菜单管理/角色管理中的权限 checkbox 是 Element Plus 的 `el-checkbox` 组件，深度绑定 Vue 响应式系统。直接操作会有以下陷阱：

| 操作方式 | 结果 | 原因 |
|---------|------|------|
| `nativeSetter + dispatchEvent(change)` | 改 DOM 不改 Vue → 保存旧值 | Vue 内部 state 未更新 |
| `input.click()` 或 `label.click()` | 可能被 Vue 回滚 | 事件未正确冒泡到组件 |
| `checkbox.dispatchEvent(MouseEvent)` | 单次有效但 Vue 立即重渲染 | 合成事件未触发 Vue 的委托 |
| **✅ `.el-checkbox.click()`**（最外层 wrapper） | **Vue 正确响应** | 触发了 Element Plus 的 `@click` 处理 |

> **结论：** 遍历 checkbox 时必须用 `labels[i].closest('.el-checkbox').click()`，不要自己造 event。

## 输入

- `本轮权限配置`：必填（要勾选的 perm 列表 + 要取消的 perm 列表）
- `admin 凭据`：默认 `admin@system.local / 123456`
- `test 用户凭据`：默认 `13813815913 / 123456`
- `测试角色名`：默认 `权限测试角色`
- `targetUrl`：默认 `http://localhost:8080`

## GREEN

### 1. Session A：Admin 配置角色权限

```
1. opencli --profile admin-profile browser perm-a open <targetUrl>/cloud/login
2. 用 admin 凭据登录（fill + click 登录）
3. 导航到 角色管理（/cloud/Apex/system/role）
4. 找到"权限测试角色" → 进入编辑（eval 定位表格行 + click data-op-label="编辑"）
5. 切换到"菜单权限" Tab（eval 点击 .el-tabs__item 文本="菜单权限"）
6. ⚠️ 先搜索再勾选页面节点（绕过树懒加载）：
   a. opencli find 搜索框 input → type "页面名"（如"菜单管理"）
   b. 点击树节点 → 功能项面板出现（wait selector ".el-checkbox__label"）
   c. 确认页面节点复选框已勾选（aria-checked=true）
7. ⚠️ 配置功能项 checkbox — **必须走「功能项配置三步法」（见下方 1a），禁止跳过清空步骤直接保存**
   ❌ 错误做法：看到功能项面板后直接点「确 定」
   ✅ 正确做法：清空(btns[3].click()) → 只勾选目标项 → 验证状态 → 保存
8. 保存 → 用 textContent "确 定" 找按钮点击（⚠️ class selector 在 qiankun 子应用不可达） → 验证弹窗关闭
9. 等待 3 秒（权限同步缓冲）
```

### 1a. 功能项配置三步法

> ⚠️ **强制门禁：必须先清空再勾选。** 若跳过清空直接勾选→保存，旧权限将累积残留，导致验证结果不可信。

> **前提：** 必须先勾选页面节点（步骤 6c），否则操作功能项会被 Vue 回滚。

**策略 A（少量勾选 → 清空+选）：**

```javascript
// 1. 清空所有功能项（⚠️ 树面板和功能项面板各有一套清空/全选按钮）
//    btns[0]=树全选  btns[1]=树清空  btns[2]=功能项全选  btns[3]=功能项清空
var btns = document.querySelectorAll('#pane-permission button');
btns[3].click();  // 功能项清空

// 2. 只勾选目标项
var labels = document.querySelectorAll('.el-dialog__body .el-checkbox__label');
for (var i = 0; i < labels.length; i++) {
  var t = labels[i].textContent.trim();
  if (t === '新增菜单' || t === '查询菜单树') {
    labels[i].closest('.el-checkbox').click();  // ← 必须点 .el-checkbox
  }
}

// 3. 验证
var inps = document.querySelectorAll('.el-dialog__body input[type=checkbox]');
// 目标项 checked=true，其他 checked=false
```

**策略 B（大量勾选 → 全选+取消）：**

```javascript
// 1. 功能项全选
var btns = document.querySelectorAll('#pane-permission button');
btns[2].click();  // 功能项全选

// 2. 逐个取消不需要的
var labels = document.querySelectorAll('.el-dialog__body .el-checkbox__label');
for (var i = 0; i < labels.length; i++) {
  var t = labels[i].textContent.trim();
  if (t === '删除菜单' || t === '编辑菜单') {
    labels[i].closest('.el-checkbox').click();
  }
}
```

### 2. Session B：Test 用户验证

```
1. opencli --profile test-profile browser perm-b open <targetUrl>/cloud/login
2. 强制清空 sessionStorage（eval "sessionStorage.clear()"）
3. 用 test 凭据登录（fill 手机号 + fill 密码 + click 登录按钮）
4. 登录后不 refresh（验证 computed 响应式）
5. 逐页验证：
   - 有 perm 的页面：可访问、功能可见
   - 无 perm 的页面：被拦截 or 功能不可见
   - **若按钮不可见但 permissions 中有该 perm → 去菜单管理检查该功能项的"显示状态"是否为"隐藏"**
6. 记录每个 perm 的实际行为 + **显示状态**
```

### 2b. 每轮验证前：test 用户退出→重登（强制）

> 每次 admin 修改角色权限后，test 用户**必须**走完整退出→重新登录流程，否则 sessionStorage 残留旧权限。

```javascript
// 1. 点击右上角用户头像（展开下拉菜单）
document.querySelector('[id*="el-id"][role=button][aria-haspopup=menu]')?.click();

// 2. 点击"退出登录"
var ms = document.querySelectorAll('[role=menuitem]');
for (var i = 0; i < ms.length; i++) {
  if (ms[i].textContent.trim() === '退出登录') { ms[i].click(); break; }
}

// 3. 等待弹出确认框，点"确定"
// wait time 1
document.querySelector('.el-message-box__btns .el-button--primary')?.click();

// 4. 等待跳转到登录页 → 重新登录（同步骤 1-3）
// wait time 4
```

> **关键：** 所有命令必须带 `--profile`。不同 session 名（perm-a/perm-b）只是 tab 区分，`--profile` 才是 Chrome 用户级别的 cookie 隔离。

### 3. 验证检查项模板

| 检查项 | 验证方法 | 预期 |
|--------|---------|------|
| 页面守卫 | 直接访问路由 | 有 perm→正常渲染；无 perm→拦截提示 |
| Header 入口 | 用户下拉菜单 | 有 perm→入口可见；无 perm→不可见 |
| 功能按钮 | 页面内按钮/工具栏 | 有 perm→可点击；无 perm→不显示 or disabled |
| **功能项显示状态** | 菜单管理 → 页面节点 → 权限配置 → 功能项列表 | **每个功能项的"显示状态"必须为"显示"，否则有 perm 也不会渲染按钮** |
| API 调用 | Network 面板 | 有 perm→API 正常返回；无 perm→403 or 不发起 |

### 4. 验证结果结构

```json
{
  "round": 1,
  "config": {
    "granted": ["sys:dashboard:view", "sys:tenant:query"],
    "revoked": ["sys:tenant:add"]
  },
  "results": [
    {
      "perm": "sys:dashboard:view",
      "status": "pass",
      "actual": "首页正常渲染，loadDashboardData 返回 200"
    },
    {
      "perm": "sys:tenant:query",
      "status": "pass",
      "actual": "租户列表正常加载"
    },
    {
      "perm": "sys:tenant:add",
      "status": "pass",
      "actual": "新增按钮不可见，符合预期（已取消）"
    }
  ]
}
```

## 输出

- `verificationResults`：本轮结构化验证结果
- `sessionLogs`：OpenCLI 操作日志（用于审计）

## REFACTOR

- 若 admin 和 test 会话共用同一 Chrome profile，补「必须使用 `--profile` 全局 flag + 不同 Chrome 用户」的强制要求
- 若 `opencli doctor` 只有 1 个 profile 但未反馈用户，补「人工门禁：检测到单 profile 立即停止并告知用户创建第二个 Chrome 用户」
- 若验证结果缺少 `actual` 字段（只有 pass/fail 无具体行为描述），补字段要求
- 若未验证负向（只测有 perm 不测无 perm），补负向用例强制要求
- 若 sessionStorage 清空步骤被跳过，补「切用户前必须 `sessionStorage.clear()`」的硬门禁
- 若 agent 用 `nativeSetter` 改 checkbox 导致保存旧值 → 补「必须用 `.el-checkbox.click()` 触发 Vue 响应式」的约束
- 若 agent 混用树面板和功能项面板的清空/全选按钮 → 补「`btns[0]=树全选, btns[1]=树清空, btns[2]=功能项全选, btns[3]=功能项清空」的索引说明
- 若 agent 未勾选页面节点先操作功能项 → 补「必须先确保页面 checkbox 已选，否则功能项操作被 Vue 回滚」的约束
- 若 admin 弹窗意外关闭（跳转到 about:blank） → 补「重开 open role URL + 重新编辑」的恢复流程
- 若 qiankun 子应用中 `native setter` 报 `Illegal invocation` → 补「用 `opencli type` 代替 native setter 填搜索框」
- 若角色权限有累积效应（旧 perm 不消失） → 补「每轮前必须先 `btns[3].click()` 清空，不能只逐个取消」

## 使用示例

```text
本轮配置：勾选 sys:dashboard:view、sys:tenant:query，取消 sys:tenant:add。
用 OpenCLI 双会话验证。
```
