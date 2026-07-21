---
name: 编排-无harness创建
description: 目标仓无 harness 时：Discovery → 勾 P0/P1 → 落地最小文件集填空 → 反拷贝扫描。触发词：从 0 建 harness、没有 AGENTS、新建 harness。
---

# 编排-无harness创建

## 前置

`mode=none`（来自 `分析-harness现状`）。否则 🔴 退回分析。

## 编排顺序（禁止跳步）

1. `[[../../feature-skills/认识项目Discovery/SKILL.md]]` — 表必填满关键字段  
2. `[[../../feature-skills/对照可迁移能力/SKILL.md]]` — 默认勾选 **全部 P0** + **P1 审查导览 + 质量 Loop**  
3. `[[../../feature-skills/落地最小文件集/SKILL.md]]` — 用目标名词生成 `filesToWrite`  
4. `[[../../feature-skills/反拷贝与泄漏扫描/SKILL.md]]` — `sampleLeakScan`  
5. 可选：人确认后写文件；写完建议跑一条 tiny 验证质量 Loop 可读  

**不做：** 合并旧文档、上 P2 CLI/Eval（除非人明确要求且幕1 无空字段）。

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| Discovery 关键字段 | 🔴/🛑 按 Discovery 节点 | 不得列出正式 filesToWrite |
| 用户要拷样例全文 | 反拷贝 🛑 | 本编排终止 |
| 一次要上全套 P2 | 删 P2，只留 P0+约定 P1 | 记入 stopOrCheckpoint |

## 输出

父契约创建/升级 YAML 全字段；`route: 编排-无harness创建`。
