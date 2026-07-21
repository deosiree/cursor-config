---
name: 认识项目Discovery
description: 填写目标仓 Discovery 表：拓扑、主域、SSOT、验证命令、现有 harness 碎片。触发词：Discovery、认识项目、discoveryTable。
---

# 认识项目Discovery

## 输出表（必须）

| 字段 | 从哪扫 | 输出 |
| --- | --- | --- |
| 仓拓扑 | README、根目录、workspace | 单仓/多仓；模块路径 |
| 负责人主域 | 维护者口述或高频目录 | `[{name,path}]` |
| 契约 SSOT | openapi/swagger/proto/api.md | 路径或「契约待定」 |
| 验证命令 | package.json / Makefile / CI | L0/L1/L2 + missing |
| 现有 harness | AGENTS、docs、evals | existingHarness 布尔/unknown |

工作表：`[[../../assets/discovery-worksheet.md]]`。

## 规则

1. `targetPath` 未给且未扫 → 全字段 `unknown`；禁止用当前 IDE 工作区预填  
2. 主域扫不出 → 🔴 问人；不得用样例主域  
3. SSOT 无 → 「契约待定」+ 后续 🛑 禁臆造字段  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 路径无效 | 🔴 再确认 | 表全 unknown |
| 只有 type-check | missing 记下 L1/L2 | 禁止填样例 L2 路径 |

## 输出

`discoveryTable` 对象（供父 YAML 嵌入）。
