---
name: 策略-设计权限点
description: 当已有盘点文档，需要设计新权限点的粒度、命名、豁免策略、hidden page 收敛与跨模块 API 归属时使用。
---

# 策略-设计权限点

## RED

- 没有本节点时，agent 容易在权限粒度、豁免判断、跨模块归属等产品决策上自行裁量
- 常见失败：
  - 把所有操作都拆成独立 perm，导致角色配置爆炸
  - 该拆的不拆，用一个 page 级 perm 覆盖所有操作
  - `direct/no-auth` 接口未豁免，被错误挂上 perm
  - 全局状态类接口没有收敛到 hidden page
  - 跨模块 API（如租户页调用 devmgr/dbres）的 perm 归属不清

## GREEN

- 本节点负责权限设计方案，不执行源码改动
- 在盘点事实不足时，必须先消费 `[[../分析-perms-apis现状]]`
- 输出必须包含：
  - 权限粒度决策（页面级 vs 操作级）
  - 豁免清单（direct/no-auth 接口）
  - hidden page 收敛方案
  - 跨模块 API 归属规则
  - perm 命名约定
  - 权限点 → API 映射表

## 输入契约

- `盘点文档路径`：必填（来自 `分析-perms-apis现状` 的输出）
- `关注模块`：可选
- `targetRepo`：可选，默认 `apex_dev`
- `是否允许多轮人工确认`：可选，默认是

## 决策框架

### 1. 权限粒度决策

| 场景 | 推荐粒度 | 示例 |
|------|---------|------|
| 整页只需一个入口守卫 | 1 个 page 级 perm | `sys:dashboard:view` |
| 页面内有多个独立操作 | 按操作拆分 perm | `sys:tenant:add` / `sys:tenant:edit` / `sys:tenant:delete` |
| 个人信息页（登录即可访问） | 1 个 page 级 perm 或不建 perm | `sys:profile:view` 或标为「无需功能项 perm」 |

### 2. 豁免判断

- 接口走 `direct` 前缀且为 `no-auth` → 不建功能项 perm，不录入权限点 API 列表
- 接口多模块共用（如 `loginSetting`）→ 不建业务 perm，如需登记则放入 hidden page「状态管理」
- 仅路由跳转、纯前端状态操作 → 不建 perm

### 3. hidden page 收敛

以下场景使用 `is_visible: false` 的 hidden page：

- 全局状态类（`loginSetting` 等）→ `name: 状态管理`、`route_path: /Apex/_state`
- 非导航页（个人中心 page 节点）→ `name: 个人中心`、`route_path: /Apex/profile`
- 其他不需要在菜单中可见但需要登记 perm 的节点

### 4. 跨模块 API 归属

- 原则：perm 挂在**触发交互的页面**所在模块，不挂在 API 所属模块
- 示例：租户页调用 `devmgr/device/activate` → perm 为 `sys:tenant:bindDevice`，不建 `devmgr:device:activate`
- 若跨模块 API 已有独立模块的 perm，前端按钮改为同时校验两个 perm

### 5. perm 命名约定

- 格式：`<模块缩写>:<资源>:<操作>`
- 示例：`sys:tenant:query`、`sys:user:add`、`sys:securityConfig:edit`
- 查询用 `query`、新增用 `add`、编辑用 `edit`、删除用 `delete`、导入用 `import`、导出用 `export`

## 输出契约

- `designGoal`
- `analysisBasis`（引用盘点文档）
- `permGranularityDecisions`
- `exemptionList`（接口豁免清单）
- `hiddenPagePlan`
- `crossModuleAssignments`
- `permToApiMapping`（权限点 → API 映射表）
- `namingConventions`
- `pendingHumanDecisions`

## Guardrails

- 不允许在盘点文档缺失时直接设计权限点
- 不允许替用户决定权限粒度（页面级 vs 操作级），必须提问
- 不允许忽略 `direct/no-auth` 接口豁免
- 不允许把跨模块 API 的 perm 挂在 API 所属模块而非交互页面模块
- 权限点 → API 映射表必须注明每个 API 的契约来源

## REFACTOR

- 若跳过人工裁决直接自行决定权限粒度，收紧：「每个粒度决策点必须先提问再继续」
- 若豁免清单缺少源码证据，补「每个豁免项必须附带源码位置（文件:行号）」的要求
- 若 hidden page 方案只有名称无结构，补 route_path/is_visible/children 的完整字段要求
- 若设计输出被误当作最终产物（跳过了补丁和改码），补「下一步应进入哪个意图节点」的导航

## 使用示例

```text
已有盘点文档 apex_dev-route-component-perm-api.md，
帮我设计首页、租户管理、安全配置的新权限点。
```

```text
盘点结果显示租户页调用了 devmgr 和 dbres 的接口，
帮我决定这些跨模块 API 应该挂哪个 perm。
```

```text
loginSetting 走 direct/no-auth，帮我确认豁免并收敛到 hidden page。
```
