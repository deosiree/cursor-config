---
name: 编排-页面无权限空态落地
description: 从反模式盘点到 PageNoPermission 接入的单专题编排。触发词：接入 PageNoPermission、页面无权限空态落地、暂无页面访问权限改造。
---

# 编排-页面无权限空态落地

## 路由决策（先读）

| 用户意图 | 进入 |
|---------|------|
| 门控 perm / 整页 vs 表格未决 | `[[../策略-页面权限空态]]` |
| 仅扫描哪些页有反模式 | `[[../../feature-skills/盘点-页面权限空态反模式]]` |
| 方案已确认，直接改码 | `[[../../feature-skills/接入-PageNoPermission空态]]` |
| E2E 验收 | `[[../编排-权限E2E测试]]` |

## RED

- 没有本节点时，agent 容易跳过反模式扫描直接改一个 `el-empty`
- 常见失败：
  - 未新建 `PageNoPermission` 却在各页复制 inline 样式
  - 改动设备数据等非负责模块（用户未明确要求）
  - 删除 `fetchData` 守卫，仅留 UI 分支
  - 弹窗误放进 `v-if` 分支内
  - 门控 perm 未定时直接改码

## GREEN — 编排步骤

### Step 1：收集输入

- `targetRepo`（默认 `apex_dev`）
- `关注路由`（必填）
- 现有盘点 / 反模式文档（可选）

### Step 2：按需扫描反模式

现状不清 → `[[../../feature-skills/盘点-页面权限空态反模式]]`  
已有 before-02 级证据 → 跳过扫描

### Step 3：门控策略（未定时）

`pageGatePerm` 未定 → `[[../策略-页面权限空态]]`  
已在设计方案 → `[[../../feature-skills/判定-页面门控权限点]]` 输出 computed 命名

### Step 4：落地改码

→ `[[../../feature-skills/接入-PageNoPermission空态]]`  
产出：`implementationPlan`（`[[../../template/page-no-permission-implementation.md]]`）、`filesToChange`

### Step 5：验收（可选）

→ `[[../编排-权限E2E测试]]` 或手工清单：

- [ ] 无 `pageGatePerm` 账号见「暂无页面访问权限」白卡片（非「暂无数据」）
- [ ] 有门控 perm 账号见正常内容
- [ ] 未改动设备数据 / microfb（除非用户明确）

**dim8 自检**：对照 `test-prompts.json` 三条 prompt 的 `expected` 字段，改码输出须全部满足。

## 失败分支与兜底

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 用户同时要改设备数据模块 | 确认是否为其负责模块 | 默认只读 reference-02 |
| 门控 perm 不在菜单树 | 先 `策略-设计权限点` + 菜单补丁 | 禁止无 perm 硬改 UI |
| 用户只要策略不要改码 | 停在 Step 3 | 不进入接入 feature |
| 与 `迁移-源码改动落地` 冲突 | 空态专题优先本编排 | 集中式 diff 作补充 |

## 🔴 CHECKPOINT · 进入 Step 4 前

必须已具备：

1. `pageGatePerm` + `canGateComputed`
2. `关注路由` 与 `改动文件清单`
3. 用户未禁止改动非负责模块（或已书面确认）

## 反例黑名单

- ❌ 跳过门控判定直接改模板
- ❌ 把本专题并入「迁移-源码改动落地」而不走接入 feature
- ❌ 无 `after-02` / `before-02` 对照凭记忆写代码
- ❌ 改 microfb 404 冒充业务页空态

## 输出契约

- `implementationPlan`
- `filesToChange`
- `verificationChecklist`
- `selectedFeatureSkills`（有序列表）

## 与既有节点关系

- 整页门控**优先本编排**，非直接 `[[../迁移-源码改动落地]]`（除非空态已就绪且用户仅要集中式 diff）
- UI 基准：`[[../../template/sample-run/reference-02-设备数据UI参考/]]`（只读）

## REFACTOR

- 多页 inline 复发 → 强制单组件 `PageNoPermission`
- 缺源码快照 → 补 before-02 / after-02

## 使用示例

```text
帮首页和租户管理接入 PageNoPermission，UI 参照设备数据，不要改设备数据模块。
```

预期：Step 1→4 序列 + implementationPlan + 路由到接入 feature。
