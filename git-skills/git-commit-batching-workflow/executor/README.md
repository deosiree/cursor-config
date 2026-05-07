# executor：模板落盘与真实执行调度

## 你会看到什么
- 你调用父入口 `@.cursor/mySkills/git-commit-batching-workflow/SKILL.md ...` 时，执行器负责把 `artifact/templates/` 拷贝到 `${artifact_root}/${run_id}/`。
- 然后覆盖写入 `${artifact_root}/${run_id}/S0/start_inputs.yaml`，再按 `S1~S9` 顺序真正产出 `S1~S8` 的 artifact 文件，以及最终由 S9 落盘的 `${artifact_root}/${run_id}/S0/end_outputs.md`。

## 目录约定
- 模板：`artifact/templates/`
- run 产物：`${artifact_root}/${run_id}/`
- 状态机：`artifact/states/EXECUTOR_STATE_MACHINE.yaml`
- 契约索引：`artifact/yamls/ARTIFACT_CONTRACTS.yaml`

## 失败策略（与父级 QA 对齐）
- 模板 YAML 不可解析：低置信度并提示先修模板骨架
- 关键 artifact 缺失：标记低置信并建议重跑对应步骤或人工确认
