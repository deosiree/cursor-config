---
name: 新增-OperationColumn溢出套件
description: 当仓库尚无 OpItem/OperationCellOverflow/operationWidth，或 OperationColumn 仍为 v-auto-width 旧版时，从 template/mvp 落地全局操作列溢出套件。
---

# 新增-OperationColumn溢出套件

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **全局组件与配套依赖**，不改业务表格。

## 何时使用

- 无 `src/components/OperationColumn/OpItem.vue`
- 或 `index.vue` 仍含 `v-auto-width`、`operation-buttons`，或 `operationWidth.ts` 仍含 `reserveMoreSlot` / `OPERATION_COLUMN_WIDTH_KEY`（见 [`../../references/anti-patterns.md`](../../references/anti-patterns.md) §6）

## 何时不要使用

- 组件套件已齐，仅需改某个 `*Table.vue` → 用 [`../更新-页面接入OperationColumn/SKILL.md`](../更新-页面接入OperationColumn/SKILL.md)

## RED：新增前核对

1. 目标路径是否为 `@/components/OperationColumn`（与样本一致）
2. 是否已有 `checkHasPerm` 导出
3. **（可选）** [`optional-i18n.md`](../../references/optional-i18n.md)；**勿**借机做 i18n 迁移
4. 是否误把业务表改动与本步骤混在一起

## GREEN：落地步骤

### 1. 复制组件套件

从 [`template/mvp/src/components/OperationColumn/`](../../template/mvp/src/components/OperationColumn/) 对齐到目标仓库：

| 文件 | 职责 |
|------|------|
| `index.vue` | 列壳、`probeDomSlots`、`mkWidthCoord` |
| `OpItem.vue` | 声明式操作槽 + `perm` |
| `OpItemContent.vue` | 行内 / 下拉视觉 |
| `OperationCellOverflow.vue` | `calcOpStrip` 切分行内/「更多」 |
| `operationWidth.ts` | `pickProbeRows`、`tblProbeFp`、`calcOpStrip`、`maxFromSlots` |
| `README.md` | 槽位语义说明（建议同步） |
| `__tests__/operationWidth.test.ts` | 估宽单测（可选同步到目标仓库 tests 目录） |
| `__tests__/operationColumnDomProbe.test.ts` | 离屏探针单测（可选） |

落地后核对：

- `index.vue`：`TABLE_INJECTION_KEY` inject，**无** `PROBE_ROWS`、**无** `provide(OPERATION_COLUMN_WIDTH_KEY)`
- `OperationCellOverflow.vue`：**无** width inject，使用 `calcOpStrip`
- `operationWidth.ts`：含 `calcOpStrip`、`mkWidthCoord`

### 2. 同步配套依赖

| 依赖 | 必/可选 | 样本 |
|------|---------|------|
| `checkHasPerm` | **必**（有权限时） | `template/mvp/src/directive/permission/index.ts` |
| i18n「更多」 | **可选** | `optional-i18n.md` |

详见 [`operation-column-mvp.md`](../../assets/few-shot-example/operation-column-mvp.md)。

### 3. 验证

在目标仓库（或 apex_dev）：

```bash
npm run test:unit -- src/components/OperationColumn/__tests__/operationWidth.test.ts
```

- `listDataLength` 必填；业务**不传** `probe-data-rows`
- 不在此步骤改 `*Table.vue`

### 4. 委派页面接入

组件就绪后进入 **更新** 子 skill。

## REFACTOR

| 场景 | 处理 |
|------|------|
| 仅需固定列宽、无「更多」 | 本套件面向溢出 + 槽位语义 |
| 权限体系不同 | 适配 `checkHasPerm` / `OpItem` |
| 多语言未接 vue-i18n | 不复制 locale |

## 验收清单

1. 五件套 + `calcOpStrip` 单一路径
2. `checkHasPerm` 可用（有权限体系时）
3. **（可选）** vue-i18n「更多」词条
4. linter 无新增错误
5. **未**改业务表（属更新子 skill）

## 使用示例

```text
仓库还没有 OpItem，请从 template/mvp 落地 OperationColumn 套件（含 calcOpStrip）。
```

## 延伸阅读

- [`../../references/slot-semantics.md`](../../references/slot-semantics.md)
- [`../../references/column-width-probe.md`](../../references/column-width-probe.md)
- [`../../template/README.md`](../../template/README.md)
