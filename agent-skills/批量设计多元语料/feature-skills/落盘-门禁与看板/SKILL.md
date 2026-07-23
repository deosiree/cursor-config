---
name: 落盘-门禁与看板
description: 在目标仓语料根落盘 EVAL_GATES、GOALS、coverage/journeys 矩阵与 check 脚本约定；升严阈值必须 bump 版本号。
version: 1.0.0
tags: [rag, eval-gates, scaffolding]
metadata:
  tier: feature
  parent: 批量设计多元语料
---

# 目标

把「何为 PASS」写成仓内 SSOT 文件 + 可执行检查脚本骨架，并让 `GOALS.md` 只展示脚本摘要（不手勾）。

## 何时使用

- 语料根缺少门禁文件
- 确认升阈值后需要改版本与常量
- 编排步骤「落盘看板」

## 输入

- `corpus_root`、`repo_root`
- 阈值表（默认见 [[../../references/门禁阈值模板.md]]）或已确认的提案
- 模板目录：[[../../template/]]

## 步骤

1. 复制并改写模板：
   - `EVAL_GATES.md.tpl` → `EVAL_GATES.md`（写版本号、阈值、升版规则）
   - `GOALS.md.tpl` → `GOALS.md`（看板；状态区注明「以脚本为准」）
   - `coverage-matrix.yaml.tpl` / `journeys-matrix.yaml.tpl`
   - `check-rag-corpus-gates.py.tpl` → 产品仓 `scripts/check-*-gates.py`（改 `CORPUS` 路径与常量）
2. 若为**升严**：旧版本号 +1（semver）；同步改脚本内 `MIN_*` 与 EVAL_GATES 正文；在变更说明写「人已确认」。
3. 在 `MANIFEST.yaml`（若有）约定：垫字/附录文件 `deprecated` 或不计入体积。
4. 试跑脚本一次（允许 FAIL），把命令写入 GOALS「如何验收」。

## 输出

| 产物 | 要求 |
|------|------|
| EVAL_GATES.md | 含版本、阈值表、升版须 🔴 |
| GOALS.md | 无虚假勾选；链到脚本 |
| eval/*-matrix.yaml | 可被脚本解析 |
| scripts/check-*-gates.py | exit 0 仅当 L1 全过 |

## 失败分支

- 语料根不可写 / 被 git 误跟踪大树 → 停；提醒 gitignore（参考实战仓「代码仓零语料」策略）
- 模板与现有文件冲突 →  diff 后问保留哪侧；禁默默覆盖用户手改阈值

## 反例

- 只写 Markdown 门槛、不落可执行脚本
- 升阈值不改版本号
- 在 GOALS 里手写 ✅ 冒充 PASS

## 验收

- 脚本可启动；`--help` 或无参跑出结构化报告
- EVAL_GATES 版本与脚本常量一致
