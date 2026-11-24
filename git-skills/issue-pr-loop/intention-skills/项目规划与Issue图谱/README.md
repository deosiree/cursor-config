# 项目规划与 Issue 图谱

负责把当前会话中的项目需求整理成 Goal 锚点、Issue 依赖图和本地逐 Issue 开发计划。

## 适用场景

- 多模块需求拆分为可独立验收的 Issue。
- 需要为已有项目建立依赖边、开发波次和文件所有权。
- 需要将 Goal 的验收条件映射到 Issue。

## 与相邻节点边界

- 本节点负责讨论、调研、拆分、依赖校验和材料发布前同步。
- [[../../feature-skills/单Issue开发与PR闭环/SKILL.md]] 负责单个已解锁 Issue 的 `develop.md` 与实现交付。
- [[../../feature-skills/项目验收与文档收敛/SKILL.md]] 负责所有 Issue 完成后的项目级验收。

## 资源

- Goal 模板：[[../../template/mvp/goal.md]]
- 依赖图模板：[[../../template/mvp/issue-graph.md]]
- develop 模板：[[../../template/mvp/issues/issue-id/develop.md]]
- 完整示例：[[../../template/snapshot/README.md]]
- 设计取舍：[[../../references/调研与设计取舍.md]]

## 使用示例

```text
只先拆需求，不要实现，也不要写 GitHub。输出 goal.md、依赖图和逐 Issue develop.md 草稿。
```
