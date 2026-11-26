---
name: muti-agents-agent-adapter-loop
description: 当用户确认的 Agent 未登记或当前会话缺少已登记能力，需要通过受控探测、提案、确认、最小验证和登记流程增加适配时使用。
---

# 扩展新 Agent 适配 Loop

## 任务

为注册表中没有的宿主收集可验证的工具、CLI、MCP 或任务委派机制，提出最小适配方案并在人类门禁后实现。目标是在不虚构支持能力的前提下验证一次真实的低风险烟雾调用。

## 输入

- 用户确认的 Agent/runtime 名称、版本和操作系统。
- 当前会话实际可见的工具清单、官方本地帮助或用户提供的能力资料。
- [Agent 注册表](../../assets/agents-registry.json) 与 [适配器规范](../../references/agent-adapter-spec.md)。
- 明确的只读或低风险烟雾任务；禁止使用真实密钥。

## 四阶段 Loop

### 1. 探测

检查当前会话提供的 MCP 工具、CLI 命令、参数帮助、输入输出格式、错误码、异步通知和跨平台限制。只读必要来源；不扫描无关目录，不输出环境变量原值。证据按“实际观察到”“用户提供”“尚未验证”分类。

### 2. 提案与门禁

输出适配 ID、检测信号、平台、通道、参数映射、缺失能力、最小文件清单和验证步骤。明确与现有适配器的差异。🔴 CHECKPOINT 等待用户确认后才能修改 Skill、脚本或注册表；提案不等于支持。

### 3. 最小实现与烟雾验证

只实现一个可验证调用路径与必要错误处理。以 mock/DryRun 检查参数和脱敏，再用用户批准的无副作用任务验证真实通道。记录命令、退出码、输出摘要和未覆盖平台。不因一次启动成功就宣称异步完成链路可用。

### 4. 登记与复验建议

只有探测、参数、错误处理和至少一次授权烟雾验证通过，才建议将状态改为 supported。更新 [Agent 注册表](../../assets/agents-registry.json)、对应测试和 README；提供最小差异并再次等待写入确认。通过项目 Issue/PR 和 Darwin 复验保留后续审查记录。

## 轮数与停止条件

一次 Loop 中最多进行 2 轮无进展探测/实现。如果连续两轮没有新的可验证证据，立即输出 🛑 STOP，列出已尝试动作、错误与缺失资料；不以猜测补全。用户提供新证据后可开始新的 Loop。

## 输出

~~~text
agentId / status
evidence: observed | user-provided | unverified
transport: tool/command and parameter contract
files: proposed or changed files
smoke: command, exit code, sanitized result
decision: ready-for-registration | stop | not-supported
~~~

## 边界

- 未获明确确认前不写 Skill、脚本、注册表或宿主设置。
- 不索取、写入或打印凭据；若验证必须依赖密钥，停止并请求用户在自己控制的环境完成。
- 不声称未经实测的平台、异步机制或权限为受支持。
- 不通过回退到另一个宿主或本地执行来伪造新 Agent 支持。

## 示例

用户说要加入一个未登记的本地 Agent。探测只发现命令 agentx --help，但没有 delegate 子命令或异步机制。报告已观察证据与能力缺口，提出只读的后续探测提案，在 🔴 CHECKPOINT 等待确认；若仍找不到任务调用接口，最多两轮后 STOP，不写注册表。
