# full_test：路由鉴权 + collectPerms（2026-07-08）

> Darwin dim8 实测。Prompt：「实跑，同步修改 opsdeck」

## 代码同步

| 仓库 | 文件 | 改动 |
|------|------|------|
| opsdeck | `src/services/permissions.ts` | 迭代剥离 resolveScope；移除 fuzzyMatchByPrefix；fuzzyRejected + matchedNodeType；isDirectoryNode |
| opsdeck | `src/router/index.ts` | **历史曾写** fuzzyRejected→/404；现行与 apex 对齐为仅 `load`（基座鉴权） |
| opsdeck | `src/services/__tests__/permissions.test.ts` | 新建 4 条 |
| opsdeck | `vitest.config.ts` + package.json | test:unit |
| apex_dev | `src/services/__tests__/permissions.test.ts` | +4 条（子路由/detail/directory/404/sibling） |

collectPerms 单层收集两仓此前已对齐，本轮补 **resolveScope 算法** 与 **守卫**。

## 实跑结果

### apex_dev

```
pnpm exec vitest run src/services/__tests__/permissions.test.ts
✓ 15 tests passed
```

新增用例：

| 用例 | 断言 |
|------|------|
| 子路由剥离 detail | matchMode=fuzzy，继承父 page perm |
| directory 命中 | fuzzyRejected=true，perms={} |
| /404 短路 | 不参与 map 鉴权 |
| collectPerms sibling | reportA 不含 reportB perm |

### opsdeck

```
pnpm run test:unit src/services/__tests__/permissions.test.ts
✓ 4 tests passed
```

| 用例 | 断言 |
|------|------|
| 子路由剥离 | 同 apex，CATALOG/page wire 类型 |
| directory(CATALOG=2) | fuzzyRejected |
| /404 短路 | perms 空 |
| collectPerms sibling | reportA 不含 reportB |

## dim8 对比（with skill vs without）

| 维度 | 带 gen-perms-apis | 不带 skill |
|------|-------------------|-----------|
| opsdeck 算法 | 迭代剥离 + directory 拒绝 | 易保留 fuzzyMatchByPrefix |
| 子路由 detail | 剥离命中父 page | 前缀最长匹配边界易错 |
| directory / 基座 404 | fuzzyRejected + **基座**拦截 | 可能当 perm 不足，或误改子应用守卫 |
| sibling perm | collectPerms 单层 | DFS 误合并 reportB |

**dim8 估分**：**9/10**（双仓 vitest 实跑；缺浏览器 E2E）

## 结论

full_test **PASS** — 路由鉴权 + collectPerms 在 apex_dev / opsdeck 行为一致，eval 4+3 场景有单元测试兜底。

## 文档

- `template/sample-run/after-03-opsdeck-路由作用域鉴权.md`
