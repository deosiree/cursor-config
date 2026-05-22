# sample-nebula / after — 可拷贝参考

| 文件 | 用途 |
|------|------|
| `formRules.routePath.fragment.ts` | **pathLike 完整实现**（分段循环 + 工厂 + trim） |
| `formRules.name.fragment.ts` | **nameIdentifier 完整实现**（validator + normName + trim） |
| `formRules.routePath.test.fragment.ts` | pathLike 单测矩阵骨架 |
| `MenuFormDialog.wire.fragment.vue` | 阶段 B：双字段接入示例 |

合并到目标仓库时：按 [`project-discovery.md`](../../../references/project-discovery.md) 调整 `@/` import；**勿**把本目录当作独立包编译。
