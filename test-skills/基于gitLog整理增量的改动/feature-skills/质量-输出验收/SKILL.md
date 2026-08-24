---
name: 质量-输出验收
description: verify_output.py 自动化门禁；106/29/4 与零域名级问题根。
---

# Feature：质量 - 输出验收

## 何时使用

- `策略-整理gitLog增量` 步骤 5（build 之后）
- REFACTOR / Darwin evaluate-after-delivery

## 命令

```bash
# Nebula 运行时产出
python scripts/verify_output.py --config configs/nebula-huiyan-0707-0807.config.json

# few-shot 内嵌样本（脱离 Nebula 仓）
python scripts/verify_output.py \
  --config configs/nebula-huiyan-0707-0807.config.json \
  --raw assets/few-shot-example/nebula-0707-0807/after/commits_raw.json \
  --xlsx assets/few-shot-example/nebula-0707-0807/after/0707-0807.xlsx
```

退出码 `0` = passed；`1` = 验收失败。

## 检查项

| 项 | 规则 |
| --- | --- |
| 提交完整 | raw 短 hash = Excel 提交行 |
| 问题粒度 | 问题根标题 ∉ 域名标签集合 |
| 期望数字 | config 内 expectCommits/Problems/Subs（若配置） |

## 失败模式（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| missingInExcel 非空 | 重跑 extract+build | 查 cluster 是否丢 commit |
| domainLikeProblemRoots 非空 | 查 theme-cluster-rules | 禁止 mega 合并 |
| expectMismatch | 见下「expect 漂移」 | 禁止 silent 改 expect |
| xlsx 不存在 | 先 build_excel | PermissionError → 关 Excel |

## expect 漂移（full_test 常见）

live 重导后 `rawCount` 与 config `expectCommits` 不一致时（例：105→106），**不等同于 skill 缺陷**：

1. 核对 `extract` 各仓计数与新增 commit subject
2. 跑 verify 时加 `--xlsx _verify-live.xlsx` 或改 `xlsxName` 绕过 Excel 占用
3. 若 `problemRoots`/`subProblems`/零域名级问题根仍通过 → 流水线 OK
4. **🔴 CHECKPOINT**：是否重基线 few-shot + config expect → **须用户确认**，Agent 不自动改 `expectCommits`

## 输出契约

JSON：`rawCount`, `commitRows`, `problemRoots`, `subProblems`, `passed`

## 不要做什么

- 不手工数行代替脚本（易漏）
- 验收失败仍宣称「完成」
