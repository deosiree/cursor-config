---
name: 落地最小文件集
description: 无 harness 时用 Discovery 答案生成最小文件集 filesToWrite（填空不拷贝）。触发词：最小文件集、从 0 落地、P0 骨架。
---

# 落地最小文件集

## 前置

`mode=none`；Discovery 关键字段已填或已显式阻塞。

## 最小文件集

- `AGENTS.md`
- `docs/README.md`
- `docs/FEATURE_INTAKE.md`
- `docs/ARCHITECTURE.md`
- `docs/HARNESS_REVIEW.md`
- `docs/QUALITY_LOOP.md`
- `docs/GLOSSARY.md`
- `docs/templates/story.md`、`docs/templates/decision.md`

骨架参考：`[[../../template/虚构单仓-ReactREST.md]]`。

## 规则

1. `fillWith` 只用目标仓名词与 `verify` 命令  
2. 质量 Loop 必须写 L0/L1/L2 判定，禁止只写 type-check  
3. Discovery 未完成 → `filesToWrite` 仅一行占位  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 混入样例路径 | 反拷贝扫描失败 | 删除该 fillWith |
| 多仓每包完整 AGENTS | 🛑 零侵入 | 只写 Meta 根 |

## 输出

`filesToWrite` + `qualityLoopMeans`。
