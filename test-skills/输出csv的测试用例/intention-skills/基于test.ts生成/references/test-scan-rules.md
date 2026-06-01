# Test 扫描规则

## describe/it 统计

- 每个 `describe` 块单独统计
- 仅统计 `it(...)` 调用，不统计 `describe` 自身
- 跳过 `it.skip` 和 `describe.skip`

## 分类标准

| 测试特征 | 处理方式 |
|---------|---------|
| `expectTypeOf(...)` | 跳过，记入 skippedTests |
| `expect(...).toMatchObject({ 字段 })` 含断言 | → 一条 cases，预期表述「支持场景下的期望结构」 |
| `expect(...).toBeNull()` / `toBeUndefined()` | → 反向场景 |
| 同一 it 含正反两段 expect | → 一条 cases，预期分 `正向：` / `反向：` |
| 同一 it 含多个独立 expect | → 拆分多条 cases（如路由规范化 11 条） |

## 路径路由

| 路径包含 | 路由到 |
|---------|--------|
| `src/gateway/` | `gateway-基于test.ts生成` |
| `src/api/` | `api-基于test.ts生成` |
| 其他 | api 兜底 + darwin 提示 |
