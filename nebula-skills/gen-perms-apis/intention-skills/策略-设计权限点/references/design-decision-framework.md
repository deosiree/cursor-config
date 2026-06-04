# 设计决策框架引用

> 完整设计规则见父级 `[[../../../references/perm-design-rules.md]]` 和 feature skill `[[../../../feature-skills/设计权限点与API映射/references/design-framework.md]]`。

## 本节点职责

`策略-设计权限点` 是意图层节点，负责：

1. 确认分析事实是否足够支撑设计
2. 在需要人工裁决的节点提问（权限粒度、跨模块归属、豁免）
3. 汇总人工决策后，调度 `设计权限点与API映射` 产出设计方案

## 不可跳过的决策点

| 决策点 | 为什么不能跳过 |
|--------|--------------|
| 权限粒度：page 级 vs 操作级 | 涉及产品判断，影响角色配置复杂度 |
| 跨模块 API 归属 | 挂在交互页面 vs API 所属模块，影响权限模型 |
| direct/no-auth 豁免 | 必须查源码确认（direct 前缀 + no-auth header） |
| hidden page 收敛 | 全局状态和非导航页的 perm 登记位置 |

## 设计输出校验

- [ ] 每个待设计交互都有对应 perm
- [ ] perm 命名符合 `<模块>:<资源>:<操作>` 约定
- [ ] 豁免清单有源码证据支撑
- [ ] 跨模块 API 归属有明确理由
- [ ] hidden page 结构完整（name/route_path/is_visible/function）
