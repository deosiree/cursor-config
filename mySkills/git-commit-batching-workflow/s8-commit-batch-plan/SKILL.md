---
name: git-commit-batching-workflow-s8-commit-batch-plan
description: Build final batching plan with title/body/files using outputs from S2, S6, and S7.
---

# S8：分批计划与提交文案

## 职责（单写点）
输出最终 `plan_*`（批次、标题、正文、文件清单），并保证“文件清单仅包含具体文件路径”（目录项必须在本步骤自动展开后再输出）。

默认在内部把 `plan_batches` 写入 artifact（`${artifact_root}/${run_id}/S8/plan_batches.yaml`）；S9 固定读取该文件生成命令块。

## 输入
- `artifact_root`（执行器参数：仅用于定位固定 artifact 路径；不参与任何语义/控制逻辑）
- `run_id`（执行器参数：仅用于拼接固定 artifact 路径；不参与任何语义/控制逻辑）

S8 的业务语义输入 **只能**来自固定 artifact 文件（离线可验证）；不得直接读取父级 `S0/start_inputs.yaml`：
- `${artifact_root}/${run_id}/S1/ctx_pack.yaml`（用于主题/仓库信息填充）
- `${artifact_root}/${run_id}/S3/scan_changes.yaml`（用于目录展开到文件级清单）
- `${artifact_root}/${run_id}/S3/scan_capability_candidates.yaml`（用于可选叙事）
- `${artifact_root}/${run_id}/S2/limit_subject.yaml`（用于 header_full/header_short 预算）
- `${artifact_root}/${run_id}/S6/map_capabilities.yaml`、`${artifact_root}/${run_id}/S6/map_coupling_bundles.yaml`、`${artifact_root}/${run_id}/S6/map_conflicts.yaml`、`${artifact_root}/${run_id}/S6/map_confidence.yaml`、`${artifact_root}/${run_id}/S6/map_notes.yaml`
- `${artifact_root}/${run_id}/S7/summary_parts.yaml`

## 标题规则
- `subject_limit` 来自 S2（用于标题长度预算），S8 不自行探测。
- `summary_final` 来自 S7（用于标题动作句），S8 不自行生成新的语义素材。
- `header_full`：
  - 取 `<type>(<scope>): :<emoji>: <summary_final>`
  - 长度须 `<= subject_limit`
  - 目的：满足提交 hook 的 header 约束，同时保持动作句可读。
- `header_short`（可选）：
  - 当 `summary_trim_notice` 非空或实际校验发现 `header_full` 仍超长时，`header_short` 使用同一 `<type>(<scope>): :<emoji>: ` 前缀，并用一个更短的动作句（短到能通过 `subject_limit`）替换 `<summary_final>`
  - 若能确认 `header_full` 未超长，则可省略 `header_short`。
- **首行只承载原子动作**；主题、问题—解决 **不得** 挤进首行。

## 提交消息结构（输出契约，自包含）
- Subject（首行）：使用 `header_full` 或 `header_short`（最终选择由 S9 完成，S8 只提供两者可选值）
- Subject 与正文之间：必须空一行（满足 `body-leading-blank`）
- Body 格式（本批）：
  - `【元信息】` 段：一行一项，只包含
    - `主题：<...>`
    - `能力：<...>`
  - 可选 `【摘要】` 段（一行或短段）
  - 四段式：`定义：` / `问题：` / `解决：` / `价值：`
  - 后续可追加：`能力映射`（按团队偏好保留/压缩）

## 正文规则
1. **【元信息】**：一行一项（`主题：` / `能力：`）
2. **【摘要】**：可选
3. **四段式**：定义 / 问题 / 解决 / 价值

## 输出模板（必须用）
```md
### 批次 <repo>/<id>

**提交说明**

```text
<selected_header 或 header_full/header_short>
```

**能力映射**

> 默认细拆：每个批次只承载 **1 个主能力 tag**，避免一个 commit 混多个可解耦能力导致推送批次失去意义。
>
> 强耦合 bundle 例外：当本批次由 S6 输出的 `map_coupling_bundles` 指定聚合时，同一批次允许承载多个主能力 tag；此时必须展示合并原因以便解释“为什么仍要同批”。

**主能力映射（可多条）**

- <主 capability_tag 对应的能力说明>
- <主 capability_tag 对应的能力说明>

**关联能力（可选，不影响拆分）**

- <related capability_tag 对应的能力说明（只用于叙事，不要求单独批次）>

**强耦合合并原因（仅强耦合 bundle 时出现）**

- merge_reason: `string`
- coupling_evidence: `string`
- requires_user: `boolean`

**文件（每行一个）**

> 强制口径：此处的每一行必须是**单个具体文件路径**，不允许目录项（例如以 `/` 或 `\` 结尾、或看起来像目录的 path）残留。
>
> 目录展开规则（当上游出现目录路径时）：
> - 展开依据：只允许使用 `${artifact_root}/${run_id}/S3/scan_changes.yaml` 中的 `scan_changes.changed_files[].path`（文件级事实源）。
> - 展开方法：若上游给出目录前缀 `dirPrefix`，则收集所有 `path` 满足 `path` 以 `dirPrefix` 为前缀的文件，并去重。
> - 无命中：若目录前缀下无任何 `scan` 文件命中，则该目录前缀不输出（不产生任何文件清单条目）。

```text
<path>
<path>
```

**git commit命令**

```powershell
<由 S9 注入的本批 command_block>
```

> 说明：
> 1) 本批块中的“提交说明/能力映射/文件”由 S8 生成。
> 2) 本批块中的“git commit命令”由 S9 生成并注入同一批次块。
> 3) 不允许把 S9 命令单独放在批次块之外。
```

## `plan_batches.yaml` 批次对象字段契约（供 S9 渲染）
> 注意：此契约用于“读取 plan 并生成可复制 commit 命令块”。为避免 S9 无法取得 body 信息，S8 必须在写入 `${artifact_root}/${run_id}/S8/plan_batches.yaml` 时填齐以下字段。

每个 `plan_batches.plan_batches[]` 元素（批次对象）至少包含：
1. `batch_id`：`<repo>/<id>` 或与 S9 一致的唯一字符串标识
2. `repo`：仓库名（如 `apex_dev`）
3. `cwd`：该仓库在本机的绝对路径（用于 Set-Location）
4. `header_full`：首行 subject（用于 S9 的 header_full/header_short 选择）
5. `header_short`：首行 subject 备选（可选，但建议提供）
6. `theme_line`：用于 commit-msg 正文中的 `主题：<...>`
7. `capability_line`：用于 commit-msg 正文中的 `能力：<...>`
8. `summary_line`：用于正文 `【摘要】`（可选；为空则 S9 不输出该段）
9. `body_quadrants`：用于正文四段式
   - `body_quadrants.define`：渲染为 `定义：`
   - `body_quadrants.problem`：渲染为 `问题：`
   - `body_quadrants.solution`：渲染为 `解决：`
   - `body_quadrants.value`：渲染为 `价值：`

## 不做
- 不执行 git 命令
- 不修改仓库配置
- 不提交/推送
