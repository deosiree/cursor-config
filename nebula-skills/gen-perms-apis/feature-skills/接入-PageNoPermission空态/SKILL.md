---
name: 接入-PageNoPermission空态
description: 在 targetRepo 新建 PageNoPermission 并改造业务页为兄弟分支空态。触发词：接入 PageNoPermission、暂无页面访问权限组件、页面无权限空态改码。
---

# 接入-PageNoPermission空态

## RED

- 没有本 skill 时，各页 inline `el-empty` + 重复 scss，视觉不一致
- 常见失败：
  - 组件内未显式 `import { useI18n } from 'vue-i18n'` → TS2304
  - 删除 `fetchData` 守卫，仅留 UI 分支
  - 弹窗（`SinglePaneDialog`）放进 `v-if` 分支内
  - 改动设备数据参考模块（用户未明确要求）
  - 用「暂无数据」代替无权限文案

## 输入契约

| 参数 | 必填 | 默认 |
|------|------|------|
| `targetRepo` | 否 | `apex_dev` |
| `改动文件清单` | 是 | — |
| 门控判定结果 / `pageGatePerm` | 是 | — |

门控 perm 未确认 → **停止改码**，先 `[[../判定-页面门控权限点]]` 或 `[[../../intention-skills/策略-页面权限空态]]`。

## GREEN — 执行步骤

### Step 1：确认组件存在

- 路径：`src/components/PageNoPermission/index.vue`
- 不存在 → 按 `[[../../template/sample-run/after-02-页面空态/PageNoPermission.vue]]` 新建
- 已存在 → 样式与快照 diff，不一致时以快照为准对齐

### Step 2：改造列表页（兄弟分支）

```vue
<el-card v-if="canQuery">...</el-card>
<PageNoPermission v-else />
<SinglePaneDialog ... />  <!-- 必须在 v-if 分支外 -->
```

对照：`[[../../template/sample-run/after-02-页面空态/tenant-index.template.vue]]`

### Step 3：改造看板页

```vue
<template v-if="canViewDashboard">...</template>
<PageNoPermission v-else />
```

对照：`[[../../template/sample-run/after-02-页面空态/dashboard-index.template.vue]]`

### Step 4：清理重复样式

- 删除 `.tenant-no-perm` 等页面级 scss
- **保留** `fetchData` / `loadData` 内 `if (!canGate) return`

### Step 5：输出验收清单

- `filesModified`、`diffSummary`、`verificationChecklist`（见下方）

### 组件要点（不可省略）

- `el-card` + 居中 `el-empty`，文案 `t('暂无页面访问权限')`
- 显式：`import { computed } from "vue"`、`import { useI18n } from "vue-i18n"`
- UI 参考（默认不改源码）：`[[../../template/sample-run/reference-02-设备数据UI参考/]]`

## 失败分支与兜底（if-then）

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| TS2304 `useI18n` | 组件内显式 import `vue-i18n` | 检查是否误依赖 auto-import |
| 空态无白卡片/不居中 | 对照 `PageNoPermission.vue` 与 reference-02 样式 | 禁止页面级 inline scss，改组件 |
| 无 perm 仍见表格头 | 确认 `el-card v-if` 与 `PageNoPermission v-else` 为**兄弟**分支 | 对照 before-02 AP-03 |
| 用户要求改设备数据模块 | 仅当用户**明确**负责该模块 | 否则只读 reference-02 |
| 门控 perm 未在设计方案 | 停止改码 | 链到 `策略-设计权限点` |

## 🔴 CHECKPOINT · 改码前必须确认

在编辑任何 `.vue` 前输出并等待确认（若用户禁止多轮确认，仍须输出清单但不阻塞）：

1. `pageGatePerm` 与 `canGateComputed` 已确定
2. `改动文件清单` 不含设备数据 / microfb（除非用户明确）
3. 将对照 `after-02` 快照而非凭记忆写模板

## 反例黑名单（禁止项）

| # | 不要做 | 原因 |
|---|--------|------|
| 1 | 改 microfb `404.vue` | 路由级错误页，非业务页空态 |
| 2 | 改设备数据模块（未授权） | 仅 UI 参考 |
| 3 | 空态嵌在列表同一 `el-card` | AP-03 |
| 4 | 删 `fetchData` 守卫 | UI/API 双保险缺一 |
| 5 | 第二页起再 inline `el-empty` | 必须复用 `PageNoPermission` |
| 6 | 用「暂无数据」文案 | 用户无法区分无权限 |

## 输出契约

- `filesModified`
- `diffSummary`（逐文件 1 句）
- `verificationChecklist`：
  - [ ] 无门控 perm →「暂无页面访问权限」+ 白卡片居中
  - [ ] 有门控 perm → 正常内容；缺操作 perm 仅藏按钮
  - [ ] `fetchData` 守卫仍在
  - [ ] 弹窗在分支外

## 参考

- few-shot 索引：`[[assets/few-shot-diff-tenant-dashboard.md]]`
- before：`[[../../template/sample-run/before-02-页面空态/]]`
- after：`[[../../template/sample-run/after-02-页面空态/]]`

## REFACTOR

- diff 与 `after-02` 不一致须在 `diffSummary` 说明原因
- 触顶信号：连续两轮仅改措辞无路由/结构变化 → 停止微调

## 使用示例

```text
按方案改 tenant/index.vue 和 dashboard，接入 PageNoPermission。
```

预期：5 步执行 + 验收清单；组件 import 完整；兄弟分支结构。
