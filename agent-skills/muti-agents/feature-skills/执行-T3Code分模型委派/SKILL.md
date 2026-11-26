---
name: muti-agents-t3-delegation
description: 当用户已选择支持的 T3 Code 协作方案并授权当前任务，需要校验能力、发送分模型委派、等待完成并验收结果时使用。
---

# 执行 T3 Code 分模型委派

## 任务

按已选方案安全地构造并发送一次委派请求，等待子任务完成事件，再由主 Agent 复核仓库改动和验证结果。

## 输入

- 用户确认的 S-01、S-02 或其他登记方案 ID。
- orchestrator_capabilities 检查结果及当前会话实际的 delegate_task 工具状态。
- 计划、任务简报、文件所有权、禁止操作和验收命令。
- 覆盖本次委派的明确授权。

## 执行流程

1. 查阅 [T3 委派协议](../../references/t3-code-delegation-protocol.md)，调用当前会话可用的 orchestrator_capabilities 并核实参数选项。
2. 优先使用当前宿主直接提供的 delegate_task；若原生工具不可用，只有在能力检查确认 ACP 通道且环境满足脚本前提时，才运行 [跨平台委派脚本](../../scripts/delegate-t3-task.mjs) 或 [PowerShell 兼容脚本](../../scripts/delegate-to-luna.ps1)。
3. 将任务、目标 provider/model、role、interactionMode、isolation、mode 和选项与方案一致；调用前核对计划与授权范围。`sameModelPolicy: always-delegate` 要求即使当前线程模型等于 Exec 目标模型，也通过 `delegate_task` 派发独立子线程；目标模型不可用时按 `forbidSilentDowngrade` 停止，不切换其他模型或本地执行。
4. 若选 mode: async，等待宿主完成通知，不轮询 task_status。记录请求 ID，不将启动成功当成完成。
5. 收到完成结果后，检查工作树差异、文件清单、测试输出、退出码和计划限制；必要时重新运行指定验证。
6. 主线程回报 complete、waiting、blocked 或 failed，并提供证据及未验证项。

## 支持的 ACP 脚本入口

- node agent-skills/muti-agents/scripts/delegate-t3-task.mjs --help 查看跨平台参数；对应 [跨平台委派脚本](../../scripts/delegate-t3-task.mjs)。
- pwsh -File agent-skills/muti-agents/scripts/delegate-to-luna.ps1 -Help 查看兼容入口；对应 [PowerShell 兼容脚本](../../scripts/delegate-to-luna.ps1)。
- --dry-run 只构造请求，不代表真实委派成功。
- --scheme 必须传注册表方案 id，例如 `plan-exec-verify-current-to-luna`，不能传 `S-02`。
- 脚本通过 T3_ACP_MCP_CALL 或注册的 POSIX ACP MCP 环境调用；变量缺失、二进制不可用或子进程失败时必须原样报告并停止。

## 输出

委派前输出确认简报和预期执行参数；委派后输出请求 ID、改动路径、验证命令与结果、未验证项和最终状态。请求失败时保留可核对错误和退出码，不猜测执行结果。

## 人工门禁与边界

- 发送任务内容前先取得覆盖本次目标、数据和范围的明确授权。
- 不把注册方案中的 provider/model 当成当前服务可用的证据；以能力检查和执行返回为准。
- 不自动改模型、传输、隔离或执行模式来绕过错误。
- 不要求或读取用户密钥；脚本环境变量只可用作存在性和通道输入，输出不得回显原值。
- 子任务修改了所有权之外的文件时暂停验收，报告偏差并等待决定。

## 示例

用户选 S-02 并允许实现 Agent 只修改 src/menu/、执行 npm test -- src/menu。先展示当前线程继承的 Plan/验收模型与 level，以及目标 provider=codex、model=gpt-6-luna、reasoningEffort=max、serviceTier=priority、isolation=shared、mode=async。即使主线程也已切换到 Codex GPT-6 Luna max，仍创建独立 Exec 子线程。取得确认后发送；通知完成后检查 git diff -- src/menu/ 并复跑单测，测试失败则报告 failed，不把委派者的“已完成”当通过。
