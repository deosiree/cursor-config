# Agent 适配器规范

## 任务

定义 assets/agents-registry.json 中宿主适配项的最小字段和支持状态证据，供未知 Agent 扩展时使用。

## 输入

- 宿主稳定 ID 与展示名。
- 支持平台、可检测信号和传输机制。
- 当前会话可调用的能力及参数。
- 最小 DryRun/mock 和授权烟雾验证证据。

## 适配字段

| 字段 | 用途 | 约束 |
|---|---|---|
| id | 稳定引用 | 小写短标识；一经发布不得随意变更 |
| displayName | 给人看的宿主名 | 不含用户或机器身份 |
| status | supported / experimental / unsupported | supported 要求有可复核实测 |
| platforms | 已验证平台 | 只记录已实际覆盖的平台 |
| detectSignals | 可脱敏探测的环境或工具名 | 只记录存在性，不保存值 |
| transports | 原生工具、CLI、MCP 等通道 ID | 每个通道注明参数和失败行为 |
| capabilitiesCheck | 当前会话能力查询 | 缺失时必须由用户确认并注明未验证 |
| fallbackPolicy | 错误后的行为 | 使用 fail-fast；不做静默通道切换 |
| adapterScript | 可选相对路径 | 文件须存在、可测试、无秘密 |

## 支持准入

标成 supported 前至少具备：身份探测说明；可复现的调用参数；未知/无权限/命令不存在的失败行为；纯净 DryRun 或 mock 测试；一个明确授权且无副作用的真实烟雾调用。异步适配还需验证完成通知，不能只证明任务创建成功。

## 输出

适配器 JSON 候选、测试用例、平台覆盖清单和每项证据来源。未满足准入条件时只能保留 experimental 或 unsupported。

## 边界

不通过安装或登录配置推断宿主已支持，不复制密钥，不写单机绝对路径。修改注册表需有 🔴 CHECKPOINT 与回归验证。

## 示例

现有 t3-code 条目登记 Windows、macOS、Linux，并声明原生 MCP 和 ACP MCP 路径。扩展者仍需检查当前会话工具及当前平台路径，不能仅凭该条目报告本次调用成功。
