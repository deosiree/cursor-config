# Test 扫描输出示例

以菜单 gateway test 为例，扫描后应输出：

```text
=== 扫描结果 ===
仓库：apex_dev
路径：src/gateway/__tests__/menu*.test.ts
匹配文件：3 个

1. menu.gateway.test.ts（14 it）→ gateway feature → 14 cases
   - maps projectId, perm and params → 编辑回显
   - prefers isVisible → 隐藏状态
   - defaults isVisible → 默认显示
   ...

2. menu-tree-helpers.test.ts（3 it）→ gateway feature → 3 cases
   - finds nodes by id → 按 ID 查找
   - resolves ancestor locks → 祖先锁

3. menu-route-normalization.test.ts（11 it）→ gateway feature → 11 cases
   - trim → 首尾空格
   - Apex prefix → 保留前缀
   ...

总计：28 条可转为 cases
跳过：0 条（expectTypeOf）
```

**Agent 动作**：根据路径前缀路由到对应 feature，合并到同一 `cases.json`。
