---
name: 新增-组件列设置
description: 当仓库尚无 ColumnFilter 组件时，从 template/mvp 落地全局列设置组件，并参照 snapshot 理解页面侧最小闭环。
---

# 新增-组件列设置

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点只负责 **ColumnFilter 全局组件**，不改业务表格。

## 何时使用

- 无 `src/components/ColumnFilter/ColumnFilter.vue`
- 新仓库 / 新模块从零接入列设置能力

## 何时不要使用

- 组件已存在，仅需改某个 `*Table.vue` → [`../应用-列设置/SKILL.md`](../应用-列设置/SKILL.md)

## RED：新增前核对

1. 目标路径是否为 `@/components/ColumnFilter`（与样本一致）
2. 项目是否已有 vue-i18n（组件内 `$t("列设置")` 等）
3. **勿**在本步骤顺带改业务表或做全量 i18n 迁移

## 🔴 CHECKPOINT · 🛑 STOP

| 触发条件 | 必须动作 |
|----------|----------|
| 目标仓库已有 `ColumnFilter.vue` | **停止新增**，改走 [`应用-列设置`](../应用-列设置/SKILL.md) |
| 无 vue-i18n 且用户未确认文案策略 | 问：硬编码中文 interim 还是暂缓接入？ |

## GREEN：落地步骤

### 1. 复制组件

从 [`template/mvp/src/components/ColumnFilter/ColumnFilter.vue`](../../template/mvp/src/components/ColumnFilter/ColumnFilter.vue) 对齐到目标仓库。

来源 commit：`a5b3214`。

| 职责 | 说明 |
|------|------|
| popover 勾选 | `el-checkbox-group` 绑定 `selectedColumns` |
| 重置 | 恢复 `required \|\| visible !== false` 的列 |
| `required` 列 | checkbox `disabled` |

### 2. 核对 i18n 词条

目标仓库 `zh_CN.json` / `en_US.json` 须含：

- `列设置`
- `显示/隐藏列`
- `重置`

可对照 [`template/mvp/src/i18n/locales/*.column-filter.fragment.json`](../../template/mvp/src/i18n/locales/) 合并到项目 locale。

业务列名在页面 `buildTableColumns` 内单独 `t()`，不在此步骤批量添加。

### 3. 组件注册

确认 `unplugin-vue-components` 自动注册或页面显式 import 路径与项目一致。

### 4. 理解页面闭环（snapshot）

阅读 [`template/snapshot/`](../../template/snapshot/src/views/deviceManage/device/)：

- `column-settings-toolbar.fragment.vue` — 工具栏接入
- `column-settings-script.fragment.ts` — 列状态 + localStorage

**不在此步骤修改业务页**；完成后委派 **应用-列设置**。

### 5. 验证

- 临时挂载 `ColumnFilter` + 假 `tableColumns`：popover 可开、可勾选、可重置
- `required` 列不可取消

## 失败 fallback

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 复制后页面报 `ColumnFilter` 未解析 | 检查 unplugin-vue-components 或补 `import ColumnFilter from "@/components/ColumnFilter/ColumnFilter.vue"` | 对照 apex 自动注册配置 |
| popover 文案 key 缺失 | 补 locale：`列设置`、`显示/隐藏列`、`重置` | 临时硬编码中文并标注 TODO |
| 用户要求同时改某列表页 | **拒绝在本步改表** | 完成组件验证后委派 **应用-列设置** |

## REFACTOR

| 场景 | 处理 |
|------|------|
| 无 vue-i18n | 暂用硬编码中文或项目既有 i18n 方案，勿借机全量迁移 |
| 权限体系不同 | 应用阶段再包 `v-hasPerm` / `v-if` |

## 验收

- [ ] `ColumnFilter.vue` 存在于 `src/components/ColumnFilter/`
- [ ] i18n 三条组件文案就绪
- [ ] 未改动目标业务 `*Table.vue`
- [ ] 已提示进入 **应用-列设置**

## 延伸阅读

- MVP 样本：[`template/mvp/`](../../template/mvp/)
- Snapshot：[`template/snapshot/`](../../template/snapshot/)
- Few-shot：[`column-filter-mvp.md`](../../assets/few-shot-example/column-filter-mvp.md)
