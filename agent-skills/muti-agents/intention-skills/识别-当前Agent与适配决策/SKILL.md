---
name: muti-agents-agent-recognition
description: 当需要识别当前 Agent 宿主、确认已登记支持状态与委派通道，并决定继续方案选择或进入新宿主适配时使用。
---

# 识别当前 Agent 与适配决策

## 任务

使用脱敏探测结果、宿主注册表和当前会话实际工具确认是否可以安全进入协作方案选择。不得因为某个脚本存在就推断当前 Agent 可调用它。

## 输入

- 当前会话环境与可用工具清单。
- [Agent 注册表](../../assets/agents-registry.json)。
- 可运行时执行 [环境探测脚本](../../scripts/detect-agent-env.mjs) 得到的探测 JSON。
- 用户对当前 Agent 名称的确认。

## 流程

1. 执行 node agent-skills/muti-agents/scripts/detect-agent-env.mjs --json；若当前工作目录不是仓库根目录，先按实际目录调整相对路径。
2. 仅展示 detectedAgent、平台、传输建议和信号布尔值；禁止复述环境变量值。
3. 询问用户当前 Agent 是否识别正确；如果探测为 unknown，将用户确认名称与注册表逐项匹配。
4. 对匹配的 supported 条目核对当前会话的真实委派工具、参数选项和异步机制。
5. 两项核验都通过时，输出 supported 决策并进入“选择多 Agent 协作方案”；任一项不通过时，输出证据并进入“扩展新 Agent 适配 Loop”。

## 输出

~~~text
agentId: 注册表 ID 或 unknown
confirmedByUser: true | false
registeredStatus: supported | absent
availableTransport: 当前会话已验证的传输或 none
decision: continue | adapt | wait
evidence: 探测信号与工具检查，不含敏感值
~~~

## 边界与失败处理

- 用户尚未确认宿主时返回 wait，不得转入委派。
- 探测脚本失败时说明命令和错误；允许用户手动提供宿主名称，但仍需核对注册表与当前工具。
- 登记为支持但当前工具不可用时返回 adapt 或 wait，不得冒用已登记适配器。
- 不自动安装依赖、不改宿主配置、不写注册表。

## 示例

探测结果为 detectedAgent: t3-code、平台为 windows、hasT3AcpMcpCall: true。先问用户是否确认当前环境；确认后还须检查当前会话提供的委派工具或 ACP 调用方式。若二者可用，输出 decision: continue；若无工具则输出 decision: adapt 并说明缺少实时执行能力。

## 路由

- 支持且经用户确认：[选择多 Agent 协作方案](../选择-多Agent协作方案/SKILL.md)
- 未支持或能力不全：[扩展新 Agent 适配 Loop](../../feature-skills/扩展-新Agent适配Loop/SKILL.md)
