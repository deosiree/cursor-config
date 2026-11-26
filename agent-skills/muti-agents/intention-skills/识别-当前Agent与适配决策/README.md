# 识别当前 Agent 与适配决策

## 任务

判断当前宿主是否既已登记，也能在当前会话实际完成所需的委派动作。

## 输入

agents-registry.json、脱敏环境探测结果、当前会话的工具清单和用户对宿主名称的确认。

## 输出

agentId、登记状态、已验证传输、决策 continue / adapt / wait 和证据。

## 边界

探测脚本不暴露环境变量原值。登记能力不能代替当前会话能力检查。该节点不会安装工具或写注册表。

## 示例

宿主探测为 t3-code 且注册表标为 supported，但会话里没有委派工具。结果应为 adapt 或 wait，不可直接进入执行；读取 [主流程](../../SKILL.md) 的门禁后转到 [适配 Loop](../../feature-skills/扩展-新Agent适配Loop/SKILL.md)。

入口：[SKILL.md](SKILL.md)
