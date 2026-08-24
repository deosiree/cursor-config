---
name: 编排-旧harness升级
description: 目标仓已有 harness：对照可迁移能力勾缺口，合并补缺勿毁历史，禁止整夹覆盖。触发词：升级 harness、补质量 Loop、补审查导览、旧 harness。
---

# 编排-旧harness升级

## 前置

`mode=legacy`。否则 🔴 退回分析。

## 编排顺序

1. `[[../../feature-skills/认识项目Discovery/SKILL.md]]`  
2. `[[../../feature-skills/对照可迁移能力/SKILL.md]]` — **只对 status=无|部分 的能力**生成 action  
3. **SSOT 漂移分流** — gap 含「写入约束 / 四址 / 协议习惯解耦 / 漂移审计 / HARNESS 习惯堆叠」且 HARNESS 或 AGENTS 超体积门闩 → 先 `[[../../feature-skills/Harness解耦与反漂移/SKILL.md]]` 出 `decouplePlan`，再 `合并升级缺口` 合并写入（禁止在 HARNESS 追加 ### 长节）  
4. `[[../../feature-skills/合并升级缺口/SKILL.md]]` — 合并策略写入 `filesToWrite`  
5. `[[../../feature-skills/反拷贝与泄漏扫描/SKILL.md]]`  
6. 已有 Eval/score：旁路合并；覆盖历史须 🔴 人确认  

**不做：** 按「无 harness 最小文件集」重建整树；不把样例 L2 路径写入目标仓。

## 与「无 harness」的差异（必须遵守）

| 项 | 无 harness | 旧升级 |
| --- | --- | --- |
| 默认写哪些 | 整套 P0 + 选定 P1 | 仅缺口 |
| 已有文件 | 不存在 | 合并，保留历史段落/链接 |
| Eval | 可选新建 | 禁止默默覆盖 score-history |

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 同事要拷样例 QUALITY_LOOP 全文 | 🛑 反拷贝；只迁证据阶梯槽位 | 终止 |
| HARNESS >320 行或含「用户习惯 ###」长节 | 路由 `Harness解耦与反漂移`；禁止 merge 追加段落 | 🛑 若仍堆 HARNESS |
| 每包子仓塞完整 AGENTS | 🛑 零侵入 | 改 Meta 根或 gitignore 薄文件 |
| gap 全「有」仍要大改 | 改为 audit 报告 | 不写文件 |

## 输出

父契约创建/升级 YAML；`route: 编排-旧harness升级`。
