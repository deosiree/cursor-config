# 跨 Skill 协作协议

本协议定义 `$issue-pr-loop` 与其他专业 Skill 之间的轻量渐进披露式协作规范，确保交付外环主权清晰、阶段职责单一、触发条件客观可验、失败回退有据可查。

## 定位与主权边界

- **外环独占主权**：`$issue-pr-loop` 独占交付外环，全权负责 GitHub Issue 登记与同步、开发分支、PR 创建与读回、Goal/依赖图维护以及 `HITL-1` / `HITL-2` 人工门禁。
- **内环单阶段执行器**：被协作 Skill 仅作为单个阶段的专业执行器运行，完成后将产物（澄清后的规格、任务清单、修改后的 Skill、评测报告等）回流至 `$issue-pr-loop` 外环继续推进。
- **越权禁止**：任何被协作 Skill 及其子代理均不得自行创建或关闭 GitHub Issue、推送分支、创建或合并 PR，也不得绕过 `HITL-1` / `HITL-2` 改变请求终点与授权范围。

## 纵向 Single Dispatch 与横向 Swarm 正交边界

- **纵向 Single Dispatch（严禁跨阶段嵌套）**：同一阶段内有且仅有一个协作 Skill 处于激活状态；严禁在被调 Skill 完成后未经外环交接直接自动链式触发下一阶段 Skill（例如不得由 `$speckit-clarify` 自动嵌套调用 `$speckit-plan` 或 `$写skill`）。
- **横向 Swarm 正交并行（详规见 [[DAG与Swarm调度协议.md]]）**：纵向 Single Dispatch 不禁止被调协作 Skill 在其**同阶段内部**使用独立工作区并行或 Swarm 推进（例如 `$speckit-implement` 的 `[P]` 并行任务、`$darwin-skill` 的多题并发盲评）。
- **并行约束**：同阶段内派生的子 worker 必须隔离各自编辑路径或使用独立工作区，且严禁越权写入 GitHub（Issue/分支/PR/合并）；所有并行产出必须先汇聚回该阶段执行器，再统一回流 `$issue-pr-loop` 外环。

## 三大协作域与硬触发信号

### 1. Spec Kit 套件（`$speckit-loop` + 原子 Skill + `specify-cli`）

- **硬触发信号**：存在影响验收标准、数据/安全边界或接口契约的 `NEEDS CLARIFICATION`，或存在跨多阶段规格缺口、缺失基线规格。
- **路由规则**：
  - 存在多阶段规格缺口或复杂需求需端到端收敛时，触发 `$speckit-loop` 进行阶段编排。
  - 只需单点规格动作时，按需单点披露并调用对应原子 Skill：`$speckit-baseline`、`$speckit-specify`、`$speckit-clarify`、`$speckit-plan`、`$speckit-tasks`、`$speckit-checklist`、`$speckit-implement`、`$speckit-analyze`、`$speckit-converge`（具体可用性以运行时与 `specify-cli` 探测结果为准）。
- **硬禁用项**：**明令禁止调用已废弃的 `speckit-taskstoissues`**。所有 Issue 规划、发布与同步一律由 `$issue-pr-loop` 外环执行。

### 2. 项目宪法修订（`$speckit-constitution`）

- **硬触发信号**：仅当目标项目缺少宪法文件，或用户需求**明确要求**修订长期治理原则时，方可触发 `$speckit-constitution`。
- **严格 Scope Guard**：普通业务功能开发或 Bug 修复**严禁**借机修改 `.specify/memory/constitution.md`（即使是为当前实现“放宽约束”或“方便通过”）。若确需修宪，必须停止混合实现，将修宪剥离为独立子阶段并经用户单独澄清与确认后再提交。

### 3. Skill 编写与实测进化（`$写skill` / `$darwin-skill`）

- **硬触发信号**：拟改动或新增路径命中 `SKILL.md`、`*-skills/` 或 `evals/` 目录时，即使表面上只涉及数行触发词或文案微调，也默认硬触发跨 Skill 协作（禁止按普通业务小修跳过）。
- **分阶段依次调用**：
  - 实现/改造阶段 → 激活 `$写skill`；
  - 评测/验证阶段 → 激活 `$darwin-skill`。
  - 两阶段之间须经 `$issue-pr-loop` 交接，不得在同一阶段混调或套娃。

## 执行前双保险与 5 要素披露协议

- **保险 1（硬触发信号判定）**：以客观文件路径（`SKILL.md` / `*-skills/` / `evals/`）与规格/契约缺口（`NEEDS CLARIFICATION`、缺宪法）作为触发依据，禁止凭主观判断“只是小改”而绕过协作。
- **保险 2（`HITL-1` 一行埋点）**：在 `HITL-1` 确认包中固定输出一行 `协作 Skill 计划`：
  - 命中协作条件时：一行写明阶段映射（例如 `协作 Skill 计划：实现 → $写skill；验证 → $darwin-skill`）。
  - 普通任务未命中时：只写 `协作 Skill 计划：无（按普通改动处理）`，**绝不**把未使用的 Skill 逐一列出“报菜名”。
- **阶段调用前 5 要素披露**：进入每个协作阶段并实际调用对应 Skill 前，必须向用户显式披露以下 5 要素：
  1. **拟调用 Skill**：具体 Skill 名称（如 `$speckit-clarify`、`$写skill` 等）。
  2. **触发原因**：命中的客观路径或契约缺口信号。
  3. **当前所处阶段**：外环所处阶段及本次承担的子阶段职责。
  4. **预期交接产物**：本阶段完成并回流外环的具体产物（如基线 spec、修改后的 `SKILL.md`、E2 评测报告）。
  5. **对应 HITL 门禁**：当前所处或即将停靠的门禁（`HITL-1` / `HITL-2`）。
- **显式例外（头脑风暴等自由探索）**：当用户明确提出“头脑风暴”等自由探索指令，要求由 AI 自行判断 Skill 调用时，免除 `HITL-1` 固定协作埋点与刚性 5 要素披露，但仍须恪守外环交付边界（未经确认不修改代码、不写 GitHub 远端）。

## 失败回退（Human Loop）

- **STOP 条件**：协作 Skill 缺失/未加载、`specify-cli` 探测失败、`darwin.py` 或相关校验脚本报错退出、或缺少必需运行权限（如子代理权限不足）。
- **强制动作**：立即 **STOP**，向用户完整报告真实失败证据（执行命令、错误输出、缺失产物或权限项），并给出可选处理路径供用户裁定（Human Loop）。
- **严禁事项**：严禁静默切换至未授权的替代 Skill 或手工流程；严禁用人工推演或口头检查冒充 `darwin.py` E2 实测通过；严禁隐瞒阻塞继续创建 Issue 或 PR。

## 正例与反例

### 正例

1. **Spec Kit 编排与单点补基线**：
   - 多模块计费需求存在影响验收的 `NEEDS CLARIFICATION` 时，`HITL-1` 写明 `协作 Skill 计划：澄清与规划 → $speckit-loop`，调用前披露 5 要素，不使用 `speckit-taskstoissues`，澄清后回流 `$issue-pr-loop` 规划 Issue。
   - 接手无文档旧仓仅需补齐基线规格时，单点路由至 `$speckit-baseline`（或轻量单点阶段）而不强行跑全套文档，产出基线后回到 `$issue-pr-loop` 规划后续 Issue。
2. **Skill 改造两阶段分离**：
   - 修改 `agent-skills/translate/SKILL.md` 三行触发说明时，识别路径命中 `SKILL.md` 硬信号，`HITL-1` 写明 `协作 Skill 计划：实现 → $写skill；验证 → $darwin-skill`，分阶段依次调用并披露 5 要素，Issue 与 PR 仍由 `$issue-pr-loop` 独占。
3. **普通业务零罗列与头脑风暴例外**：
   - 修复订单详情页金额四舍五入显示错误时，未命中任何硬信号，`HITL-1` 仅写 `协作 Skill 计划：无（按普通改动处理）`，绝不罗列未用 Skill。
   - 用户开启“头脑风暴”模式重构报错通知架构并要求 AI 自行判断 Skill 时，免除刚性埋点与披露格式，仍保留确认前不改代码、不写远端的边界。

### 反例

1. **Scope Guard 失守（借业务改宪法）**：
   - 为导出模块增加分页参数时，顺手调用 `$speckit-constitution` 或直接修改 `.specify/memory/constitution.md` 放宽规则，并将业务改动与修宪混在同一步骤交付。
2. **失败静默替代与调用废弃 Skill**：
   - 运行 `darwin.py` 因缺少子代理权限报错退出，或 `specify-cli` 与 `$speckit-clarify` 不可用时，不 STOP 报告证据，而是擅自以手工口头检查冒充 E2 通过继续开 PR，或调用已废弃的 `speckit-taskstoissues`。
3. **报菜名与越权嵌套**：
   - 在普通单点业务 Bug 修复的 `HITL-1` 确认包中，把 `$speckit-loop`、`$speckit-constitution`、`$写skill`、`$darwin-skill` 逐个列出来声明“均不使用”；或令被调协作 Skill 越权直接创建 GitHub Issue / 开 PR，或在同阶段内链式自动套娃调用多个协作 Skill。
