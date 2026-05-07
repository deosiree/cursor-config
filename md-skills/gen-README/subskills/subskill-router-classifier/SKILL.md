---
name: subskill-router-classifier
description: 作为子skill路由分类器，按任务意图选择调用哪些子skill、串并行关系与回退策略。Use when 父skill接到文档生成需求但尚未确定最优子skill编排路径。
---

# subskill-router-classifier

## When to Use

- 任务范围不稳定（单模块/多模块、单文档/文档矩阵）。
- 需要在多个子 skill 中选择最小可行调用路径（MVP）。
- 需要明确哪些步骤可并行，哪些步骤必须串行。
- 需要定义失败回退点与重试策略。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../SKILL.md`
- `../../README.md`
- `../diagram-type-classifier/SKILL.md`
- `../microfb-doc-structure-planner/SKILL.md`

约束：

- 路由决策必须与父状态机和子skill契约一致，禁止生成超出锚点定义的新阶段。

## Router Inputs

输入至少包含：

- `taskIntent`：任务意图（新增/补齐/重构/校验）
- `moduleScope`：模块范围（认证/菜单/路由/子应用/会话/配置等）
- `docScope`：目标文档范围（单文档/六类矩阵/全量）
- `qualityLevel`：质量要求（基础/严格）
- `timeBudget`：时间预算（紧急/常规）

可选增强输入（用于中间态介入）：

- `resumeFromState`：从哪个状态机节点恢复（如 `S7`、`S8`、`S9`）
- `manualFindings[]`：人工已确认的问题列表（含文件、图块、建议类型）
- `overrideDecisions[]`：人工覆盖的分类决策（例如强制 `sequenceDiagram`）
- `recheckScope`：复检范围（局部/模块/全局）

## Routing Rules

1. `taskIntent=新增` 且 `docScope=单文档`：
   - 最小路径：`microfb-source-extract` -> `diagram-type-classifier` -> `microfb-doc-writer` -> `mermaid-lint-fixer` -> `readme-index-maintainer`
2. `docScope=六类矩阵` 或 `全量`：
   - 标准路径：`microfb-topology-mapper` -> `microfb-symbol-locator` -> `microfb-doc-structure-planner`
   - 然后进入并行：`microfb-source-extract` || `diagram-type-classifier`
   - 汇合后：`microfb-doc-writer` -> `mermaid-lint-fixer`
   - 收尾并行：`web-best-practice-sync` || `readme-index-maintainer`
3. `taskIntent=校验` 且不要求改文：
   - 校验路径：`diagram-type-classifier` -> `mermaid-lint-fixer` -> `readme-index-maintainer`
4. 必选硬约束：
   - 任何写作前必须已完成符号定位（若缺失则插入 `microfb-symbol-locator`）。
   - 任何出图前必须先过 `diagram-type-classifier`。

## Mid-state Resume Routing（中间态介入）

1. 若存在 `resumeFromState`：
   - 路由器不得重跑 `resumeFromState` 之前的全部链路，除非 `recheckScope=全局` 且用户明确要求。
2. `resumeFromState=S7`（图类型分类阶段）：
   - 优先执行：`diagram-type-classifier` -> `microfb-doc-writer` -> `mermaid-lint-fixer`
   - 若 `recheckScope=全局`，则在末尾追加：`readme-index-maintainer`
3. `resumeFromState=S8`（文档生成阶段）：
   - 优先执行：`microfb-doc-writer` -> `mermaid-lint-fixer` -> `readme-index-maintainer`
4. `resumeFromState=S9`（质检阶段）：
   - 优先执行：`mermaid-lint-fixer` -> `readme-index-maintainer`
5. 若提供 `overrideDecisions[]`：
   - 在进入 `microfb-doc-writer` 前合并覆盖决策，且必须保留覆盖原因审计记录。

## Parallel Strategy

- 可并行组 A：`microfb-source-extract` 与 `diagram-type-classifier`
- 可并行组 B：`web-best-practice-sync` 与 `readme-index-maintainer`
- 串行门禁：
  - `microfb-doc-writer` 必须等待并行组 A 完成
  - 终验必须等待并行组 B 完成

## Retry and Rollback

- 若拓扑不完整：回退到 `microfb-topology-mapper`
- 若符号定位缺失：回退到 `microfb-symbol-locator`
- 若图语法失败：回退到 `mermaid-lint-fixer` 后重跑局部写作
- 若索引异常：仅重跑 `readme-index-maintainer`

## Output Contract

输出 `routingPlan`（JSON 语义结构），至少包含：

- `selectedPath`：选中的子 skill 序列
- `parallelGroups`：并行分组
- `gates`：门禁与通过条件
- `rollbackMap`：失败回退映射
- `mvpScope`：本次最小可行产出定义
- `resumeFromState`：本次实际采用的恢复起点（无则为 `null`）
- `appliedOverrides[]`：已生效的人工覆盖项
- `auditTrail[]`：路由决策轨迹（为什么选这条路径）
