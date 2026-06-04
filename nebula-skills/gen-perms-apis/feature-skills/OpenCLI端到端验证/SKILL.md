---
name: OpenCLI端到端验证
description: 通过 SSH + OpenCLI 在浏览器中验证权限配置：bypass 路径、Header 显隐、页面守卫、sessionStorage 字段、登录时序等。
---

# OpenCLI端到端验证

## RED

- 没有本 skill 时，权限验证只停留在代码审查，不验证运行时行为
- 常见漏验：
  - `isOwner` 是否真正绕过所有 perm 检查
  - 登录后 Header 组件是否正确显示权限入口
  - `sessionStorage.userInfo` 字段是否完整
  - computed 缓存是否导致登录后权限不刷新

## 输入

- `验证目标`：必填（bypass / Header / 页面守卫 / 字段验证）
- `targetUrl`：默认 `http://localhost:8080`
- `登录凭据`：必填

## GREEN

### 1. OpenCLI 会话建立

```
1. SSH 到目标环境
2. 打开浏览器到 targetUrl
3. 清空 sessionStorage（如需负向测试）
4. 执行登录流程
```

### 2. 验证检查项

| 检查项 | 验证方法 | 预期结果 |
|--------|---------|---------|
| bypass 生效 | `checkHasPerm('sys:dashboard:view')` | `isOwner=true` 时返回 `true` |
| bypass 失效 | 模拟 `isOwner=false` 后 `checkHasPerm` | 返回 `false`，页面被拦截 |
| Header 显隐 | 登录后下拉菜单检查「个人中心」 | 有 `sys:profile:view` 时可见 |
| 登录后不刷新 | 登录后**不执行 `reload()`**，检查 Header | Header 中的 perm 入口随登录出现 |
| sessionStorage 字段 | `JSON.parse(sessionStorage.getItem('userInfo'))` | 含 `isOwner`、`permissions` 等字段 |
| 页面守卫 | 直接访问受保护路由 | 无 perm 时显示拦截提示 |
| 负向测试 | 模拟 perm 缺失 | 对应功能不显示/不可点击 |

### 3. 关键注意事项

- **登录后不要 `reload()`**：验证 computed 是否响应式更新
- **检查 `sessionStorage` 而非 Pinia store**：`checkHasPerm` 直接读 sessionStorage
- **区分 microfb 基座和 apex 子应用**：Header 在基座，页面守卫在子应用
- **qiankun 环境**：子应用在登录后 mount，与基座生命周期不同

### 4. 验证报告

每项检查记录：

- 检查项名称
- 执行步骤
- 实际结果
- 是否通过
- 若未通过：根因分析与建议修复

## 输出

- `verificationReport`：逐项验证结果
- `issuesFound`：发现的问题清单
- `recommendations`：修复建议

## REFACTOR

- 若验证退化为填写清单而不实际执行 OpenCLI 命令，收紧：「每个检查项必须有控制台截图或返回值证据」
- 若验证报告充斥"通过"但无具体数据，优先要求输出 `checkHasPerm` 返回值、`sessionStorage` 字段值等硬证据
- 若负向测试被跳过（只测正面不测负面），补强制负向用例
- 若未区分 microfb vs apex 环境，在验证清单中强制标注当前测试的层级

## 使用示例

```text
用 OpenCLI 验证 admin@system.local 登录后 isOwner 是否正确绕过权限检查。
```

```text
用 OpenCLI 验证登录后 Header 中「个人中心」是否无需刷新即可出现。
```
