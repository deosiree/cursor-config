# 改动模式引用

> 完整规则见父级 `[[../../../references/centralized-diff-rules.md]]` 和 feature skill `[[../../feature-skills/源码集中式权限改动/references/change-patterns.md]]`。

## 本节点职责

`迁移-源码改动落地` 是意图层节点，负责：

1. 确认权限设计已确认
2. 确认 targetRepo
3. 确认改动范围（全模块 vs 指定模块）
4. 调度 `源码集中式权限改动` 产出改动方案

## 改动原则审查清单

- [ ] v-hasPerm 优先于 v-if（单元素不新增 ref）
- [ ] 父层 v-if 仅用于多元素共享同一 perm
- [ ] 子组件收 props，不内部读 perm
- [ ] API 守卫在入口处（fetchData/save/打开弹窗）
- [ ] 不双重守卫（父和子不对同一 perm 重复检查）
- [ ] 不改非 targetRepo 仓库
- [ ] 已有合理子级 perm 不强行上提
