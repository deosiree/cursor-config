---
name: muti-agents-scheme-selection
description: 当宿主和委派能力已经确认，需要展示登记方案、让用户选择研发阶段的多 Agent 角色与模型组合时使用。
---

# 选择多 Agent 协作方案

## 任务

从 [方案注册表](../../assets/schemes-registry.json) 读取可用方案并呈现用户可比较的角色、模型、阶段、隔离、执行模式和门禁。方案选择由用户完成。

## 输入

- 已确认的宿主 agentId 与实时可用通道。
- [Agent 注册表](../../assets/agents-registry.json) 中的支持信息。
- [方案注册表](../../assets/schemes-registry.json) 中的方案和默认方案 ID。
- 研发任务、计划状态和验收要求。

## 流程

1. 只列出包含当前宿主且 forbidSilentDowngrade 不为 false 的方案。
2. 用表格逐条呈现方案代码、各阶段角色与模型/level、isolation、mode、默认选项和人工门禁。当前 S-01 固定由 Gemini 4 Neon 计划/验收并委派 Codex GPT-6 Luna 实现；S-02 的 Plan/验收继承当前模型与 level，Exec 固定为 Codex GPT-6 Luna max。
3. 标明注册表的 defaultSchemeId 仅供展示，不表示用户已选择。
4. 询问选择方案、当前 Agent 单独完成，或新增方案沉淀；新增需求路由到对应 feature。
5. 记录选择结果并将任务交给“执行 T3 Code 分模型委派”或当前宿主适配的 feature。

## 输出

~~~text
availableSchemes: [{ code, id, stages, constraints }]
selectedSchemeId: 用户选择的 ID 或 null
nextAction: dispatch | single-agent | author-scheme | wait
openQuestions: 尚缺字段
~~~

## 边界

- 不因只有一个方案而自动选择，也不把默认方案当成授权。
- 当前 Agent 不在方案支持列表时隐藏为不可选，并说明原因。
- 不在此节点创建分支、改注册表、发送委派请求或承诺模型可用。
- 多模型并发调度的 HTTP API 批处理需求不属于本节点。

## 示例

当前宿主为 t3-code，注册表包含 S-01 和 S-02。并列展示两者的阶段模型、level、共享工作区、async 执行和 Plan 确认门禁；说明 S-02 在 Gemini 额度耗尽并手动切换当前线程到 Codex Luna 时无需改选方案，Exec 仍通过 `delegate_task` 独立派发。再询问用户选择一个方案或“暂不委派，由当前 Agent 执行”。

## 路由

- 已选择方案：[执行 T3 Code 分模型委派](../../feature-skills/执行-T3Code分模型委派/SKILL.md)
- 要新增方案：[沉淀新方案](../../feature-skills/沉淀-新协作方案/SKILL.md)
