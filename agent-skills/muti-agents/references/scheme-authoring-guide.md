# 协作方案编写指南

## 任务

把可重复的多 Agent 研发过程定义为注册表中可检索、可比较、可验证的方案。

## 输入

用户目标、宿主/模型能力证据、各阶段职责、交接契约、隔离模式、执行模式、门禁与验收。

## 方案字段

一个方案应包含：

- code 与全局唯一 id，名称和简明适用条件。
- supportedAgents，只列已登记且本任务能力可用的宿主。
- stages[]：唯一阶段 ID、角色、宿主、模型、level、职责和客观 exitCondition。阶段的 `model` 或 `level` 可设为 `inherit-current`，表示运行时沿用当前主线程的模型或 level；这不会改变固定委派目标。
- delegation：provider/model、role、interactionMode、isolation、mode 和经能力检查的 options。
- sameModelPolicy：`always-delegate` 表示 Exec 始终通过 `delegate_task` 创建独立子线程，即使主线程与委派目标模型相同；该字段不允许在委派失败时本地执行或改派其他模型。
- humanGates：启动、写入、对外传输等必须确认的边界。
- forbidSilentDowngrade: true，以及可验证的失败处理。

`sameModelPolicy: "always-delegate"` 是当前方案注册表使用的策略值。若固定 provider/model 不可用，仍按 `forbidSilentDowngrade` 停止并报告，不静默切换目标。

## 编写流程

1. 先定义方案解决的问题和明确不处理的任务。
2. 为每阶段指定一名责任 Agent，列出输入、输出及交接时机。
3. 把模型名称与当前能力证据分开记录；未知项须标记，不猜测。
4. 展示注册表差异、是否影响默认方案、脚本兼容要求和回归用例，等待 🔴 CHECKPOINT。
5. 批准后编辑 schemes-registry.json，添加脱敏快照和唯一 ID 的触发/回归案例；运行现有脚本测试。

## 输出

候选 JSON、样本路径、测试 ID、能力证据、人工确认记录和真实测试结果。

## 边界

- 新增方案不自动变成默认方案；默认值改变需明确单独确认。
- 只写已验证的 provider/model、参数和宿主。
- 研发角色委派与批量 HTTP API 路权并发分开；后者使用多模型并发调度。
- 方案中不得保存用户任务凭据或机器专属绝对路径。

## 示例

候选 S-02 增加一个备用 Exec 模型。记录它的适用触发条件、切换前是否等待用户确认、目标模型参数、失败停止条件及用例。若能力还没验证，supportedAgents 不包含未验证宿主，也不改变 defaultSchemeId。
