---
name: git-commit-batching-workflow-executor
description: Materialize artifact templates and execute parent git-commit-batching-workflow (S1~S9) on disk.
---

# executor：模板落盘 + 真实执行 S1~S9（不含实现细节）

## 职责（单写点）
把父入口命令解析成 `S0/start_inputs.yaml`，并按 `artifact/templates -> run_id` 的“拷贝覆盖”规则落盘所有 `S1~S9` 必要产物文件。

> 注意：本 `executor` 契约只规定“落盘与执行调度行为”；每个 `S1~S9` 的语义与字段规则以各自 `SKILL.md` 为准。

## 输入
- `command_line`：来自用户命令行（例如：`@.cursor/mySkills/git-commit-batching-workflow/SKILL.md apex_dev and microfb，主题：菜单管理与权限；权限注册中心`）
- `artifact_root`：可选，默认 `../commit-workflow-artifacts/`（由执行环境决定落地的相对/绝对路径）
- `run_id`：可选；
  - 未提供时：本 executor 必须为每次调用生成“新目录唯一”的 run_id_new（uuid/nonce），禁止复用旧 run_id
  - 提供了时：若目标目录已存在视为碰撞/不可信输入，必须追加 nonce 重新生成 run_id_new，直到目标目录不存在

## 解析规则（自包含）
解析 `command_line` 中的两类必需信息：
1. `repos_expr`：父 `SKILL.md` 的 “仓库：`repo1[,repo2,...]`” 对应语义。
2. `themes_raw`：父 `SKILL.md` 的 “修改主题：`主题...`” 对应语义；必须保留完整主题串与顺序，支持 `;` / `；` / `,` / `，` 等分隔符，禁止因为分隔符不匹配而截断或丢段。

解析输出落到 `${artifact_root}/${run_id}/S0/start_inputs.yaml`：
- `repo_names`：逗号分隔字符串（允许空格）
- `themes_raw`：按 S1 可识别的形态输出（推荐统一为 `;` 作为主题分隔符，同时保留完整主题内容，避免因分隔符差异丢段）

其它可选字段（如 `remote/branch/session_source/session_id/lookback_scope/external_doc_paths/doc_role/trust_level`）如果命令里没有出现，则写入模板骨架默认值即可。

## artifact 路径与覆盖策略（强约束）
1. 模板目录：`artifact/templates/`
2. 状态机：`artifact/states/EXECUTOR_STATE_MACHINE.yaml`
3. 契约索引：`artifact/yamls/ARTIFACT_CONTRACTS.yaml`

执行器落盘流程（按顺序）：
1. `InitTemplate`：若 `artifact/templates/` 任一关键文件缺失，则创建（使用“可被 YAML parser 解析的空骨架”填充）。
2. `MaterializeRun`：拷贝整个 `artifact/templates/` 到 `${artifact_root}/${run_id}/`。
   - 若 `${artifact_root}/${run_id}` 已存在：视为 run_id 碰撞，禁止复用旧目录；必须生成新的 run_id_new 并重新 materialize，直到使用到“新目录”。
3. `WriteExecutorState`：初始化/覆盖写入 `${artifact_root}/${run_id}/S0/executor_state.yaml`（记录当前状态阶段）。
4. `WriteStartInputs`：覆盖写入 `${artifact_root}/${run_id}/S0/start_inputs.yaml`。
5. `ExecutePipeline_S1_to_S9`：
   - 按父 `git-commit-batching-workflow/SKILL.md` 固定顺序执行 `S1 -> ... -> S9`
   - 每步只读/只写它在各自 `SKILL.md` 中声明的固定 artifact 路径
6. `ValidateArtifacts`：
   - 按 `${artifact_root}/${run_id}` 的关键文件存在性与 YAML 可解析性做校验
   - 缺失或解析失败：标记为低置信并触发人工确认或建议重跑

## 输出
- 必须生成并最终落盘：`${artifact_root}/${run_id}/S0/end_outputs.md`
- 其它中间产物按父流程落盘：`${artifact_root}/${run_id}/S1~S8/*` 与 `${artifact_root}/${run_id}/S0/start_inputs.yaml`
- 必须生成并更新：`${artifact_root}/${run_id}/S0/executor_state.yaml`

## 不做
- 不执行 `git commit` / `git push`
- 不修改各 `S1~S9` 的语义契约
- 不把 `command_line` 里的控制参数散落在对话透传中；所有控制参数必须集中落到 `S0/start_inputs.yaml`
