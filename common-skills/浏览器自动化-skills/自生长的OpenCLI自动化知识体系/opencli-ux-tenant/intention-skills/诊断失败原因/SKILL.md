---
name: 诊断失败原因
description: 分析测试失败输出、截图和日志，判断失败根因并提供修复建议。
---

# 核心任务

读取 `screenshots/` 目录中的失败截图和日志，结合错误信息，诊断测试失败原因。

## 何时触发

- SKILL.md 的 `diagnose` 路由
- 用户问"为什么失败了"或提供错误输出
- 全流程或搜索删除执行后返回非零退出码

## 输入 / 前置条件

- 测试执行的标准输出和标准错误
- `screenshots/` 目录中的截图和日志文件
- 使用的 profile 名

## 输出

- `rootCause` — 根因分类（配置/网络/验证码/项目缺失/租户已存在/超时）
- `evidence` — 依据（错误行、截图路径、关键日志）
- `fixAction` — 修复建议（具体命令或配置修改）
- `requiresUserInput` — 是否需要用户手动操作

## 下一步路由

- 配置问题 → `[[../../references/common-failures.md]]` 对照
- 环境问题 → 提示用户运行 `bash scripts/preflight.sh --profile <name>`
- 需清理状态 → `[[../../feature-skills/诊断与清理/SKILL.md]]`

## 边界

- 只负责诊断，不负责修复执行
- 如果 screenshots/ 目录为空，说明失败发生在脚本启动阶段（opencli 未就绪或配置缺失）
