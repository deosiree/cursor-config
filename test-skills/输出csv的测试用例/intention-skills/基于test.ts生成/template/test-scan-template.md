# Test 扫描记录模板

## 扫描结果

| 源文件 | describe | it 总数 | 跳过(expectTypeOf) | 可转为 cases |
|--------|----------|---------|-------------------|-------------|
| `src/gateway/__tests__/menu.gateway.test.ts` | `MenuGateway` | 14 | 0 | 14 |
| `src/gateway/__tests__/menu-tree-helpers.test.ts` | `menuTreeHelpers` | 3 | 0 | 3 |
| `src/gateway/__tests__/menu-route-normalization.test.ts` | `normalizeMenuRoutePath` + `normalizeMenuRedirect` + `resolveTopLevelMenuRedirect` | 11 | 0 | 11 |
| `src/api/__tests__/menu-system-only.test.ts` | `menuSystemOnly` | 3 | 0 | 3 |
| `src/api/__tests__/menu-project-scope.test.ts` | `menuProjectScope` | 3 | 0 | 3 |
| `src/api/__tests__/menu-repo-cache.test.ts` | `menuRepoCache` | 2 | 0 | 2 |

## 分类规则

- `expectTypeOf` / 纯编译期断言 → 跳过，记入 `skippedTests`
- 多 `expect` 的 `it` → 拆成多行（如路由规范化 11 条 it 对应 11 条 cases）
- 正反向合并场景（如 findNodeById 存在/不存在）→ 一行，预期分 `正向：` / `反向：`
