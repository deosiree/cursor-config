# S-02 Plan / Exec / Verify 运行样本

## 场景

Gemini 额度耗尽后，用户手动将当前线程切换为 Codex GPT-6 Luna max。方案保持 `plan-exec-verify-current-to-luna`：Plan 与验收阶段分别继承当时当前线程的模型和 level；Exec 固定通过 `delegate_task` 创建独立子线程，目标是 Codex GPT-6 Luna max。

## 方案约束

- `sameModelPolicy: always-delegate`：即使当前线程模型与 Exec 目标相同，也必须独立委派。
- 目标 provider 不可用时按 `forbidSilentDowngrade` 停止，不改用其他模型或本地执行。
- Exec 参数：`providerInstanceId=codex`、`model=gpt-6-luna`、`reasoningEffort=max`、`serviceTier=priority`、`isolation=shared`、`mode=async`。
- 脚本调用中的 `--scheme` 使用完整方案 ID：`plan-exec-verify-current-to-luna`。

## 阶段记录

| 阶段 | 模型与 level | 职责 | 应记录的证据 |
|---|---|---|---|
| Plan | `inherit-current` / `inherit-current` | 调研并确认计划 | 当前线程的实际模型/level、计划和授权范围 |
| Exec | `gpt-6-luna` / `max` | 按计划实现并运行测试 | delegate 请求 ID、子任务改动清单和测试结果 |
| Verify | `inherit-current` / `inherit-current` | 核对差异和验收证据 | 当前线程的实际模型/level、复核结论 |

## 证据边界

此文件是方案行为样本，不记录真实委派请求或测试结果。实际运行时补充当次请求 ID、分支、文件差异、命令和退出码；不得把本样本当作当前执行证据。
