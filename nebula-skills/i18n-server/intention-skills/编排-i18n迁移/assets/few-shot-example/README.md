# Few-shot Index

本节点的 few-shot 重点不是“直接给一条迁移路径”，而是“如何在事实充分后产出候选方案矩阵，并说明为什么推荐某一条方案”。

当前主 few-shot 来源：

- `template/microfb-orchestration.md`

抽取重点：

- 如何先判断是否需要分析前置
- 如何把多个候选方案组织成统一矩阵
- 如何写 `analysisBasis`
- 如何解释推荐方案为什么优于其他路径
