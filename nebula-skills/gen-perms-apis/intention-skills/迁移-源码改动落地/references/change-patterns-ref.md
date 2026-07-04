# 改动模式引用

> 完整规则见父级 `[[../../../references/centralized-diff-rules.md]]`、`[[../../../references/page-perms-static-budget.md]]` 和 feature skill `[[../../feature-skills/源码集中式权限改动/references/change-patterns.md]]`。

## 本节点职责

`迁移-源码改动落地` 是意图层节点，负责：

1. 确认权限设计已确认
2. 确认 targetRepo
3. 确认改动范围（全模块 vs 指定模块）
4. 调度 `源码集中式权限改动` 产出改动方案

## 改动原则审查清单

- [ ] 复杂页：单一 `xxxPagePerms` computed 静态预算
- [ ] 子组件收 boolean `pagePerms`，非 perm 字符串
- [ ] 禁止 OpItem `:perm` 二次鉴权
- [ ] 简单页（≤2 控点）才用 `v-hasPerm`
- [ ] API 守卫读 `xxxPagePerms.value.xxx`
- [ ] 不双重守卫（canXxx + v-hasPerm 同一 perm）
- [ ] 不改非 targetRepo 仓库
- [ ] 已有合理子级 perm 不强行上提（非 OpItem 字符串模式）
