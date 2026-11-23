# Spec Kit 阶段映射

仅当当前运行时确认对应技能或命令可用时才调用。命令名与插件可能随运行时变化；先检查，不因缺少某个阶段命令而假设流程已完成。

| 阶段 | 技能名（若已安装） | 常见命令 |
|---|---|---|
| 项目长期原则 | speckit-constitution | /speckit.constitution |
| 需求规格 | speckit-specify | /speckit.specify |
| 规格澄清 | speckit-clarify | /speckit.clarify |
| 技术计划 | speckit-plan | /speckit.plan |
| 任务拆分 | speckit-tasks | /speckit.tasks |
| 任务实现 | speckit-implement | /speckit.implement |
| 文档一致性检查 | speckit-analyze | /speckit.analyze |
| 实现收敛检查 | speckit-converge | /speckit.converge |

## 路由规则

- Constitution 只在缺少项目长期原则或用户要求更新时生成；不为单个功能重复抄写已有规则。
- Specify/Clarify 先于 Plan/Tasks；需求会改变用户可见行为时不得跳过。
- Plan/Tasks 就绪并且依赖满足后才实现。Implement 命令存在也不能取代 Task 范围、TDD 证据和独立审查。
- Analyze 检查规格文档之间的映射与一致性；Converge 检查代码/测试与规格的实现差距。两者不能互相冒充。
- 命令未安装：直接使用本套件对应 feature 的内嵌流程，并记录未安装事实。
- 技能/命令已调用但失败：🛑 STOP，记录错误输出、当前阶段与受阻任务；告知用户失败原因，并询问是否改用内嵌等价流程。得到同意前不切换节点、不重试、不继续依赖该产物的后续阶段。
- 命令成功但缺少必需产物/证据：标记 blocked，列出缺项；若需换方法，先取得用户确认。
