# speckit-loop

## 定位

面向 Agent Skills 兼容运行时的规格驱动开发编排器。它让 Spec 成为验收与迭代依据，覆盖需求采访、Clarify、Plan/Tasks、TDD、独立审查、Analyze/Converge 和人类验收。

## 目录

- intention-skills/：判断流程密度、阶段路由与回流。
- feature-skills/：执行规格澄清、任务拆分、实现审查和规格收敛。
- template/：最小样例与完整样例，均为说明性示例，不代表真实历史项目。
- assets/：交接、审查清单与 few-shot。
- references/：阶段边界、失败回退与停止条件。
- evals/：触发边界和 Darwin 评估记录。

## 使用流程

~~~text
使用 $speckit-loop 为一个跨 API 与管理界面的功能建立可验收规格，
按风险选择流程密度，完成规划、实现、独立审查和收敛检查。
~~~

单点低风险任务走轻量路径；跨模块需求默认走标准路径；数据、安全、权限或不可逆影响走高风险路径并设置人工门禁。若当前运行时已有 speckit-* 阶段技能或命令，只在对应阶段调用；不可用时按本套件内嵌流程完成，不假设固定插件。

现有 Spec Kit 节点名称与命令映射见 references/Spec Kit阶段映射.md。

## Darwin 状态

套件包含 should-trigger / should-not-trigger 用例、三条受控试跑提示词、9 维评分记录和边际收益停止规则。第三轮 Darwin 双盲复评为 90.0 与 87.3 分（百分制归一化），达到 85 分门槛，当前建议收手。试跑是提示词级 paired Agent 输出比较，不是运行时代码集成测试。评估轨迹见 evals/。
