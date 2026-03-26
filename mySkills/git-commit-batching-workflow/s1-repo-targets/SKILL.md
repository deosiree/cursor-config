---
name: git-commit-batching-workflow-s1-repo-targets
description: Validate workflow start input and normalize repo/theme context.
---

# S1：输入规范化

## 职责（单写点）
校验仓库与主题输入，输出统一上下文 `ctx_*`。

## 输入
- `artifact_root`（父 START 输入或默认值）
- `run_id`（父 START 输入或自动生成）

由执行方从固定 artifact 文件读取：
- `${artifact_root}/${run_id}/S0/start_inputs.yaml`

## 输出（供 S2；默认写入 artifact）
- 写入 `${artifact_root}/${run_id}/S1/ctx_pack.yaml`（包含 `ctx_workspace_root`、`ctx_repos`、`ctx_themes`、`ctx_parse_notes`）

## 解析与默认值规则（自包含）

### `workspace_root`
- 字段来源：来自 `${artifact_root}/${run_id}/S0/start_inputs.yaml`。
- 输入为绝对路径则直接使用；为相对路径则按执行环境的 monorepo 根进行补全为绝对路径。
- 输出的 `ctx_workspace_root` 必须是“可定位”的绝对路径字符串。

### `repo_names`
- 字段来源：来自 `${artifact_root}/${run_id}/S0/start_inputs.yaml`。
- `repo_names` 是逗号分隔字符串（允许空格）。
- 解析步骤：
  - 按 `,` 分割
  - 对每项 `trim`，过滤空项
  - 每个 `repo_name` 作为相对路径片段拼接：`repo_path = ctx_workspace_root / repo_name`
- 合法性校验（用于确定性执行；失败则停止链路）：
  - `repo_path` 必须存在且为目录
  - `repo_path` 必须包含 `.git` 或等价 git 元信息
- 若存在不合法 repo：
  - `ctx_parse_notes` 追加一条 `fatal:` 错误说明（并建议编排器停止后续步骤）

### `themes_raw`
- 字段来源：来自 `${artifact_root}/${run_id}/S0/start_inputs.yaml`。
- 支持两种常见形态：
  - 分号/全角分号分隔：`主题：A；B；C` 或 `A;B;C`
  - 编号列表：`1. A` `2. B`（按换行分割后提取文本）
- 解析步骤（建议）：
  - 若包含 `主题：` 前缀，先去掉前缀并 `trim`
  - 将 `；` 归一为 `;`
  - 按 `;` 或换行分割得到候选项
  - 每项 `trim`，过滤空项，去掉多余引号
- 默认值：
  - 若解析结果为空：`ctx_themes = ["未命名主题"]`，并在 `ctx_parse_notes` 追加 `warn:` 说明（避免全链路空主题）

## 输出形态约束（自包含）
- `ctx_parse_notes` 为字符串数组，至少包含 0~N 条 `warn:` 或 `fatal:`（不可为空时至少给一条 `warn:` 或 `info:`）。
- `ctx_repos` 与 `ctx_themes` 都不得为 null；允许为空主题但不允许 repo 为空（repo 为空视为致命输入错误）。

## 不做
- 不执行 git 命令
- 不做能力映射
- 不写提交文案
