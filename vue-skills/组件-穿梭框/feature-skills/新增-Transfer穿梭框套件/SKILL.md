---
name: 新增-Transfer穿梭框套件
description: 当仓库尚无 src/components/transfer 或缺少 vue3-virtual-scroll-list 时，从 template/mvp 落地全局 Transfer 穿梭框套件。
---

# 新增-Transfer穿梭框套件

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **全局 Transfer 组件与依赖**，不改业务页。

## 何时使用

- 无 `src/components/transfer/src/transfer.vue`
- 或缺少 `vue3-virtual-scroll-list` 依赖 / 类型声明

## 何时不要使用

- 组件已存在，仅需改业务页 → [`../更新-页面接入Transfer/SKILL.md`](../更新-页面接入Transfer/SKILL.md)

## RED：新增前核对

1. 目标路径是否为 `@/components/transfer`（与样本一致）
2. 是否误把 BindDeviceDialog / DeviceTab 改动与本步骤混在一起
3. **（可选）** i18n；**勿**借机做全量 i18n 迁移

## GREEN：落地步骤

### 1. 复制组件套件

从 [`template/mvp/src/components/transfer/`](../../template/mvp/src/components/transfer/) 对齐到目标仓库：

| 文件 | 职责 |
|------|------|
| `src/transfer.vue` | 穿梭框主壳、virtual-scroll 开关 |
| `src/transfer-panel.vue` | 左右面板 |
| `src/transfer.ts` | 类型与 props 定义 |
| `src/composables/*` | check / move / computed-data 等 |
| `index.ts` | `withInstall` 导出 |
| `README.md` | 组件 API 说明（建议同步） |

### 2. 同步依赖

| 依赖 | 样本 |
|------|------|
| `vue3-virtual-scroll-list` | [`template/mvp/package.json.fragment`](../../template/mvp/package.json.fragment) |
| `vue3-virtual-scroll-list.d.ts` | [`template/mvp/src/types/`](../../template/mvp/src/types/) |

```bash
pnpm add vue3-virtual-scroll-list@^0.2.1
```

### 3. 验证

- 组件可 `import customTransfer from '@/components/transfer/src/transfer.vue'`
- **不在此步骤改业务页**

### 4. 委派页面接入

组件就绪后进入 **更新** 子 skill。

## REFACTOR

| 场景 | 处理 |
|------|------|
| 数据量小、固定高度 Tab | 业务页可设 `:virtual-scroll="false"`（见 DeviceTab after） |
| 仍用 EP 原生 `el-transfer` | 本套件面向 virtual-scroll 定制版 |

## 验收清单

1. transfer 目录完整，含 composables 五件套
2. `vue3-virtual-scroll-list` 已安装且 d.ts 存在
3. linter 无新增错误
4. **未**改业务页（属更新子 skill）

## 使用示例

```text
仓库还没有 transfer 组件，请从 template/mvp 落地 Transfer 套件。
```

## 延伸阅读

- [`../../references/transfer-api.md`](../../references/transfer-api.md)
- [`../../references/virtual-scroll.md`](../../references/virtual-scroll.md)
- [`../../references/anti-patterns.md`](../../references/anti-patterns.md)
