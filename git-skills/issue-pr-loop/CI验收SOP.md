# Issue PR Loop CI 验收 SOP

## 目的

在 PR 合入 `main` 前，检查 Spec Kit 集成元数据、Git 忽略规则和 Issue PR Loop 评测资产的基本约束。该检查是轻量配置回归测试，不代表功能行为、完整仓库测试或发布质量验收。

## 触发与执行

- workflow：`.github/workflows/issue-pr-loop-validation.yml`
- 触发条件：目标分支为 `main` 的每个 PR；PR 新建、更新提交或重新打开时运行。
- 不设路径过滤：必需检查必须对每个目标为 `main` 的 PR 报告结果，否则 GitHub 无法稳定应用合并门禁。
- runner：GitHub 托管的 Ubuntu 环境。
- Node.js：22。
- 执行命令：

```bash
node --test git-skills/issue-pr-loop/tests/specify-integration.test.mjs
```

测试使用 Node.js 内置测试运行器，不需要安装 npm 依赖。

## 检查内容

| 测试项 | 检查内容 | 不代表什么 |
| --- | --- | --- |
| Spec Kit 默认集成 | `.specify/integration.json` 和 `.specify/init-options.json` 默认集成为 `none`，并且集成清单包含 `none`。 | 不会启动 `specify` CLI，也不验证工作流实际执行。 |
| 未安装集成状态 | 未安装的 Cursor Agent 集成未登记、manifest 不存在，同时三个既有 Spec Kit skill 文件仍存在。 | 不会验证这些 skill 的内容或效果。 |
| 本地状态忽略规则 | `.specify/workflows/runs/` 状态文件与 `.specify/integrations/.cache/` 缓存文件被 Git 忽略。 | 不会删除或清理本地数据。 |
| 评测资产格式 | `evals.json`、`test-prompts.json`、`trigger-tests.json` 都能解析为 JSON。 | 不会运行 Darwin 评测，也不评价样例质量。 |

## 查看结果

在 GitHub 仓库打开 **Actions**，进入 **Issue PR Loop CI**，选择标题带有 PR 编号的运行记录，再查看 **Issue PR Loop repository contract tests** job。PR 的 **Checks** 区域也会显示同名状态。

- `success`：本文件列出的四项检查全部通过。
- `failure`：打开失败的 step 日志，根据断言错误修复配置或资产，再向同一个 PR 推送更新；更新会触发新一轮检查。
- 没有运行记录：确认 PR 的目标分支是 `main`，并检查 workflow 是否被禁用或运行是否等待批准。

## 合并门禁

仓库 ruleset **Require Issue PR Loop CI on main** 仅作用于 `refs/heads/main`，并要求由 GitHub Actions App（`integration_id: 15368`）报告名为 **Issue PR Loop repository contract tests** 的成功状态。检查失败、缺失或 PR 落后于 `main` 时，GitHub 不允许合并；更新分支后必须重新通过检查。

此门禁只覆盖上表中的配置回归检查。完整仓库测试、构建、类型检查、Lint、功能集成测试和安全/性能验证仍需按具体 PR 的验收计划执行并单独记录。
