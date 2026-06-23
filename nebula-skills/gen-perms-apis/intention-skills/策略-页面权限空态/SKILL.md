---
name: 策略-页面权限空态
description: 裁决页面门控 perm、整页空态 vs 表格空数据、view/query 门控类型。触发词：页面无权限空态、整页门控、暂无数据还是无权限。
---

# 策略-页面权限空态

## RED

- 没有本节点时，agent 容易用 `fetchData` 清空数据 + 表格「暂无数据」冒充无权限
- 常见失败：
  - 缺 `query` 仍渲染完整列表骨架
  - 把缺 `add` 误判为整页空态（应只藏按钮）
  - 把子应用业务空态做成 microfb 404 路由页
  - 空态嵌在列表 `el-card` 内
  - 门控 perm 未在权限设计方案中登记

## GREEN — 裁决步骤

### Step 1：识别页面类型

| 页面类型 | 典型路由 | `gateType` |
|----------|----------|------------|
| 看板 / KPI | `/Apex/dashboard` | `view` |
| 列表页 | `/Apex/tenant` 等 | `query` |

### Step 2：输出门控策略

| 页面类型 | 门控 perm 示例 | 无门控时 UI | 有门控缺操作 perm |
|----------|----------------|-------------|-------------------|
| 看板 | `sys:dashboard:view` | 整页 `PageNoPermission` | `v-hasPerm` 藏按钮 |
| 列表 | `sys:tenant:query` | 整页 `PageNoPermission` | `v-hasPerm` 藏按钮 |

### Step 3：填输出模板

使用 `[[../../template/page-gate-strategy-output.md]]`，必填：

- `pageGatePerm`、`gateType`、`canGateComputed`、`emptyStateScope`（默认整页）
- `operationPermStrategy`
- `humanQuestions`（若有）

### Step 4：本节点结束

**不执行改码**。改码 → `[[../编排-页面无权限空态落地]]`。

## 失败分支与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 用户问「空表格行不行」 | 明确 AP-01：禁止，须整页空态 | 出示 before-02 用户诉求 |
| 缺 add 是否整页空态 | 否，仅藏按钮 | 出示决策表「有门控+缺操作」行 |
| 门控 perm 未在设计方案 | 标「待补设计」 | 链到 `[[../策略-设计权限点]]` |
| 与 microfb 404 混淆 | 读 pattern 文档三类对比 | 禁止改 404 |

## 🔴 CHECKPOINT · 产品裁决

以下须用户确认（默认已给建议值）：

1. 列表页缺 query 是否仍显示「新增」？→ **默认否**（整页空态）
2. 门控 perm 是否需新增到菜单树？

## 反例黑名单

- ❌ 推荐表格「暂无数据」代替无权限
- ❌ 把 `sys:tenant:add` 缺失当作整页空态理由
- ❌ 建议把 PageNoPermission 放 microfb
- ❌ 未登记 pageGate 直接改码

## 输入契约

- `关注路由` 或 `关注模块`：必填至少一项
- `盘点/反模式文档`：可选（`[[../../feature-skills/盘点-页面权限空态反模式]]`）
- `权限设计方案`：可选

## 参考

- `[[../../references/page-no-permission-pattern.md]]`
- `[[../../template/sample-run/before-02-页面空态/]]`
- `[[../../template/sample-run/after-02-页面空态/]]`

## REFACTOR

- agent 仍推荐表格空态 → 强制对照 AP-01
- 门控 perm 缺失 → 不得进入接入 feature

## 使用示例

```text
租户无 sys:tenant:query 时应整页空态还是只显示空表格？
```

预期：`pageGatePerm=sys:tenant:query` + 整页空态 + 不改码。
