# api 层：基于 test.ts 生成用例

将 `src/api/**/__tests__/**` 的 Vitest 用例转为 cases.json 行。偏 helper/缓存/项目默认值/localStorage。

## 用法

输入：menu-system-only.test.ts（3 条 it）
输出：3 条 cases，验证 localStorage→F12 Application、项目下拉默认值等
