# Issue 与 PR 开发闭环

中文 Agent skill 套件：把项目目标、Issue 依赖和本地开发计划连成一条可追踪的交付流程。

## 使用场景

- 多模块需求需要拆为可独立验收的 GitHub Issue。
- Codex Goal 需要依据依赖图逐个推进，而不是重做总计划。
- 需要逐 Issue 形成 `develop.md`、验证、PR、人审修复和项目终验。

## 职责边界

| 本套件 | 相邻能力 |
| --- | --- |
| 项目目标锚点、Issue 拆解、依赖编排、逐 Issue 交付与最终收敛 | [[../daily-open-source-contribution/SKILL.md]]：从外部开源项目筛选每日贡献 Issue |
| 为并发 Issue 设定文件边界和是否隔离的要求 | [[../创建沙盒分支/SKILL.md]]：具体创建或删除 worktree 沙盒 |
| 编排目标、计划、验收和证据 | [[../推送草稿+revert草稿，待审核结束再推送最终版本/SKILL.md]]：处理特定共享分支草稿与 revert 发布流程 |

本套件不替代仓库的贡献规则、CI、代码审查者或安全负责人，也不会把人工审查和合并变成自动动作。

## 目录结构

```text
issue-pr-loop/
├── SKILL.md
├── README.md
├── intention-skills/项目规划与Issue图谱/
├── feature-skills/单Issue开发与PR闭环/
├── feature-skills/项目验收与文档收敛/
├── template/mvp/
├── template/snapshot/
├── assets/
├── references/
└── evals/
```

## 输出文档

```text
<project-doc-dir>/goal.md
<project-doc-dir>/issue-graph.md
<project-doc-dir>/issues/<issue-id>/develop.md
```

`goal.md` 是全局目标和验收标准的锚点；`issue-graph.md` 的依赖表是 Issue 图的事实源；Mermaid 只负责展示。每个 `develop.md` 只计划一个 Issue，并引用稳定的 Goal ID。

## 使用示例

```text
使用 $issue-pr-loop 规划“内部资产盘点工具”：先问清目标用户和成功证据，整理 goal.md、Issue 依赖图和每项 Issue 的 develop.md。先写本地草稿，不要创建 GitHub Issue。
```

```text
使用 $issue-pr-loop 按当前 Goal 和依赖图继续实现 #42；先读该 Issue 的 develop.md，验证完成后创建 PR，等待人工审查，不要自动合并。
```

## 质量门禁

- Goal 到 Issue、代码、测试和文档之间存在双向可追溯关系。
- Issue 依赖无环；并行项文件边界互斥且接口已冻结。
- 性能、安全结论只基于实际执行的测试、明确范围和记录证据。
- GitHub 外部写入、人审和合并遵守本次会话的授权。
- Darwin 用例见 [[test-prompts.json]] 与 [[evals/evals.json]]；基线和结果见 [[evals/darwin-baseline.md]]、[[evals/results.tsv]]。
