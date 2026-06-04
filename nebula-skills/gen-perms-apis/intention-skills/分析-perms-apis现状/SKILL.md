---
name: 分析-perms-apis现状
description: 当需要盘点仓库中路由、组件、v-hasPerm 权限点与真实 API 调用现状，或在进入设计/编排/迁移前必须先还原事实时使用。
---

# 分析-perms-apis现状

## RED

- 没有本节点时，agent 容易在链路事实不足时直接给权限设计方案或改码建议
- 常见失败：
  - 只列文件清单，不解释权限链路
  - 不判断哪些接口已挂 perm、哪些未挂但真实调用 API
  - 不输出后续应进入哪个意图节点
  - 跨模块 API 调用被遗漏

## GREEN

- 本节点既是独立分析 skill，也是其他意图节点的公共事实层
- 消费 `[[../../feature-skills/扫描源码权限点与API]]` 产出盘点文档
- 在事实不足时，优先产出：
  - 路由 → 组件 → 权限点的完整映射
  - 每个权限点关联的 API 清单
  - 未命中 v-hasPerm 但真实调用 API 的交互
  - `chainConfidence`
  - `candidateNextIntentions`

## 消费模式

### `direct-analysis-mode`

- 用户明确要求先盘点权限覆盖
- 当前目标是沉淀文档

### `supporting-analysis-mode`

- `策略-设计权限点` 需要盘点结果作为设计输入
- `编排-权限点配置全流程` 需要事实基础
- `迁移-源码改动落地` 需要知道哪些组件缺 perm

## 输出契约

- `analysisGoal`
- `repoScanned`
- `contractsUsed`
- `focusApplied`
- `routeCount`
- `permHitCount`
- `permMissingCount`
- `apiConfirmedCount`
- `apiPendingCount`
- `chainConfidence`
- `analysisBlockingUnknowns`
- `candidateNextIntentions`

## Workflow

1. 确认仓库路径、契约路径、关注范围
2. 消费 `[[../../feature-skills/扫描源码权限点与API]]`
3. 产出盘点文档到 `docs/plans/`
4. 判断链路事实是否足够支撑后续节点
5. 输出 `candidateNextIntentions`

## 分析前置要求

在进入设计或编排前，必须确认：

- 是否已从路由页面出发，递归扫描了所有业务子孙组件
- 是否已完成三类 API 反查（业务层→gateway→api→契约 / 业务层→api→契约 / 子组件抬升→父组件→gateway/api→契约）
- 是否已区分"已命中 perm"和"未命中但调用 API"的交互
- 是否已标记契约缺失的接口为"待人工确认"

## Guardrails

- 不允许跳过盘点直接设计权限点
- 不允许只列页面清单不追 API
- 不允许在 gateway 层停止反查
- 不允许对契约缺失接口主观推断 description
- 不允许忽略 `chainConfidence` 和 `analysisBlockingUnknowns`

## REFACTOR

- 若输出退化为文件清单而非权限链路分析，收紧：「每个路由必须有 组件→perm→API 的完整链路」
- 若 API 反查停在 gateway 层，强制执行三类硬链路反查规则
- 若 `chainConfidence` 和 `candidateNextIntentions` 缺失，补输出契约强制字段
- 若分析结果不能支撑后续意图节点（设计/编排），优先补 `analysisBlockingUnknowns`

## 使用示例

```text
先不要改码，帮我还原 apex_dev 当前每个路由下的权限点和 API 现状。
```

```text
我现在要设计新权限点，但现状不清楚，先补一份盘点文档。
```

```text
只关心 /Apex/tenant 和 /Apex/system/securityConfig 两个路由的权限现状。
```
