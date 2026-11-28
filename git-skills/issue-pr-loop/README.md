# Issue 与 PR 开发闭环

中文 Agent skill 套件：把零散建议收敛成可评审 Issue，再将项目目标、依赖关系和分阶段交付连起来。显式调用时默认先给方案并等待确认；只有用户明确要求立即开始修复，才跳过等待。

## 使用场景

- 多模块需求需要拆为可独立验收的 GitHub Issue。
- 同事反馈、线上现象或维护建议需要先登记、核实、去重，再批量评审。
- 旧项目要整理维护 backlog，区分已证实 bug 与体验/能力改进。
- 新需求设计与既有项目优化需要在 HITL-1 前提取 FR/DP 并分析设计耦合；单独学习源码时保持只读并标注证据。
- Codex Goal 需要依据依赖图逐个推进，而不是重做总计划。
- 需要逐 Issue 形成 `develop.md`、验证、PR、人审修复和项目终验。
- Issue 发布、实现、PR、review 和合并需要分阶段或分角色完成。

## 职责边界

| 本套件 | 相邻能力 |
| --- | --- |
| 项目目标锚点、Issue 拆解、依赖编排、逐 Issue 交付与最终收敛 | [[../daily-open-source-contribution/SKILL.md]]：从外部开源项目筛选每日贡献 Issue |
| 为并发 Issue 设定文件边界和是否隔离的要求 | [[../创建沙盒分支/SKILL.md]]：具体创建或删除 worktree 沙盒 |
| 编排目标、计划、验收和证据 | [[../推送草稿+revert草稿，待审核结束再推送最终版本/SKILL.md]]：处理特定共享分支草稿与 revert 发布流程 |
| 登记反馈、批量评审候选和排期 | 本套件的 [[intention-skills/需求收敛与Backlog排程/SKILL.md]]；不会默认创建 Issue 或开始实现 |

本套件不替代仓库的贡献规则、CI、代码审查者或安全负责人，也不会把人工审查和合并变成自动动作。

## 目录结构

```text
issue-pr-loop/
├── SKILL.md
├── README.md
├── intention-skills/需求收敛与Backlog排程/
├── intention-skills/项目规划与Issue图谱/
├── feature-skills/单Issue开发与PR闭环/
├── feature-skills/公理设计需求分析/
├── feature-skills/项目验收与文档收敛/
├── template/mvp/
├── template/snapshot/
├── assets/few-shot-example/           # Issue / PR 输出 SOP 与格式样例
├── references/
│   └── upstream/                      # 固定提交的来源快照与许可
└── evals/
```

## 输出文档

```text
<project-doc-dir>/goal.md
<project-doc-dir>/request-inbox.md
<project-doc-dir>/issue-graph.md
<project-doc-dir>/issues/<issue-id>/develop.md
```

`request-inbox.md` 记录尚未决定是否发布的建议。`goal.md` 是需要项目级规划时的目标锚点；旧项目维护可沿用长期维护 Goal，单一维护 Issue 不强制生成全局 Goal。`issue-graph.md` 的依赖表是多 Issue 批次的事实源；Mermaid 只负责展示。每个 `develop.md` 只计划一个 Issue。

显式调用 `$issue-pr-loop` 时，单点问题也会先记录或复用 Issue，再给出精简方案并等待确认。明确要求立即开始修复时，只跳过方案等待；本地问题记录、范围、验收和验证证据仍保留。GitHub Issue、推送、PR 和合并授权分别核对。

## 使用示例

```text
使用 $issue-pr-loop 规划“内部资产盘点工具”：先问清目标用户和成功证据，整理 goal.md、Issue 依赖图和每项 Issue 的 develop.md。先写本地草稿，不要创建 GitHub Issue。
```

```text
有同事给了几条维护建议。先检查旧项目代码与现有 Issue，把它们登记到 request-inbox.md，标明 bug/需求证据、重复项和待澄清问题。把候选合并成一批 Issue 草稿给我选，不实现、不发布。
```

```text
使用 $issue-pr-loop 按当前 Goal 和依赖图继续实现 #42；先读该 Issue 的 develop.md，验证完成后创建 PR，等待人工审查，不要自动合并。
```

```text
使用 $issue-pr-loop 处理登录失效时重复弹窗的问题。先检查代码和现有 Issue，给我 Issue 草稿与精简修复方案并等待确认；不要开始改代码。
```

```text
使用 $issue-pr-loop 处理登录失效时重复弹窗的问题。保留本地 Issue 记录后，现在直接开始修复，不等方案确认；不要创建 GitHub Issue 或 PR。
```

```text
使用 $issue-pr-loop 设计一个支持离线编辑和冲突恢复的新功能。先提取可验收 FR 和同层级 DP，给出 DP 为行、FR 为列的矩阵与调整顺序，分析完成后停在 HITL-1；项目默认 Agent 用 none，每个 HITL 再选择下一阶段 Agent。
```

```text
带我学习这个项目的源码：从入口和调用链提取现有行为，标注代码事实、需求推断与未知关系，生成 FR/DP 矩阵。只读，不创建 Issue 或修改文件。
```

```text
Issue #84 已由同事创建，我负责实现，另一位 reviewer 负责审查。按依赖和路径边界完成实现并提关联 PR，不合并。
```

## 质量门禁

- Goal 到 Issue、代码、测试和文档之间存在双向可追溯关系。
- 候选反馈先有现状/契约证据和重复检查；没有已接受要求作依据时，不会仅凭体验反馈标为 bug。
- Issue 与 PR 的结构分别参考 few-shot；把通用审阅信息映射进本地模板和章节，按仓库语言规则生成，Markdown 块之间留空行；代码现状 Issue 记录诊断分支与 commit。
- 发布 Issue 不自动开始实现；Issue 作者、实现者、PR 作者、reviewer 和合并者可分离。
- Issue 依赖无环；并行项文件边界互斥且接口已冻结。
- 性能、安全结论只基于实际执行的测试、明确范围和记录证据。
- 新需求与项目优化先用公理设计分析；源码学习只读；简单单点 Bug 和只发布 Issue 沿用精简路径。
- 每个 HITL 交接显式选择下一阶段 Agent；`none` 只表示项目不固定 Agent。
- GitHub 外部写入、人审和合并遵守本次会话的授权。
- Darwin 用例见 [[test-prompts.json]] 与 [[evals/evals.json]]；基线和结果见 [[evals/darwin-baseline.md]]、[[evals/results.tsv]]。
- 写作规则和样例见 [[assets/few-shot-example/README.md]]，外部规范取舍见 [[references/调研与设计取舍.md]]。
