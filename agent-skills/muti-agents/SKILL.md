---
name: muti-agents
description: 当需要多 Agent 角色分工与研发阶段委派、跨机器复用分模型流程时使用。muti-agents、multi-agent、多Agent协作、分模型委派、Plan/Exec 分工；识别宿主、确认适配能力、选择协作方案并在授权后派发与验收。用于研发任务的角色协作，不用于批处理 HTTP API 路权并发。
---

# muti-agents

## 目标

把研发任务按研究、实现、审查等角色交给合适的 Agent，并保留人类对宿主、方案和外部委派的控制。先识别当前宿主，再核对登记能力与实时通道，不因工具缺失而静默换路。

## 何时使用

- 需要多个 Agent 在研发阶段按角色分工、交接上下文或独立复核。
- 需要复用已记录的分模型 Plan/Exec/Verify 方案。
- 需要跨机器发现支持状态，或为未登记宿主提出适配。
- 需要把已验证的 Agent 角色组合沉淀为可复用方案。

## 何时不要使用

- 批量分发独立请求，以 HTTP API 并发和模型路权执行翻译、批量审查或测试时，应分流至兄弟 Skill `多模型并发调度`（同仓库相邻目录 `../多模型并发调度/SKILL.md`），不触发本 Skill，也不代写批处理调度代码。
- 只需当前 Agent 单独完成，且无并行、独立审查或跨模型需求时，不发起委派。
- 仅询问模型价格、API 可用性或并发路权时，不触发本 Skill。

## 输入契约

开始前收集或从当前对话提取以下字段；缺少关键项时只询问缺少项：

| 字段 | 必需 | 说明 |
|---|---|---|
| task | 是 | 可独立验收的研发任务与完成定义 |
| currentAgent | 是 | 探测结果和用户确认的宿主名称 |
| targetAgent/model | 视方案 | 目标 Agent、模型及角色；不可推测能力 |
| plan | 视方案 | 已确认计划文件或明确范围 |
| constraints | 是 | 文件所有权、禁止操作、环境和凭据边界 |
| acceptance | 是 | 测试、静态检查和需要回报的证据 |
| approval | 是 | 是否授权本次外部委派及其具体范围 |

禁止把密钥、令牌、个人路径或不相关对话放进委派简报；探测结果只保留信号布尔值，不输出环境变量原值。

## GREEN · 四步交互引导状态机

每步只在当前状态所需输入齐备后前进；标准流程可直接按本节完成，无需重复通读所有子 Skill（按需下钻）。

### 1. 识别并确认宿主（`identify`）

- 若用户已明确报告远端/目标环境缺少全部委派通道（如既无原生 `delegate_task` 也无 `T3_ACP_MCP_CALL`），直接短路进入阻塞处置，**不要**运行本机探测脚本制造环境冲突，也不要遍历脚本源码。
- 否则运行 `node scripts/detect-agent-env.mjs` 并读取 `assets/agents-registry.json`，报告探测到的宿主、平台、建议传输和信号布尔值，请用户确认“当前 Agent 是什么”。探测不到时由用户指定，不猜测。

### 2. 判定支持与实时能力（`capability`）

- 在 `assets/agents-registry.json` 中精确匹配 `id` 与 `status: supported`。
- 检查当前会话实时可用通道：以已登记的 `t3-code` 适配器为例，先调用 `orchestrator_capabilities` 核实目标 provider/模型；若原生 `delegate_task` 可用则优先直连，若原生工具不可见但 ACP 通道可用则走封装脚本。
- 若未登记或实测无可用通道：停在 `blocked`，不静默降级；由用户选择恢复通道、进入 [扩展新 Agent 适配 Loop](feature-skills/扩展-新Agent适配Loop/SKILL.md)，或显式放弃委派改由当前 Agent 单独执行。

### 3. 展示并选择方案（`choose`）

- 读取 `assets/schemes-registry.json`，按代码、角色阶段、目标模型、隔离和异步策略展示全部有效方案（首版 `S-01`：`Plan（Gemini 4 Neon）→ Exec（GPT-6 Luna）→ 验收（Gemini 4 Neon）`）。
- 由用户选择一个方案、显式改走单 Agent，或进入 [沉淀新协作方案](feature-skills/沉淀-新协作方案/SKILL.md)；不得替用户选模型。

### 4. 确认、委派与验收（`checkpoint → dispatch-and-review`）

- 展示最终简报：任务、目标角色与模型、计划路径、写入范围、禁止事项、传输通道、隔离/异步模式、验收命令与风险。
- 🔴 **CHECKPOINT**：等待用户对本次委派范围的明确授权。
- 获批后执行委派：
  - 原生 MCP 通道：调用 `delegate_task`；
  - 跨平台 ACP 脚本通道：`node scripts/delegate-t3-task.mjs --scheme <id> --plan "<planPath>" --task "<task>" [--title "<title>"] [--dry-run]`（Windows 亦可调用 `pwsh -NoProfile -File scripts/delegate-to-luna.ps1 -PlanPath "<planPath>" -Task "<task>" [-DryRun]`）。
- 异步委派启动后等待宿主完成事件，**禁止轮询 `task_status`**。收到完成通知后由主 Agent 核对文件清单、差异、测试命令与退出码，按证据回报。

## 任务拆分与最小交接

仅把可独立验收的单元交给执行 Agent：前置依赖串行交接；文件集合互斥且可独立验收时才并行；审查者只读差异不兼任实现者。只附任务必需上下文，不转发整段对话。

~~~text
任务：实现计划中的菜单状态映射
所有权：只允许写 src/menu/
禁止：提交、推送、改配置或修改其他目录
验收：npm test -- src/menu；回报完整文件清单与退出码
阻塞：缺少接口或环境时停止并报告，不扩大范围
~~~

## RED · 失败基线与安全回流

“回流”指退回上一个有效决策状态或明确停止，**绝不**自动换模型、换宿主或改成本地执行；每次回流保留已确认字段，重新授权前不重发外部任务。

| 失败场景 | 处置与回流状态 | 可继续条件 |
|---|---|---|
| 当前宿主未确认 / 探测冲突 | 停在 `identify` | 用户确认宿主且环境证据一致 |
| 宿主未登记或未验证 | `capability → adapter` | 完成适配提案并过人工门禁（详见适配 Loop） |
| 缺失全部委派工具或环境变量 | 直接短路 `blocked`，不跑冲突探测 | 恢复通道、完成适配，或用户显式改单 Agent |
| 注册方案不存在或不适配 | 回流 `choose` | 用户另选有效方案或显式改单 Agent |
| 计划、所有权、验收或授权缺失 | 停在 `checkpoint` | 补齐简报并获覆盖本次范围的明确授权 |
| ACP 脚本返回非零码 / 报错 | `dispatch → failed` | 修复根因并经用户重新确认同一范围 |
| 异步任务未收到完成通知 | 保持 `waiting` | 宿主发出完成或失败事件 |
| 改动越界或验收命令失败 | `review → blocked/failed` | 审阅越界并重授权，或按失败证据修复后复验 |

## 🔴 CHECKPOINT · 人工门禁

以下动作前必须展示具体预览并获得明确同意（沉默、模糊回应或他项授权不算确认）：

- 调用另一个 Agent 或向外部宿主发送任务简报。
- 新建或修改适配器、注册表、委派脚本与方案资产。
- 执行改动仓库、建分支、提交、推送、开 Issue/PR 或合并的操作。
- 发送含私有代码或敏感上下文的简报。

## 反例黑名单

- 不把“注册表里有宿主”当成当前会话已具备执行工具。
- 不把子任务已创建、进入等待或收到文本回复当成代码已验收。
- 不在异步委派期间轮询 `task_status`。
- 不用同模型、低能力模型或本地执行冒充目标 Agent，也不在缺通道时静默降级。
- 不把批量 HTTP API 并发调度误路由到本 Skill，也不泄漏环境变量原值或凭据。

## 验收判定与输出契约

证据按来源分列（静态检查、自动化测试、DryRun/mock、完成通知与差异复核），注明命令、退出码与未验证项；不把 DryRun 或委派摘要写成真实完成。一次完整协作至少回报：

~~~text
host: 已确认宿主 / 平台 / 已验证传输
scheme: 方案 ID / 角色与模型
approval: 已确认的动作和范围
handoff: 委派请求 ID 或明确的未派发原因
changes: 文件清单与摘要
verification: 命令、通过/失败结果、未验证项
status: complete | waiting | blocked | failed
~~~

## REFACTOR · 复盘

每次运行后按证据定位短板所属层（描述、能力登记、方案、脚本或测试），只改所属层并补客观回归用例；不以堆砌未验证兜底掩盖缺口。

## 使用示例

用户说：“请按 S-01 将当前修复拆给实现 Agent，计划文件已确认，允许只改 src/menu/ 并运行指定单测。”

正确响应先执行 `node scripts/detect-agent-env.mjs` 确认宿主并调用 `orchestrator_capabilities` 核验通道；展示 S-01 的角色、目标模型、`src/menu/` 所有权与单测命令，在 🔴 CHECKPOINT 获批后派发，并在收到完成事件后报告真实差异与测试输出（未收到通知则报告 `waiting`）。

## 子 Skill 与资源索引（按需下钻）

- 脚本入口：[环境探测](scripts/detect-agent-env.mjs)、[跨平台委派](scripts/delegate-t3-task.mjs)、[Windows 包装器](scripts/delegate-to-luna.ps1)
- 判断层（仅复杂宿主/方案决策时下钻）：[识别当前 Agent 与适配决策](intention-skills/识别-当前Agent与适配决策/SKILL.md)、[选择多 Agent 协作方案](intention-skills/选择-多Agent协作方案/SKILL.md)
- 执行与演进层：[T3 Code 分模型委派](feature-skills/执行-T3Code分模型委派/SKILL.md)、[扩展新 Agent](feature-skills/扩展-新Agent适配Loop/SKILL.md)、[沉淀新方案](feature-skills/沉淀-新协作方案/SKILL.md)
- 清单与参考：[阶段交接与门禁清单](assets/阶段交接与门禁清单.md)、[T3 委派协议](references/t3-code-delegation-protocol.md)、[适配器规范](references/agent-adapter-spec.md)、[方案编写指南](references/scheme-authoring-guide.md)
- 模板与样本：[MVP 简报](template/mvp/README.md)、[运行样本](template/snapshot/README.md)
- 评估资产：[评估定义](evals/evals.json)、[测试提示](test-prompts.json)、[触发测试](trigger-tests.json)
