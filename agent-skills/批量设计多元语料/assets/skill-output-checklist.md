# Skill 输出反空心化清单（批量设计多元语料）

落盘或改版本套件后逐项自检；**全部勾选才可宣称套件首交付完成**（与目标仓语料 PASS 无关）。

## 父级

- [ ] `SKILL.md` 含：何时用/不用、RED、人工门禁、路由表、可执行主工作流
- [ ] `README.md` 含短索引 + ≥2 条使用示例
- [ ] 硬约束与黑名单可从主文档链到 `references/反例黑名单.md`

## Intention / Feature

- [ ] 每个子 `SKILL.md` 非空：输入、步骤、输出、失败分支、反例
- [ ] 编排 intention 明确 feature 调用顺序与续跑入口
- [ ] 分析 intention 含阈值提案表与 🔴 升版规则
- [ ] 五个 feature 均存在且职责不互相替代（落盘/模块/旅程/导出/核验）

## 模板与样本

- [ ] `template/` 含 EVAL_GATES、GOALS、两个 matrix、check 脚本骨架
- [ ] `assets/few-shot-example/` 含 EVAL_GATES/GOALS/J-EXCEL-LOOP/journeys-matrix 摘录（非空壳）
- [ ] 未整树复制产品仓 `data/rag-corpus`

## Evals

- [ ] `evals/test-prompts.json`（或 evals.json）≥2 条可跑场景
- [ ] `evals/results.tsv` 表头就绪
- [ ] 文档写明：Darwin evaluate-only **可选**，不阻塞首交付

## 一致性

- [ ] 默认阈值与 `references/门禁阈值模板.md`、脚本 tpl 常量一致（v1.1 量级）
- [ ] 旅程节键与核验 feature / 脚本 `JOURNEY_SECTION_KEYS` 一致
- [ ] 无「勾选即 PASS」表述残留
