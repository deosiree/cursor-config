---
name: 新增-OperationColumn溢出套件
description: 当仓库尚无 OpItem/OperationCellOverflow/operationWidth，或 OperationColumn 仍为 v-auto-width 旧版时，从 template/mvp 落地全局操作列溢出套件。
---

# 新增-OperationColumn溢出套件

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **全局组件与配套依赖**，不改业务表格。

## 何时使用

- 无 `src/components/OperationColumn/OpItem.vue`
- 或 `index.vue` 仍含 `v-auto-width`、`operation-buttons`（见 [`../../references/anti-patterns.md`](../../references/anti-patterns.md) §6）

## 何时不要使用

- 组件套件已齐，仅需改某个 `*Table.vue` → 用 [`../更新-页面接入OperationColumn/SKILL.md`](../更新-页面接入OperationColumn/SKILL.md)

## RED：新增前核对

1. 目标仓库路径约定是否为 `@/components/OperationColumn`（与样本一致）
2. 是否已有 `checkHasPerm` 导出（`directive/permission/index.ts`）
3. **（可选）** 按 [`../../references/optional-i18n.md`](../../references/optional-i18n.md) 检查「更多」词条；**勿**借机做 i18n 迁移
4. 是否误把业务表改动与本步骤混在一起（应分两步：先本 skill，再更新 skill）

## GREEN：落地步骤

### 1. 复制组件套件

从 [`template/mvp/src/components/OperationColumn/`](../../template/mvp/src/components/OperationColumn/) 对齐到目标仓库：

| 文件 | 职责 |
|------|------|
| `index.vue` | 列壳、inject 离屏探针、列宽协调器 provide |
| `OpItem.vue` | 声明式操作槽 + `perm` |
| `OpItemContent.vue` | 行内 / 下拉共用视觉 |
| `OperationCellOverflow.vue` | 行内 N 个 + 「更多」下拉 |
| `operationWidth.ts` | 代表行选取、估宽公式、协调器 |
| `README.md` | 组件内说明（可选同步） |

落地后核对 `index.vue`：含 `TABLE_INJECTION_KEY` inject，**无** `PROBE_ROWS`。

### 2. 同步配套依赖

| 依赖 | 必/可选 | 样本路径 | 说明 |
|------|---------|----------|------|
| `checkHasPerm` | **必**（有权限体系时） | `template/mvp/src/directive/permission/index.ts` | `OpItem` 与 `v-hasPerm` 共用 |
| i18n「更多」 | **可选** | `template/mvp/src/i18n/locales/*.json` | 见 [`optional-i18n.md`](../../references/optional-i18n.md) |

详见 [`../../assets/few-shot-example/operation-column-mvp.md`](../../assets/few-shot-example/operation-column-mvp.md)。

### 3. 验证组件可编译

- `listDataLength` 必填，绑定表格 `data.length`（业务**不传** `probe-data-rows`）
- 不在此步骤修改任何 `*Table.vue`

### 4. 委派页面接入

组件就绪后，由父 agent 或人工进入 **更新** 子 skill 替换各表操作列。

## REFACTOR

| 场景 | 处理 |
|------|------|
| 仅需固定列宽、无「更多」 | 可暂保留旧 slot 模式；本套件面向溢出场景 |
| 权限体系不同 | 保持 `checkHasPerm` 签名，或适配 `OpItem` 可见性逻辑 |
| 多语言未接 vue-i18n | **不**复制 locale；不启动 i18n 迁移 |

## 验收清单

1. 存在五件套；`index.vue` 为 inject 探针实现
2. `checkHasPerm` 可被 `OpItem` import（项目有权限体系时）
3. **（可选）** 若项目已用 vue-i18n：locale 有「更多」或已按 optional-i18n 处理
4. 构建 / linter 对 `OperationColumn` 目录无新增错误
5. **未**顺带修改业务表文案/i18n 结构
6. **尚未**要求业务表已替换（属更新子 skill）

## 使用示例

```text
仓库还没有 OpItem，请从 template/mvp 落地 OperationColumn 套件。
```

## 延伸阅读

- [`../../references/column-width-probe.md`](../../references/column-width-probe.md)
- [`../../references/op-item-api.md`](../../references/op-item-api.md)
- [`../../template/README.md`](../../template/README.md)
