---
name: 新增-Transfer穿梭框套件
description: 当仓库尚无 transfer 或缺 v2 壳时，从 template/mvp 落地 v1 customTransfer，并从 template/v2-mvp 落地 DeviceTransfer 多列布局壳；不改业务页与 gateway。
---

# 新增-Transfer穿梭框套件

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点负责 **全局 Transfer v1 + v2 布局壳**，不改业务页、不改 gateway。

## 何时使用

| 阶段 | 判定 |
|------|------|
| **GREEN-1** | 无 `src/components/transfer/src/transfer.vue` 或缺 `vue3-virtual-scroll-list` |
| **GREEN-2** | v1 已有，**无** `transfer_v2/DeviceTransfer.vue`；或多列设备页重复 slot grid + 页内大段 `:deep(.el-panel)` |

## 何时不要使用

- 套件已齐，仅改某一业务页 → 默认 [`../更新-页面接入Transfer_v2/SKILL.md`](../更新-页面接入Transfer_v2/SKILL.md)；人类指定 v1 → [`../更新-页面接入Transfer/SKILL.md`](../更新-页面接入Transfer/SKILL.md)

## RED：新增前核对

1. 目标路径是否为 `@/components/transfer`（与样本一致）
2. 是否误把 BindDeviceDialog / DeviceTab 改动与本步骤混在一起（应分步）
3. v1 未就绪就拷 v2（须先 GREEN-1）
4. **（可选）** i18n；**勿**借机做全量 i18n 迁移

---

## GREEN-1：v1 基础套件

从 [`template/mvp/src/components/transfer/`](../../template/mvp/src/components/transfer/) 对齐到目标仓库：

| 文件 | 职责 |
|------|------|
| `src/transfer.vue` | 穿梭框主壳、virtual-scroll 开关 |
| `src/transfer-panel.vue` | 左右面板 |
| `src/transfer.ts` | 类型与 props 定义 |
| `src/composables/*` | check / move / computed-data 等 |
| `index.ts` | `withInstall` 导出 |
| `README.md` | 组件 API 说明（建议同步） |

### 依赖

| 依赖 | 样本 |
|------|------|
| `vue3-virtual-scroll-list` | [`template/mvp/package.json.fragment`](../../template/mvp/package.json.fragment) |
| `vue3-virtual-scroll-list.d.ts` | [`template/mvp/src/types/`](../../template/mvp/src/types/) |

```bash
pnpm add vue3-virtual-scroll-list@^0.2.1
```

### 验证（GREEN-1）

- 可 `import customTransfer from '@/components/transfer/src/transfer.vue'`
- **不在此步骤改业务页**

---

## GREEN-2：DeviceTransfer 布局壳（v2）

**定位（更新型）**：v1 Transfer 已存在；落地 **DeviceTransfer 布局壳**（非从零写 v1）。不改业务 gateway。

真相源 commit **`a609804`**，从 [`template/v2-mvp/`](../../template/v2-mvp/) 对齐：

| 文件 | 职责 |
|------|------|
| `transfer_v2/DeviceTransfer.vue` | 外壳、`columns` 内渲染表头/行、flex 布局、checkbox 行 |
| `transfer_v2/device-transfer.ts` | `DeviceTransferColumn`、`buildEqualColumnGrid`、`createDefaultFilterMethod` |
| `transfer_v2/README.md` | Props、与 v1 差异 |
| v1 `transfer/README.md` 文末 | 增 v2 指引一句（若目标仓尚无） |

### 依赖

- GREEN-1 已完成
- 项目已有 `@/components/SpanByTips/SpanByTipsFill`（或等价路径）
- **不**恢复 `TransferOverflowText.vue`

### 布局要点

详见 [`../../references/transfer-v2-layout.md`](../../references/transfer-v2-layout.md)：

- Panel `flex: 1 1 0; min-width: 0`；按钮 `flex: 0 0 auto`
- grid `repeat(N, minmax(0, 1fr))`；cell `min-width: 0`
- checkbox `static` + label `padding-left: 14px`；表头 `--device-transfer-checkbox-gutter: 36px`
- **不做** Panel 横滚 / `table-viewport` / 行级 `overflow-x`

### 验证（GREEN-2）

- 可 `import DeviceTransfer from '@/components/transfer/src/transfer_v2/DeviceTransfer.vue'`
- linter 无新增错误
- **仍未**改三处业务页 → 委派 [`更新-页面接入Transfer_v2`](../更新-页面接入Transfer_v2/SKILL.md)

---

## REFACTOR

| 场景 | 处理 |
|------|------|
| 数据量小、固定高度 Tab | 业务页可设 `:virtual-scroll="false"`（见 v2-after DeviceTab） |
| 仍用 EP 原生 `el-transfer` | 本套件面向 virtual-scroll 定制版 |
| 布局强定制、不适用 v2 壳 | 页面走 v1 [`更新-页面接入Transfer`](../更新-页面接入Transfer/SKILL.md) |

## 验收清单

1. transfer v1 目录完整，含 composables 五件套
2. `vue3-virtual-scroll-list` 已安装且 d.ts 存在
3. `transfer_v2/` 三文件齐全，与 `template/v2-mvp` 一致
4. v1 README 已指向 v2（若需要）
5. linter 无新增错误
6. **未**改业务页（属 v2 更新子 skill）

## 使用示例

```text
仓库还没有 transfer 组件，请从 template/mvp 落地 Transfer 套件，再拷 template/v2-mvp 的 DeviceTransfer。
```

```text
transfer.vue 有了但没有 transfer_v2，请 GREEN-2 落地布局壳，不要改 BindDeviceDialog。
```

## 延伸阅读

- [`../../references/transfer-api.md`](../../references/transfer-api.md)
- [`../../references/virtual-scroll.md`](../../references/virtual-scroll.md)
- [`../../references/transfer-v2-layout.md`](../../references/transfer-v2-layout.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
- [`../../assets/few-shot-example/transfer-v2-layout-shell.md`](../../assets/few-shot-example/transfer-v2-layout-shell.md)
