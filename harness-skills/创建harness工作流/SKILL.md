---
name: 创建harness工作流
description: 为任意仓库从 0 创建或升级 Agent Harness：先认识项目（拓扑、主域、契约 SSOT、验证命令），再约定协同（分拣、证据门、审查导览、skills 分层），最后按 P0–P2 缺口落地文件。不传授样例项目业务规则。触发词：创建 harness、升级 harness、harness 工作流、表面分拣、质量 Loop、AGENTS 宪法、认识项目、可迁移能力。
---

# 创建harness工作流

## 目标

让 harness **认识并协同目标项目本身**，而不是照搬某个样例仓的业务规则。

| 学 | 不学 |
| --- | --- |
| 如何发现仓拓扑、主域、SSOT、验证手段 | 样例仓的命名、会话模型、后端边界等业务事实 |
| 如何分拣表面、证明 DONE、记心智、拦失败 | 把样例路径/命令原样拷进目标仓 |
| P0–P2 可迁移能力与填空落地 | 「挂接某一样例仓」本身 |

样例仅见 `[[references/样例-Nebula.md]]`，必须改写成目标项目名词。

## 速查决策树

```text
有 targetPath 且可扫？
  ├─ 否 → 🔴 问路径；YAML 全 unknown；拒写正式文件；拒拷样例
  └─ 是 → 填幕1 Discovery
        ├─ 无 harness → P0 最小文件集填空 → 再选 P1（审查导览+质量Loop）
        └─ 有旧 harness → 对照可迁移能力勾缺口 → 合并勿毁历史
用户要拷贝样例业务规则 / 样例 L2 路径？
  └─ 🛑 拒绝 → 只迁能力槽位 → 用目标仓命令填空
声称 DONE？
  └─ 无 L0/L1/L2 外证或 sampleLeakScan=失败 → 不得 DONE
```

## 何时使用

- 目标仓无 `AGENTS.md` / harness，要从 0 建
- 已有旧 harness，要补审查导览、质量 Loop、表面分拣、Eval 门禁
- 用户说「把 harness 方法论迁到新项目」「教 agent 认识这个仓」

## 何时不要使用

- 只改业务功能、不涉及 harness 文档/工作流
- 用户要的是学某一产品的业务逻辑（应读该仓 ARCHITECTURE / 领域 skill）
- 只润色某份已有 AGENTS 文案且无能力缺口

## 输入契约

必须拿到或先扫出：

- `targetPath`：目标仓库根（**用户未给且本轮未扫到 → 禁止用当前 IDE 工作区当目标仓预填**）
- 目标是 **无 harness** 还是 **旧 harness 升级**
- 是否多仓 Meta-Workspace

幕1 未填完前，**禁止**写入目标仓 harness 文件。

若 `targetPath` 缺失：

1. 🔴 CHECKPOINT：先问人目标仓绝对路径  
2. `discoveryTable` 字段一律写 `unknown`，`stopOrCheckpoint` 写明待路径  
3. `filesToWrite` 只允许一行占位说明，**不得**列出将写入的正式路径清单  
4. **禁止**把当前打开的样例仓（如 Nebula Meta-Workspace）事实填进 `discoveryTable` 冒充已认识目标项目  

## RED（失败基线 = 幕1 认识项目）

先回答「没有本 skill / 没有 harness 时 agent 会怎样失败」，并填 Discovery 表。

### 幕1 · Discovery（输出表必须填满）

| 字段 | 从哪扫 | 输出 |
| --- | --- | --- |
| 仓拓扑 | README、根目录、git submodule / workspace | 单仓 / 多仓；各模块路径 |
| 负责人主域 | 维护者口述或高频改动目录 | 业务 bug 默认盯哪些路径 |
| 契约 SSOT | `openapi`/`swagger`/`proto`/`api.md` | 唯一真相源路径 |
| 验证命令 | package.json scripts、Makefile、CI | L0/L1/L2 各用什么命令；缺什么 |
| 现有 harness 碎片 | 是否已有 AGENTS、docs、evals | 缺口对照 `[[references/可迁移能力.md]]` |

工作表：`[[assets/discovery-worksheet.md]]`。

### 失败分支（幕1）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 扫不出主域 | 🔴 CHECKPOINT：问「日常主战场目录是哪几个」 | 主域写 `unknown`；禁止用样例主域顶替；不得 DONE 写文件 |
| 扫不出 SSOT | ARCHITECTURE 写「契约待定」 | 🛑 STOP：禁止臆造 API 字段规则；相关 filesToWrite 标阻塞 |
| 只有 type-check、无单测/E2E | 缺口记入 `verify.missing`；L1/L2 用目标仓将补手段 | 禁止拷贝样例 hytests/openCLI 路径充 L2 |
| 用户把样例业务规则当必学项 | 纠正：只学发现边界；样例仅附录 | 若坚持拷贝 → 🛑 STOP，本 skill 拒绝执行拷贝 |
| `targetPath` 未给且未扫目标仓 | 🔴 问绝对路径；表内填 `unknown` | 禁止用当前 IDE 工作区样例事实预填 discoveryTable |
## GREEN（协同约定 + 按缺口落地）

### 幕2 · Collaboration（写入宪法时必须覆盖）

1. **AGENTS 宪法**：只读 vs 变更；硬约束；黑名单；显式 🔴 CHECKPOINT / 🛑 STOP  
2. **表面/模块分拣**：一次改一处；跨边界先问人（见 intake）  
3. **质量 Loop**：外证 DONE；证据阶梯（缺测补测；UI/集成用**本项目**脚本）；tiny 不加重量级；禁自评 DONE  
4. **审查导览**：五模块权威文件；心智放哪；新心智写入流程  
5. **Skills 分层**：宪法 > 领域 skill > 通用写/评 skill；禁止盲升压过宪法  

细则能力名见 `[[references/可迁移能力.md]]`。

### 幕3 · Migrate（填空，不拷贝）

```text
1. 对照 P0→P1→P2 勾缺口
2. 无 harness → 落地最小文件集，用幕1答案填空
3. 旧 harness → 合并 REVIEW / QUALITY_LOOP / 分拣；勿删历史
4. 用目标项目名词写 surface、主域路径、L2 脚本
5. 跑一条 tiny 改动验证 Loop
6. 有余力再上 Eval / CLI（P2）
```

**无 harness 最小文件集：**

- `AGENTS.md`
- `docs/README.md`
- `docs/FEATURE_INTAKE.md`（或等价 intake）
- `docs/ARCHITECTURE.md`
- `docs/HARNESS_REVIEW.md`（或等价审查导览）
- `docs/QUALITY_LOOP.md`
- `docs/GLOSSARY.md`（短）
- `docs/templates/story.md`、`docs/templates/decision.md`

骨架示例（虚构单仓）：`[[template/虚构单仓-ReactREST.md]]`。

### 失败分支（幕2–3）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 草稿残留样例专有名词且非附录 | 删除或改写为目标事实；`sampleLeakScan=失败` | 不得 DONE；重跑幕1 填空 |
| 质量 Loop 只写 type-check | 补 L1/L2 判定与外证要求 | 不合格，打回 GREEN |
| 旧 harness 已有 Eval | 旁路合并；不覆盖历史 score | 人确认合并策略后再写 |
| 多仓要往业务子仓根塞可入库 AGENTS | 🛑 STOP：改写到 Meta 父仓或 gitignore 薄文件 | 拒绝提交该路径 |
| 幕1 空字段仍要上全套 P2 CLI | 先停在 P0；P2 标「以后再上」 | 删掉 P2 filesToWrite |
## REFACTOR

- 把复发失败写入目标仓黑名单 / ADR / Eval 题，不只修个案  
- 软化措辞（「建议/视情况」）改成可执行步骤或显式 CHECKPOINT  
- 长示例下沉 `[[references/]]` / `[[template/]]`，主文件只留三幕与失败表  

## 黑名单（出现即失败）

1. 把样例项目的命名、会话、后端边界当成通用真理拷贝  
2. 教 agent 背业务逻辑，而非「如何发现业务边界」  
3. 盲升领域 skills 压过宪法  
4. 用 L0 type-check 冒充完整质量 Loop  
5. 强制自动 hook 跑 Eval（门禁由 Agent CHECKPOINT / 人触发）  
6. 以「挂接某一样例仓」为教学主章节  

## 反例（错 → 对）

| 错 | 对 |
| --- | --- |
| 「把 Nebula 的 Cookie-Session / Apex 命名 / seccenter 边界写进新仓 AGENTS」 | 「问新仓会话与模块边界是什么；写进新仓自己的硬约束」 |
| 「L2 必须用 openCLI + hytests 那条路径」 | 「L2 = 目标仓已有或将补的 UI/集成脚本；没有则先补再 DONE」 |
| 「同步 harness = 复制样例 docs 全文」 | 「按可迁移能力勾缺口；用幕1 表填空生成」 |
| 「学完样例业务就能建 harness」 | 「学会 Discovery/Collaboration/Migrate；样例只证明槽位可填」 |
| 「未给目标路径就按当前打开的 Nebula 仓填满 discoveryTable」 | 「路径未知 → unknown + 🔴 问路径；禁止工作区冒充目标仓」 |

## 输出契约

每轮回复**必须**含下列五块（缺一块 = 未完成）。禁止只写散文总结。

### 交付模板（强制粘贴并填空）

```yaml
discoveryTable:
  topology: ""           # 单仓|多仓 + 模块路径列表
  ownerDomains: []       # [{name, path}]
  apiSsot: ""            # 路径或「契约待定」
  verify: { L0: "", L1: "", L2: "", missing: [] }
  existingHarness: {}    # 见 assets/discovery-worksheet.md
gapChecklist:
  - { capability: "P0-宪法", status: "有|无|部分", action: "" }
  - { capability: "P0-分拣", status: "", action: "" }
  - { capability: "P0-架构地图", status: "", action: "" }
  - { capability: "P1-审查导览", status: "", action: "" }
  - { capability: "P1-质量Loop", status: "", action: "" }
filesToWrite:
  - { path: "AGENTS.md", fillWith: "目标仓名词要点…" }
qualityLoopMeans:
  L0: ""
  L1: ""
  L2: ""
stopOrCheckpoint: "无 | 🔴… | 🛑…"
sampleLeakScan: "通过|失败"   # 失败=产物含样例专有名词且非附录
```

幕1 任一关键字段为空时：`stopOrCheckpoint` 必须非「无」，且 `filesToWrite` 只能含「待人确认后的占位说明」，**不得**列出将写入的正式 harness 正文路径。

### 发出前自检（三条全过才可结束本轮）

1. YAML 五块 + `sampleLeakScan` 均已出现  
2. 若 `stopOrCheckpoint` 含 🔴/🛑，则未声称已写入正式 harness 文件  
3. 正文无「必须拷贝样例 L2 路径 / 样例会话模型」类指令  
## 使用示例

```text
目标仓是 F:\work\acme-web，几乎没有 AGENTS。
使用「创建harness工作流」：先填认识项目表，再按 P0 生成最小 harness，不要拷贝 Nebula 业务规则。
```

```text
旧仓已有 AGENTS，但没有审查导览和质量 Loop。
对照可迁移能力补 P1，surface 名用该仓模块名。
```

## 验收（本 skill 自身）

- 对虚构「单仓 React+REST」能填出无样例专有名词的骨架（除附录）  
- 能回答：harness 怎样认识陌生项目；怎样协同完成证明  
- 不得把「同步样例业务特例」列为必做项  
