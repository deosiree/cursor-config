# 决策矩阵（代码质量与排障）

1. 前端状态已变但 UI 异常，优先 `data-flow-check`。
2. 选择器/节点生命周期/事件绑定问题，优先 `dom-utils-check`。
3. 重构后路径、导入导出、命名一致性检查，优先 `file-check`。
4. 发布前阻断项、回滚路径、配置差异检查，优先 `prod-risk-check`。
5. 需要按 checklist 做系统化排查，优先 `todolist`。
6. 需要沉淀调试流程为可复用 skill，优先 `gen-debugskills`。
