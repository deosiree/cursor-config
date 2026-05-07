---
name: microfb-topology-mapper
description: 基于源码与模板文档生成架构拓扑与运行时拓扑草图。Use when 需要先建立系统边界、模块关系、调用链路，作为后续文档编排的上游输入。
---

# microfb-topology-mapper

## When to Use

- 任务包含“架构拓扑图、运行时拓扑图、模块关系图”。
- 需要先产出系统骨架，再进入细节文档写作。

## Template Anchors（相对引用）

执行前必须先读取以下相对路径：

- `../../template/microfb/README.md`
- `../../template/microfb/前端架构拓扑图.md`
- `../../template/microfb/运行时拓扑_登录到首屏.md`

约束：

- 若锚点文件缺失，先报缺失并停止生成，禁止自由发挥补图。

## Instructions

1. 从 `template/microfb/` 扫描现有文档，优先识别：
   - 总览文档（前端架构拓扑、运行时拓扑、状态驱动说明）
   - 状态链路目录
   - 说明文档目录
2. 提炼两个层次拓扑：
   - 静态拓扑：系统边界、核心模块、依赖关系
   - 运行时拓扑：关键场景时序主链（登录、菜单、子应用、登出）
3. 输出时必须包含“拓扑假设与证据来源”：
   - 模板文件路径
   - 对应源码入口（由 `microfb-symbol-locator` 进一步补全）
4. 图类型先不给最终结论，交由 `diagram-type-classifier` 决策。

## Output Contract

- 输出 `topologyArtifacts`：
  - `staticTopologyDraft`
  - `runtimeTopologyDraft`
  - `evidenceFiles[]`

