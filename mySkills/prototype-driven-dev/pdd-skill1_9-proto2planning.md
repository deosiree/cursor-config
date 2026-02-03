## Skill 1_9：pdd-skill1_9-proto2planning（从原型到真实代码的实现规划）

### 概述

- **所属阶段**：S2「原型评审 / 落地规划」
- **目标**：在已经有可运行前端原型的前提下，**不急于直接改业务源码**，而是先生成一份结构化的「从原型迁移到正式代码」实现规划（planning），明确：范围、阶段、拆分任务、风险点与验证方案。
- **执行者**：Cursor（Senior Frontend Architect）
- **输入**：
  - 已存在的原型代码（通常在 `prototype/<feature-key>/` 下，如 `PrototypePage.vue`、`XXXPrototype.vue`、`mockUtils.js` 等）
  - 对应的原型设计需求文档（如 `prototype/<feature-key>/原型设计需求.md`，可选但强烈推荐）
  - 目标业务页面/模块位置（如 `src/views/entry/productEntry.vue`）
- **输出**：
  - 一份结构化、可执行的 **「原型 → 正式实现」中文规划文档**，通常建议放在原型目录内，例如：
    - `prototype/<feature-key>/原型实现规划-<模块名>.md`

---

### 定位与与其它 Skills 的关系

- **前置 Skill**：`pdd-skill1-prototype`
  - 假设你已经通过 Skill 1 生成并迭代了一个可运行的原型页面/组件，交互与数据流基本跑通。
- **并行 Skill**：`using-superpowers`、`brainstorming`、`writing-plans`
  - 本 Skill 实际上是将这些「流程类 Skill」在前端原型场景中的具体化与封装：
    - 用 brainstorming 思路梳理原型的功能范围与差异点
    - 用 writing-plans 思路把「迁移步骤」结构化成阶段与任务
- **后续 Skill**：
  - `pdd-skill2-api`：在规划中会指明哪些部分需要输出/更新 API 契约
  - `pdd-skill3-dev`（或类似「从原型接入真实接口」的 Skill）：规划会拆出哪些任务属于「替换 MOCK / 接入真实接口」

> **重要心态**：本 Skill 的产物是「作战计划」，不是立刻改代码。你可以先多次迭代计划，确认范围与风险，再进入真正的开发/重构阶段。

---

### 触发方式（你在 Cursor 里怎么说）

> 一般流程：  
> 1. 打开原型目录下的核心文件（例如 `prototype/writeBackValidate/writeBackButton.vue`）；  
> 2. 打开或确认原型设计需求文档（例如 `prototype/writeBackValidate/原型设计需求.md`）；  
> 3. 在 Chat 中输入下面任意一种触发语句。

- **推荐触发关键词**：
  - `@pdd-proto2planning`
  - `@pdd-skill1_9-proto2planning`
  - `@plan 原型转正式实现`

- **示例 1：基于当前原型目录生成整体落地规划**

> `@pdd-proto2planning 基于 prototype/writeBackValidate 目录下的原型组件，生成一份"从原型到正式代码"的实现规划，规划文件放在同目录下，用中文写。`

- **示例 2：只针对某个原型组件做落地规划**

> `@pdd-proto2planning 只针对 prototype/writeBackValidate/writeBackButton.vue 这个原型组件，规划如何安全迁移到 src/views/entry/productEntry.vue 中，包括阶段划分、任务拆解和风险点。`

- **示例 3：带上目标业务页面**

> `@pdd-skill1_9-proto2planning 原型在 prototype/writeBackValidate，目标业务页是 src/views/entry/productEntry.vue，请生成一份详细计划，说明哪些逻辑留在原型、哪些要迁移到正式页面或 utils/service。`

---

### Skill 内部工作流（你必须怎么做）

> **角色**：Senior Frontend Architect / Tech Lead  
> **目标**：输出「可以拿去开评审会」级别的实现规划，而不是琐碎的 Todo 列表。

#### 步骤 1：收集上下文（Context Gathering）

1. **读取原型目录结构与核心文件**：
   - `prototype/<feature-key>/PrototypePage.vue`
   - 原型核心组件（如 `writeBackButton.vue`、`WriteBackValidateModal.vue`）
   - 原型专属 `mockUtils.js` / `mock.js` / `constants.js` / `utils/` / `http/`
2. **读取目标业务页面/模块**（若用户有指定）：
   - 如：`src/views/entry/productEntry.vue`
   - 关注：已有的按钮区、表格区、状态管理与 API 调用位置。
3. **读取原型设计需求文档**（如存在）：
   - `prototype/<feature-key>/原型设计需求.md`
   - 明确原型到底解决了哪些痛点、有哪些非功能性要求（性能、权限、风险控制等）。

> 若找不到业务目标文件或需求文档，要在规划中显式标记为「待确认」，不要强行假设。

#### 步骤 2：范围界定与差异分析（Scope & Gap Analysis）

在输出的规划文档中，先用一个「范围与对象」章节，至少包含：

- **原型范围**：列出当前原型目录下会参与迁移的文件与组件，以及它们的大致职责。
- **目标范围**：列出目标业务页面/模块（含路径）和相关依赖模块（store、service、utils 等）。
- **差异清单**：
  - 原型多出来的功能/按钮/开关（正式环境是否需要全部保留？）
  - 正式页面已有但原型尚未覆盖的场景（迁移时要避免功能倒退）
  - 状态管理方式差异（本地 data vs Vuex/Pinia/其他 store）

#### 步骤 3：阶段性规划（Phased Plan）

将「从原型到正式实现」拆成 3–7 个清晰阶段，每个阶段要说明：

- 阶段目标（一句话）
- 关键产出物（代码/文档）
- 是否需要联调/评审

典型阶段模板（可按需调整）：

1. **阶段 A：原型代码盘点与整理**
2. **阶段 B：接口与数据流对齐（原型 vs 真实接口）**
3. **阶段 C：模式与行为设计（如 isPrototype / submitMode / mode）**
4. **阶段 D：组件迁移与重构（挂到正式页面/模块）**
5. **阶段 E：回写前校验 / 风险控制流程落地**
6. **阶段 F：Git / 审批 / 审计等外围流程接入**
7. **阶段 G：测试、联调与回归验证**

> 这部分可以直接借鉴并调整已有的「原型实现规划-回写功能」文档结构。

#### 步骤 4：按文件/模块拆解任务（Task Breakdown）

在规划文档中添加「落地到具体文件的改造任务」章节，对每个关键文件给出**任务卡片式**描述，例如：

- **任务 X：规范 `writeBackButton.vue` 中的模式控制与参数构建**
  - 修改/依赖文件：
    - `prototype/writeBackValidate/writeBackButton.vue`
    - `src/views/entry/productEntry.vue`
  - 目标：
    - 明确 props（如 `mode`、`submitMode`、`enableValidation`、`isPrototype`）的语义与默认值。
    - 抽取重复逻辑到辅助方法（如参数构建、表单校验、Git 参数生成）。
  - 验收标准：
    - 原型页与正式页行为一致。
    - 通过指定测试场景（例如「多语种回写且开启校验与 Git 推送」）。

要求每个任务至少包含：

- **修改/依赖文件列表**
- **任务目标**
- **潜在风险 / 注意事项**
- **简单验收标准**

#### 步骤 5：关键决策点与风险（Decision & Risk）

专门开一节，总结实现前需要敲定的关键决策，包括但不限于：

- 是否保留原型页（长期演示 vs 开发完删除）
- 原型模式（`isPrototype`）在不同环境的默认值与开启方式
- 多语言/多来源场景下的「部分成功/全部成功」判定策略
- Git/审批/权限相关的边界情况与兜底策略

对于每个决策点：

- 给出 1–2 个可选方案
- 简要优缺点
- 标记推荐方案（若信息不足，则标记为「待业务确认」）

#### 步骤 6：验证计划（Verification Plan）

在规划中添加「验证计划」章节，按场景列出需要覆盖的测试/验证步骤，例如：

- 功能场景：
  - 单语言回写 / 多语言回写
  - 有/无「回写前校验」
  - 有/无「回写后 Git 提交/推送」
- 异常场景：
  - 接口失败 / 超时
  - 部分语种失败
  - 无可回写数据
- 回归场景：
  - 确认原有导入/导出/筛选等老功能未被破坏

> **注意**：这里只写「计划」，不直接去写测试代码；真正写测试时可以配合项目内的 `plan-test-analysis` 等 Skill。

---

### 输出格式约定

当用户触发本 Skill 时，你应：

1. **自动在对应原型目录下创建/更新规划文档**，命名建议：
   - `prototype/<feature-key>/原型实现规划-<模块名>.md`
2. 规划文档内部结构至少包含以下一级/二级标题（中文）：
   - `一、范围与对象`
   - `二、总体阶段规划`
   - `三、关键设计决策点（需要在实现前确认）`
   - `四、落地到具体文件的改造任务（示例拆分）`
   - `五、验证计划`
   - `六、交付物`
3. 使用项目内既有的术语风格与文件路径，避免抽象化命名。

---

### 与「代码重构最佳实践规则」的衔接

在规划中，遇到需要重构/迁移的组件（如 `methods` 很多、存在大量重复逻辑）时，应主动引用并应用仓库中约定的重构规则，例如：

- 在规划中明确：
  - 需要对 `methods` 进行分组注释（生命周期/交互控制/数据操作/业务逻辑/辅助方法）。
  - 哪些重复逻辑需要提取为辅助方法（如 `extractXxx`、`validateXxx`、`transformXxx` 等）。
- 在具体任务中，写清：
  - 哪些方法将被抽取到 `utils/` 或 service 层。
  - 抽取后的复用关系（例如「回写按钮与导入按钮共享同一验证工具函数」）。

> 这样可以确保：本 Skill 产出的规划，天然符合你项目的重构规范，而不是额外多一套标准。

---

### 最佳实践与使用建议

- **何时使用本 Skill**：
  - 当原型已经能跑通主要交互，但你还没想好如何安全地并入现有复杂页面/业务时。
  - 当需要对接后端/测试/运维，开一个「落地方案评审会」之前。
- **如何迭代规划**：
  - 可以多次触发本 Skill，每次在已有规划文档基础上增量更新。
  - 适合在每次评审/讨论后，用自然语言告诉 Cursor 哪些决策有更新，让本 Skill 重新生成/修订对应章节。
- **如何与其它 Skill 协作**：
  - 确认规划后，再用 `pdd-skill2-api` 生成/更新 OpenAPI 契约。
  - 接着用「开发/接入真实接口」类 Skill 实际修改代码。
  - 最后用 `verification-before-completion` / 测试相关 Skill 做一次系统性验收。

