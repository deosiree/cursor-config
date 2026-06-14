# Darwin 评估闭环案例说明

## 案例
- `darwin-skill`
- `ai-interview-coach`（`assets/few-shot-example/suite-cases/ai-interview-coach/darwin-iteration/`）

## 观察重点
- skill 写完不是终点
- 需要 baseline、试跑、结果记录、keep / revert
- 评估闭环不应堆回主 skill，而应作为独立质量流程

## 接入顺序
1. 先桥接当前工作区的 `./.cursor/darwin-skill`
2. 若缺失，人工索取
3. 若仍缺失，才使用内部降级闭环
4. 稳定后可整体并入 `写skill` 的 Darwin feature 节点
