# Agent 检查记录

## 任务

记录一次委派前的宿主识别与能力检查，供人类在确认前审阅。

## 输入

- 研发任务：
- 操作系统/平台：
- 探测命令与时间：
- 探测结果摘要（只写布尔信号，不复制环境变量值）：
- 注册表 Agent ID 和状态：
- 当前会话实际工具与可用参数：

## 输出

- 用户确认的当前 Agent：
- 已验证传输：
- 方案 ID：
- 决策：continue / adapt / wait
- 🔴 CHECKPOINT 状态与确认范围：

## 边界

此记录不是工具可用性的证明；每个能力结论都要附实际观察证据。不得记录密钥或个人绝对路径。

## 示例

detectedAgent=t3-code，hasT3AcpMcpCall=true，注册状态为 supported；用户确认宿主后，检查当前会话是否真的提供 delegate_task 或 ACP 调用入口。
