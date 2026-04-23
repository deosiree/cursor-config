---
name: gen-readme
description: 编排 microfb 文档体系生成流程，支持“架构拓扑、符号定位、图类型判定、主题模块化拆分、README 索引回填”。Use when 需要基于源码批量生成/重构 docs，或需要父子skill并行落地文档体系。
---

# gen-README 父技能（编排器）

## When to Use

- 用户要求基于源码生成一整套文档（不是单文件临时说明）。
- 需要“父 skill 编排 + 多子 skill 并行落点”。
- 需要先做架构拓扑与符号定位，再做文档写作。
- 需要自动判断图类型（`flowchart TD` / `sequenceDiagram`）。
- 需要按“主题 × 模块”拆成多文件并维护索引。

## 输入约束

默认输入目录（由用户已准备）：

- 模板副本：`template/microfb/`
- 绘图规则：`docs/Mermaid.md`、`docs/sequenceDiagram.md`

若用户未明确输出目录，默认输出到当前项目 `docs` 对应主题目录。

## 模板锚点总约束（降低自由发挥）

- 每个子 skill 必须声明并读取自己的相对引用锚点（Template Anchors）。
- 若锚点缺失，先报告缺失并暂停生成，不允许猜测性补全。
- 子 skill 输出不得突破锚点定义的目录层级、命名风格和状态机阶段。

## 强制流程（状态机）

```mermaid
flowchart TD
  startNode([开始]) --> intakeTask["S1 任务接收"]
  intakeTask --> routePhase["S2 子skill路由分类"]
  routePhase --> resumeCheck{"R1 是否中间态介入?\n(resumeFromState)"}
  resumeCheck -->|否| classifyTask["S2B 任务分类(主题/模块/输出粒度)"]
  resumeCheck -->|S7| diagramClassify["S7 图类型分类"]
  resumeCheck -->|S8| writePhase["S8 文档生成"]
  resumeCheck -->|S9| lintPhase["S9 图语法质检"]
  classifyTask --> topologyPhase["S3 生成架构拓扑"]
  topologyPhase --> gateTopology{"G1 拓扑完整?"}
  gateTopology -->|否| topologyRepair["S3R 修复拓扑输入"] --> topologyPhase
  gateTopology -->|是| symbolPhase["S4 符号定位"]
  symbolPhase --> gateSymbol{"G2 定位完整?"}
  gateSymbol -->|否| symbolRepair["S4R 补充定位"] --> symbolPhase
  gateSymbol -->|是| structurePhase["S5 结构规划"]
  structurePhase --> splitPhase["S6 多任务切分(主题 x 模块)"]
  splitPhase --> matrixCheck{"G3 模块矩阵完整?"}
  matrixCheck -->|否| matrixRepair["S6R 补齐模块文档集合"] --> splitPhase
  matrixCheck -->|是| diagramClassify["S7 图类型分类"]
  diagramClassify --> writePhase["S8 文档生成"]
  writePhase --> lintPhase["S9 图语法质检"]
  lintPhase --> gateLint{"G4 图语法通过?"}
  gateLint -->|否| lintRepair["S9R 修复图语法"] --> lintPhase
  gateLint -->|是| bestPractice["S10 最佳实践同步"]
  bestPractice --> readmePhase["S11 索引回填"]
  readmePhase --> finalGate{"G5 全量验收通过?"}
  finalGate -->|否| rollbackPhase["S11R 回退修复"] --> writePhase
  finalGate -->|是| endNode([完成])
```

## 子技能调度顺序

按以下顺序执行，允许标记为“可并行”的步骤并行执行：

1. `/subskill-router-classifier`
2. `/microfb-topology-mapper`
3. `/microfb-symbol-locator`
4. `/microfb-doc-structure-planner`
5. `/microfb-source-extract`（可与步骤 6 并行）
6. `/diagram-type-classifier`
7. `/microfb-doc-writer`
8. `/mermaid-lint-fixer`
9. `/web-best-practice-sync`
10. `/readme-index-maintainer`

## 模块输出矩阵（S6 硬约束）

每个模块最少输出以下 6 类文档（可一类多文件）：

1. 架构拓扑
2. 运行时拓扑
3. 状态驱动说明
4. 单一状态链路
5. 说明文档
6. 使用手册

模块建议：认证、菜单、路由、子应用、会话、配置（可按项目扩展）。

## 图类型选择规则（调用分类子 skill）

- 简单结构图、单链路：优先 `flowchart TD`
- 并行分支多、强调交互顺序：优先 `sequenceDiagram`

## 必须包含的“符号定位”段

每份文档都要有“符号定位”小节，最少包含：

- 关键文件路径
- 关键函数/变量
- 关键读写点或调用点

不允许只给抽象叙述，不给源码落点。

## 质量门禁

- 门禁 1：拓扑完整（系统边界 + 模块关系 + 调用链）
- 门禁 2：定位完整（文件 + 函数/变量 + 读写点）
- 门禁 3：模块矩阵完整（六类文档齐全）
- 门禁 4：图语法通过（遵循 `docs/Mermaid.md` 与 `docs/sequenceDiagram.md`）
- 门禁 5：索引可用（README 能导航到全部产物）
