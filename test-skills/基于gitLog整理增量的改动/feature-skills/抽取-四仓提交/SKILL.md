---
name: 抽取-四仓提交
description: 运行 extract_commits.py，产出 commits_raw.json。
---

# Feature：抽取四仓提交

## 何时使用

- `策略-整理gitLog增量` 步骤 1（流水线起点）
- 时间窗或 author 变更后须重跑

## 何时不要使用

- 属性未确认（跨项目 CHECKPOINT 未完成）
- 仅改 theme-rules 而不重 extract（除非 since/until/author/repos 变了）

## 命令

```bash
python scripts/extract_commits.py --config configs/{profile}.config.json
python scripts/extract_commits.py --config ... --meta-root /path/to/meta
```

## 规格

见 `references/git-extract-spec.md`

## 输出

`{outDir}/commits_raw.json`

## 失败模式（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| git 非仓库 | 记入 missingFacts | STOP，不 build |
| author 无提交 | 空数组仍写出，报告 0 条 | 与用户确认 author 拼写 |
| 计数 vs expect 漂移 | 报告各仓 TOTAL | 见 `质量-输出验收` expect 漂移 |
| path 不存在 | config repos 核对 | SKIP 该仓并记录 |

## 不要做什么

- 不排除 Merge 以外的提交（除 Merge 外全收录）
