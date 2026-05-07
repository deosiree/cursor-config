---
name: git-commit-batching-workflow-s9-git-publish-command-emitter
description: Generate copy-paste git push/publish commands per batch based on header length selection and conflict/low-confidence conservatism.
---

# S9：git 推送命令生成器

## 职责（单写点）
把 `plan_*` 中每个批次的内容转换为**可复制**的 `git add / git commit / git log / git push` 命令块（不执行），并把“重新渲染后的最终用户可读文本”写入 `${artifact_root}/${run_id}/S0/end_outputs.md`。

同时依据规则选择每批使用 `header_full` 还是 `header_short`，并在 `conflict/low-confidence` 时降低推送风险（默认仅 dry-run 或强制人工确认）。

## 输入
- `artifact_root`
- `run_id`

由执行方从固定 artifact 文件读取：
- `${artifact_root}/${run_id}/S8/plan_batches.yaml`
- `${artifact_root}/${run_id}/S6/map_confidence.yaml`
- `${artifact_root}/${run_id}/S6/map_conflicts.yaml`
- `${artifact_root}/${run_id}/S2/limit_subject.yaml`（用于判断 header 是否超长）
- `git_publish` 配置（可选，默认值由执行方提供）：
  - `remote`：默认 `origin`
  - `branch`：默认当前分支（由执行方读取 `git branch --show-current` 或调用方传入）
  - 默认值继承父编排器 START 输入约定：不传 `remote` 即 `origin`，不传 `branch` 即当前分支

## 输出（写入文件）
1. 写入 `${artifact_root}/${run_id}/S0/end_outputs.md`：最终用户可读渲染文本（包含所有批次块与命令注入）。
2. 写入 `.cursor/mySkills/git-commit-batching-workflow/artifact/templates/S0/end_outputs.md`（输出缓存）：与第 1 项内容一致，供你直接在工作区打开查看。
3. 内部生成 `commands_publish` 供渲染使用（不强制在最终输出里单独展示）。
4. 不在 agent 对话回复中打印“重新渲染后的全文”；只给出产物落盘路径/摘要，避免上下文污染。

```yaml
commands_publish:
  shell_primary: powershell
  push_policy:
    mode: dry-run-only | dry-run-and-push-with-confirmation
    selected_header_rule: header_full_if_fits_else_header_short
  per_batch:
    - batch_id: <repo/id>
      repo_name: <string>
      cwd: <abs path>
      selected_header: header_full | header_short
      push_mode: <与 push_policy.mode 一致>
      risk_flags:
        - <string>
      command_block: |
        # copy-paste block for this batch
        Set-Location "<cwd>"
        git status --short
        # ...
        git add -- "<file1>" "<file2>"
        git commit -F ".git/commit-msg-<batch>.txt"
        git log -1 --format=full
        git push --dry-run <remote> <branch>
        # optional real push after confirmation
        git push <remote> <branch>
```

## 与 S8 的拼装规则（强约束）
- S9 不单独输出一个“命令总表”给最终用户，而是将每个批次的 `command_block` 注入到对应的 S8 批次块中：
  - `S8.批次[i].git_commit_command = S9.commands_publish.per_batch[i].command_block`
- 最终对话呈现必须是“同一批次块内”同时包含：
  1. S8 的 `提交说明`
  2. S8 的 `能力映射`
  3. S8 的 `文件（每行一个）`
  4. S9 注入的 `git commit命令`
- 禁止：只输出 S9 命令或只输出 S8 说明。

## header 选择规则（必读）
- 若 `header_full` 的首行长度 **不超** `subject_limit`（或 `subject_limit=unbounded`）：
  - 命令里的提交首行使用 `header_full`
- 否则：
  - 命令里的提交首行使用 `header_short`

## commit-msg 正文内容渲染规则（必读）
S9 必须把“主题/能力映射/问题+解决/四段式”写入提交正文，而不是只依赖 subject/header。

对每个批次的 `plan_batches.plan_batches[]` 元素（批次对象），S9 渲染提交正文的字段映射如下：
1. `plan_batches.plan_batches[i].selected_header`：作为提交 subject（首行）
2. `theme_line`：写入正文 `【元信息】` 段的 `主题：<theme_line>`
3. `capability_line`：写入正文 `【元信息】` 段的 `能力：<capability_line>`
4. 若 `summary_line` 非空：输出一段 `【摘要】`，内容为 `summary_line`
5. `body_quadrants` 输出四段式（固定四行）：
   - `定义：` + `body_quadrants.define`
   - `问题：` + `body_quadrants.problem`
   - `解决：` + `body_quadrants.solution`
   - `价值：` + `body_quadrants.value`

正文拼装的固定顺序（必须保持与参考模板一致）：
1. `selected_header`
2. 空一行
3. `【元信息】`（主题/能力两行）
4. （可选）`【摘要】`
5. 四段式：定义/问题/解决/价值

## conflict / low-confidence 触发策略（必读）
当满足任一条件时：
- `map_confidence.level = low`
- 或存在 `map_conflicts[].requires_user = true`

则：
- 默认将 `push` 输出为 `git push --dry-run`（或标注为“仅 dry-run”）
- 同时在 `risk_flags` / `requires_user_notes` 中列出：需人工确认的 `map_conflicts.id + topic`
- 若你们团队确实允许真实 push，则把 `push_mode` 升级为 `dry-run-and-push-with-confirmation`，并要求每条冲突点均通过人工确认后才可执行真实 `git push`。

## 目录项残留的保底策略（必读）
- 本步骤仅接收 S8 输出的 `files`/文件清单；理论上其中不应包含目录项。
- 若检测到以下“目录项残留”任一迹象，则强制认为该批次低置信：
  - `files` 条目以 `/` 或 `\` 结尾（明显目录）
  - 或条目看起来像目录（缺少扩展名且最后一段没有 `.`，无法证明它是文件）
- 触发后：
  - `push_policy.mode` 降级为 `dry-run-only`
  - 在 `risk_flags` 中写明 `dir-like entry detected: <batch-id>` 以及目录项原始文本
  - 并建议用户先回到 S8 校验文件清单生成规则（目录展开应由 S8 完成）
  - 同时：该批次 `command_block` 中的 `git add` 仅包含“非目录项”的文件条目；被识别为目录的条目不会出现在 `git add` 参数里（避免错误把目录归入 staging）。

## 不做
- 不执行 git 命令（只输出可复制文本）
- 不改写 `plan_*` 中的正文内容
- 不重新计算 `map_capabilities` / `map_conflicts` / `map_confidence`
- 不把 end_outputs 全文回显到对话中（以落盘文件为准）

## 标准样例：microfb/1（可直接照抄执行）

> 说明：以下示例假设本批可用 `header_full`（未超 `subject_limit`），因此 S9 选用 `header_full`；若实际校验超长，则将首行替换为 `header_short`。

### microfb/1 的 `command_block`（PowerShell）

```powershell
# === microfb / 批次 1 ===
Set-Location "F:\Documents\Repertory\Sieyuan\nebula\microfb"
git status --short

# 1) 生成本批 commit message 文件（注意：Subject 后必须空一行，再写 body）
@'
feat(store): :link: micro-app binding registry 与 qiankun apps

【元信息】
主题：权限注册中心；菜单管理与权限
能力：子应用绑定注册 / qiankun 注册表

【摘要】
与主应用「注册中心」叙事对齐，子应用绑定有单一来源。

定义：
micro-app-binding-registry store、pinia、store/index、apps、auto-imports。

问题：
注册表与 apps 拆开易导致 host/child 不一致。

解决：
实现层同批提交（测试见下一批）。

价值：
绑定关系可独立回滚。
'@ | Set-Content -Path ".git/commit-msg-microfb-1.txt" -Encoding utf8

# 2) 仅 add 本批文件
git add -- "src/plugins/qiankun/apps.ts" `
           "src/store/index.ts" `
           "src/store/modules/micro-app-binding-registry.store.ts" `
           "src/store/pinia.ts" `
           "src/types/auto-imports.d.ts"

# 3) commit（使用 -F 避免正文转义问题）
git commit -F ".git/commit-msg-microfb-1.txt"

# 4) 本地校验
git log -1 --format=full

# 5) 可选预检推送
git push --dry-run origin seccenter_v2

# 6) 确认无误后再真实 push（需你手动执行）
git push origin seccenter_v2
```
