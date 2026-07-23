---
name: 编排-语料Goal到门禁PASS
description: 编排语料 Goal：Intake → 落盘门禁看板 → 模块挖掘 → 跨模块旅程 → 导出 → 门禁续跑至 PASS。不升阈值除非用户确认。
version: 1.0.0
tags: [rag, corpus, orchestration, eval-gates]
metadata:
  tier: intention
  parent: 批量设计多元语料
---

# 目标

把一次「建场 / 扩面 / 续跑到 PASS」编排成有序 feature 调用链；出口唯一：目标仓门禁脚本 exit 0。

## 何时使用

- 从 0 建语料场
- 用户说继续语料 Goal / 补到门禁绿
- 父 SKILL 路由到本 intention

## 何时不要使用

- 仅诊断缺口或只提案升阈值 → [[../分析-语料缺口与阈值提案/SKILL.md]]
- 只跑脚本不扩内容 → 直接 [[../../feature-skills/核验-门禁脚本与续跑/SKILL.md]]

## 输入

| 字段 | 必填 | 说明 |
|------|------|------|
| repo_root | 是 | 产品仓根 |
| corpus_root | 是 | 如 `data/rag-corpus` |
| ui_src_root | 是 | 前端源码，用于挖 UI 文案 |
| gates_version | 否 | 默认用阈值模板 v1.1 量级 |
| skip_shots | 否 | 默认 true（截图人补） |
| modules | 否 | 菜单/模块清单；空则从路由/侧栏推断 |

## 步骤

1. **Intake 核对**  
   确认语料根是否本机/gitignore；展示默认阈值（[[../../references/门禁阈值模板.md]]）。若用户要改严 → 先转「分析-缺口」拿 🔴，禁止静默改。

2. **落盘看板**（若缺失或版本落后）  
   调用 [[../../feature-skills/落盘-门禁与看板/SKILL.md]]：`EVAL_GATES.md`、`GOALS.md`、coverage/journeys matrix、check 脚本就位。

3. **模块挖掘**  
   对每个优先模块调用 [[../../feature-skills/挖掘-模块语料/SKILL.md]]。顺序建议：主路径模块 → 配置/权限 → 边角 FAQ。每篇须源码证据；禁垫字。

4. **跨模块旅程**  
   调用 [[../../feature-skills/挖掘-跨模块旅程/SKILL.md]]。至少覆盖产品主闭环（导入→译→回填→归档类）；补 handoffs 与 `journey_id` 金标。矩阵未全绿不得宣称阶段完成。

5. **导出**  
   调用 [[../../feature-skills/导出-多格式raw与数据集/SKILL.md]]：raw 多格式 + golden/split。

6. **核验闭环**  
   调用 [[../../feature-skills/核验-门禁脚本与续跑/SKILL.md]]。FAIL → 只修 FAIL → 回到 3/4/5 中相关项 → 再跑。PASS → 更新 `GOALS.md` 仅贴脚本摘要，停止。

## 输出

- 语料树达标产物 + `eval/last-gate-report.txt`（或脚本 stdout）
- 给用户的一句话状态：`PASS|FAIL` + 关键计数（汉字/md/旅程/金标）

## 失败分支

| 情况 | 动作 |
|------|------|
| Intake 路径不存在 | 停；请用户改路径 |
| 源码仓无 UI | 改挖 API/文档真源；仍禁臆造界面文案 |
| 连续 3 轮同 FAIL | 停；贴报告 + 问是否降阈值提案或换挖掘策略 |
| 用户中途要升阈值 | 挂起扩面 → 转分析-缺口 → 确认后再继续 |

## 反例

- 跳过旅程直接导出宣称完成
- 未跑脚本只改 GOALS 勾选
- 一轮写完所有模块但不跑核验

## 派发清单（顺序）

1. `落盘-门禁与看板`（按需）
2. `挖掘-模块语料`（迭代）
3. `挖掘-跨模块旅程`（迭代）
4. `导出-多格式raw与数据集`
5. `核验-门禁脚本与续跑`（循环至 PASS 或人工止损）
