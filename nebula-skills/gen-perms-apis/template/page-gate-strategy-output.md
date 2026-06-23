# 页面门控权限策略输出

## 模块：{{模块名}}

### 门控决策

| 字段 | 值 |
|------|-----|
| `pageGatePerm` | 如 `sys:tenant:query` |
| `gateType` | `view` / `query` |
| `canGateComputed` | 如 `canQuery` |
| `emptyStateScope` | `整页` / `仅内容区`（默认整页） |

### 操作级 perm（有门控时）

| perm | 无 perm 时 UI |
|------|---------------|
| `sys:tenant:add` | 隐藏新增按钮 |
| ... | ... |

### 人工确认记录

- [ ] 列表页缺 query 是否仍显示「新增」？（默认否 → 整页空态）
- [ ] 门控 perm 是否已在权限设计方案中？

### 参考

- [[../../references/page-no-permission-pattern.md]]
- [[../sample-run/before-02-页面空态/]]
- [[../sample-run/after-02-页面空态/]]
