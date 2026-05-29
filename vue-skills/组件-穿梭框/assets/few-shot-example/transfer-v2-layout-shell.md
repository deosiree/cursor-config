# Few-shot：DeviceTransfer 布局壳落地（GREEN-2）

真相源：**apex_dev** `a609804`（after）/ `a609804^` = `8a5daa3`（before）。

## 何时读

- 执行 [`新增-Transfer穿梭框套件`](../../feature-skills/新增-Transfer穿梭框套件/SKILL.md) **GREEN-2**
- 判定「有 v1、无 v2 壳」

## 文件对照

| 角色 | 路径 | commit |
|------|------|--------|
| v2 壳 | `src/components/transfer/src/transfer_v2/DeviceTransfer.vue` | `a609804` |
| 列配置 | `transfer_v2/device-transfer.ts` | `a609804` |
| API 说明 | `transfer_v2/README.md` | `a609804` |
| skill 模板 | [`template/v2-mvp/`](../../template/v2-mvp/) | 同上 |

## 壳职责摘要

- 包装 v1 `Transfer`，在 `#left-footer` / `#right-footer` / `#default` 内用 `columns` 渲染表头与行
- `buildEqualColumnGrid(columns.length)` → `grid-template-columns: repeat(N, minmax(0, 1fr))`
- 默认 `createDefaultFilterMethod(columns)`；业务可覆盖 `filter-method`
- 依赖 `SpanByTipsFill`；**不**引入 `TransferOverflowText.vue`

## 业务页（不在本步改）

三页迁移见 [`device-transfer-page-migration.md`](device-transfer-page-migration.md)，委派 [`更新-页面接入Transfer_v2`](../../feature-skills/更新-页面接入Transfer_v2/SKILL.md)。

## 本地核对命令

```bash
git -C apex_dev show a609804:src/components/transfer/src/transfer_v2/DeviceTransfer.vue
git -C apex_dev diff a609804^..a609804 -- src/components/transfer/src/transfer_v2/
```

## 布局细节

见 [`references/transfer-v2-layout.md`](../../references/transfer-v2-layout.md)。
