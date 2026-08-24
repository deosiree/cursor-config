# Round 0 自检（dry_run）

日期：2026-08-07  
模式：evaluate-only / dry_run

## 结构评分（12 分制）

| 维度 | 分 | 备注 |
| --- | --- | --- |
| 父 skill 薄路由 | 2 | Single Dispatch、输入契约、CHECKPOINT |
| 子 skill 齐全 | 2 | 2 intention + 5 feature |
| config 驱动 | 2 | extract/build --config |
| few-shot 内嵌 | 2 | assets/nebula-0707-0807 含 json/xlsx/脚本 |
| 跨项目 intake | 2 | harness-intake-checklist + 分析 intention |
| 反例清单 | 2 | 父 SKILL + RED-baseline |

**总分：12/12**

## 实跑验收（config 脚本）

| 项 | 结果 |
| --- | --- |
| raw 提交 | 106 |
| 问题根 | 29 |
| 子问题 | 4 |
| 域名级问题根 | 0 |
| verify xlsx | `assets/.../after/_verify.xlsx` |

## eval_mode

dry_run（结构 + 脚本计数）；full_test 需用户关闭占用中的 xlsx 后重跑 build 写 humanDocs。

## 决策

**keep** — 套件可交付；Nebula 写 xlsx 若 PermissionError 属环境占用，非 skill 缺陷。
