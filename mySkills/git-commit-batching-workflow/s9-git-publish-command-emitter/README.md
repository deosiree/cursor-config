# S9 git 推送命令生成器

## 作用
从 `${artifact_root}/${run_id}/S8/plan_batches.yaml` 生成**可复制的 git 命令块**（不执行），并把最终用户可读渲染结果写入 `${artifact_root}/${run_id}/S0/end_outputs.md`。

## 输入要点
- 读取 `${artifact_root}/${run_id}/S8/plan_batches.yaml`
- 读取 `${artifact_root}/${run_id}/S6/map_confidence.yaml` 与 `${artifact_root}/${run_id}/S6/map_conflicts.yaml`
- 读取 `${artifact_root}/${run_id}/S2/limit_subject.yaml`（用于判断 header_full 是否超长；超长则用 header_short）

## 输出要点
- 写入 `${artifact_root}/${run_id}/S0/end_outputs.md`：最终用户可读的渲染文本（包含每批命令注入）
- 写入 `.cursor/mySkills/git-commit-batching-workflow/artifact/templates/S0/end_outputs.md`（输出缓存），用于你直接在工作区打开查看
- 不在对话回复中回显 end_outputs 全文；以落盘文件为准（避免上下文污染）
- 内部生成 `commands_publish`：用于把每批的 `command_block` 注入到 end_outputs 对应位置（不要求单独对外透传）
- 结构采用 `per_batch[]`：**每批次直接内嵌 `command_block`**
- 每批会标注：
  - `selected_header`：header_full 或 header_short
  - `push_mode`：dry-run-only / dry-run-and-push-with-confirmation
  - `risk_flags`：需人工确认提示

## 安全边界
- 默认不输出任何 force push；如检测到需要 force，必须标注风险并进入人工确认模式。
- 任何低置信度/冲突都倾向 dry-run（除非你明确允许真实 push 并经过人工确认）。
