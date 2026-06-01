# gateway 层：基于 test.ts 生成用例

将 `src/gateway/**/__tests__/**` 的 Vitest 用例转为 cases.json 行。偏 F12 Network/表单回显/权限面板。

## 用法

输入：menu.gateway.test.ts（14 条 it）
输出：14 条 cases，验证 Network 请求体/表单回显/灰禁状态等
