---
name: git-commit-batching-workflow-s7-commit-summary-assembler
description: Build summary string with stepwise trimming under budget; stop immediately when within limit.
---

# S7：summary 组装与裁剪

## 职责（单写点）
仅产出 `summary_*`，不生成完整标题；**不**生成正文【元信息】与四段式（由 S8 写）。

## 与首行 / 正文的分工（必读）

- `summary_final` **只**填入首行里的 **`<summary>` 段**（即 `<type>(<scope>): :<emoji>: <summary_final>` 的末尾短语）。
- **主题句、问题—解决、长因果** 属于 **正文 body**（【元信息】+ 四段式），**不得**为塞进首行而拼进 `summary_final`。
- `summary_theme` / `summary_problem` / `summary_solution` / `summary_subtask` 可作为 **素材**，供 S8 写入正文；若 S7 内部仍用 `；` 拼接做 **预算演练**，产出的长串 **不得** 默认等同 `summary_final`——**最终 `summary_final` 须裁剪为短动作句**。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）

由执行方从固定 artifact 文件读取生成输入素材：
- `${artifact_root}/${run_id}/S2/limit_subject.yaml`
- `${artifact_root}/${run_id}/S6/map_notes.yaml`（作为主题/问题/解决/价值素材的提取源；并承载 `narrative:verb_bias` 等默认推断标签）

## 标题预算推算（自包含）
- 标题首行格式：`<type>(<scope>): :<emoji>: <summary_final>`
- 标题前缀（不含 summary）：`<type>(<scope>): :<emoji>: `（以前缀最后的空格作为结尾）
- 预算计算：
  - 若 `subject_limit` 是数字：`summary_budget_len = subject_limit - len(prefix)`
  - 若 `summary_budget_len <= 0`：直接将 `summary_final` 置为极短动作句，并在 `summary_trim_notice` 中说明预算不足

## 组装规则（单写点）
- **目标形态**：`summary_final` = **动词 + 宾语** 的短句（可加极短子任务），满足 `summary_budget_len`。
- **演进 vs 绿场（动词倾向，默认自动）**：**不依赖**用户口头说明。执行方应优先解析 `map_notes` 中的 `narrative:verb_bias=*`（由 S6 依据 `scan_changes` 路径状态相对默认基线 `HEAD` 聚合写入，见 `s6-session-capability-merge/SKILL.md`）。规则：`evolved` → `summary_final` 优先 **align / extend / refactor / migrate** 等演进动词，避免 **init / scaffold / add foundation**；`net-new` → 允许 **add / introduce / scaffold** 等绿场动词；`mixed` → 选用中性或不强调绿场的动词。若缺少 `verb_bias` 标签，S7 可回退为 **保守中性** 动词，或由执行方在跑 S7 前补写该标签；**禁止**为推断演进/绿场而执行 `git log`（单写点仍在 S3 状态事实与 S6 聚合）。
- **内部草稿**（可选）：可先按 `主题；问题+解决；分批子任务` 组织素材，分隔符优先级：`；` > `+`；再 **压缩为** 上述短句写入 `summary_final`。
- 若长度超预算，按顺序裁剪 **仅针对 `summary_final` 短句**，且每步后立即检查并可提前停止：
  1. 去重
  2. 删非动作修饰语
  3. 缩短宾语
  4. 保留动词核心
- 仍超预算：输出 `summary_trim_notice`，并给出 **更短** 的 `summary_final` 候选（不得把正文搬进首行）

## 输出（给 S8；无需透传对象，固定路径写文件）
- 写入 `${artifact_root}/${run_id}/S7/summary_parts.yaml`

## 不做
- 不探测 `subject_limit`
- 不写 `<type>(<scope>): :<emoji>: ...`
