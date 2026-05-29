---
name: 组件-穿梭框
description: 当业务需双列表选型、大数据穿梭框、el-transfer/el-table 改 Transfer/DeviceTransfer，或全量分页 gateway 时使用；nebula 设备页与域外双列表均适用；先判定新增套件或页面接入（默认 v2 更新）。触发：穿梭框、Transfer、DeviceTransfer、virtual-scroll、fetchAllPages。
---

# 组件-穿梭框

双列表 **Transfer**：v1 `customTransfer`（virtual-scroll）+ v2 **`DeviceTransfer`** 多列布局壳；gateway 侧用 `fetchAllDevicePages` 拉全量。

## 何时使用

- 绑定/解绑、关联资源等 **左右列表** 选型
- 数据量大（千级以上）需 **虚拟滚动**
- 要把 `el-transfer` / `el-table` 多选改为复用 `@/components/transfer`
- gateway 仍用 `pageSize: 999999` 或单次假全量
- 多列设备 Dialog/Tab（BindDevice、ProjectDeviceConfig、DeviceTab）

## 何时不要使用

- 纯表格操作列折叠 → [`组件-操作列折叠`](../组件-操作列折叠/SKILL.md)
- 全量 i18n 迁移 → `i18n-server`（本 skill **不**顺带改业务文案 i18n）
- 仅改 gateway 错误 toast、与穿梭框 UI 无关 → [`shownotification`](../../nebula-skills/shownotification/SKILL.md)

## RED：失败基线（先判定再改码）

1. 无 `src/components/transfer/src/transfer.vue`
2. 无 `transfer_v2/DeviceTransfer.vue` 却要在多列设备页页内抄大段布局（应走新增 GREEN-2 + v2 更新）
3. 业务页仍用 `<el-transfer>` 或 `<el-table type="selection">` 做双列表
4. 大数据场景未开 `:virtual-scroll="true"`（Dialog）
5. gateway `getBind`/`getUnbind` 使用 `pageSize: 999999`
6. 标题硬编码 `(total)` 或面板头仍显示 `0/N`（缺 `:format` 空格占位）
7. 并行分页失败重复 toast（缺 `newConcurLock` / `concurApiErr`）
8. 无变更仍调 `deviceActivate`
9. 纵向滚动链断裂或单元格截断无 tooltip（v1 页内路径）
10. `#default` 使用 `defineComponent` + 字符串 `template`
11. v1 路径：面板样式未命中 `.el-panel`；filter 无 `order: 2`（见 transfer-page-ui §⑤）
12. v2 路径：页内仍 `:deep(.el-panel)` 与壳重复；误恢复横滚 / `max-content`（见 transfer-v2-layout）
13. 人类已指定 v1，agent 仍改 `DeviceTransfer`
14. 三处设备页仍页内大段穿梭 CSS，已有 v2 壳却未走 **Transfer_v2** 更新 skill

对照样本见 [`template/README.md`](template/README.md)。

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新增** | 无 `transfer.vue` / 缺依赖；或 **有 v1 无 `transfer_v2/DeviceTransfer.vue`** | [`feature-skills/新增-Transfer穿梭框套件/SKILL.md`](feature-skills/新增-Transfer穿梭框套件/SKILL.md)（GREEN-1 → GREEN-2） |
| **更新（默认）** | 套件齐；业务页接穿梭框 / 仍 v1 页内写法 / 多列设备 Dialog·Tab | [`feature-skills/更新-页面接入Transfer_v2/SKILL.md`](feature-skills/更新-页面接入Transfer_v2/SKILL.md) |
| **更新（v1，非默认）** | 人类明确要求 **Transfer v1 / customTransfer**；或 v2 布局壳明显不适用 | [`feature-skills/更新-页面接入Transfer/SKILL.md`](feature-skills/更新-页面接入Transfer/SKILL.md) |
| **组合** | 新模块 / 新仓库 | **先新增（G1→G2）→ 再 v2 更新** |

判定口诀：**没有 transfer 或没有 v2 壳 → 新增；要改页面 → 默认 v2 接入；只有人说用 Transfer v1 或布局用不了 v2 → v1 接入。**

## 检查点（改码前暂停）

| 时机 | 触发条件 | 动作 |
|------|----------|------|
| **路由歧义** | 无法判断新增 vs 更新 | 问：是否已有 `transfer.vue` 与 `DeviceTransfer.vue`？ |
| **v1 / v2 歧义** | 未说明用哪条更新路径 | **默认 v2**；用户说「用 Transfer」「不用 DeviceTransfer」→ v1 |
| **布局评估** | 非标准多列 / 强定制面板 | 建议人类确认是否 v1 |
| **场景选型** | Dialog 大数据 vs Tab 小列表 | Dialog → `virtual-scroll=true`；Tab → 常 `false` |
| **gateway** | 列表不全 / 接口超时 | [`references/gateway-full-fetch.md`](references/gateway-full-fetch.md) |
| **v2 布局** | 横滚 / 列宽 / checkbox 重叠 | [`references/transfer-v2-layout.md`](references/transfer-v2-layout.md) |
| **v1 UI** | 数量/滚动/tooltip/页内 CSS | [`references/transfer-page-ui.md`](references/transfer-page-ui.md) |

**页面样本速查**：

| 形态 | 默认路径 | 模板 | virtual-scroll |
|------|----------|------|----------------|
| 租户绑定 Dialog | **v2** | `template/v2-after/.../BindDeviceDialog`（`a609804`） | **true** |
| 项目配置设备 Dialog | **v2** | `template/v2-after/.../ProjectDeviceConfigDialog` | **true** |
| 角色设备 Tab | **v2** | `template/v2-after/.../DeviceTab` | **false** |
| gateway 全量拉取 | v1 after 样本 | `template/after/.../device.gateway`（`cdb58504`） | — |
| v1 页内布局（人类指定） | v1 更新 | `template/before|after` | 按样本 |

## 域外对照（非 nebula / 非设备域）

流程不变（口诀同上）；**勿硬抄**设备三页与 `DeviceGateway`。对照下表替换后，仍默认 **更新-页面接入Transfer_v2**（多列）：

| nebula 概念 | 域外替换 |
|-------------|----------|
| `DeviceGateway.getBind` / `getUnbind` | 目标域 `XxxGateway.fetchAllPages`（或等价全量 list API） |
| `deviceColumns`（名称/编码/描述等） | 按业务字段定义 `DeviceTransferColumn[]` 的 `label` + `getValue` |
| `template/v2-after/.../BindDeviceDialog.vue` | 只借 **结构**：`DeviceTransfer` + `host-height` / `virtual-scroll`；勿抄路径与文案 |
| `buildTransferData` 的 `device` 挂载 | `{ key, label, entity }` 映射为目标实体类型 |
| `deviceActivate` | 目标域 bind/unbind（或授权）接口；**非空才调** |
| `fetchAllDevicePages` + `PAGE_SIZE_MAX` | [`references/gateway-full-fetch.md`](references/gateway-full-fetch.md) 通则 |

五步清单见 [`README.md`](README.md) §域外仓库迁移。叙事 few-shot：[`assets/few-shot-example/cross-domain-transfer-migration.md`](assets/few-shot-example/cross-domain-transfer-migration.md)。

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。验收：

1. 默认 `DeviceTransfer` + `columns`；v1 路径则 `customTransfer` + 场景正确的 `virtual-scroll`
2. gateway 返回 `{ list, total }`，无 999999
3. Dialog 关闭时 `clearQuery`（BindDevice）
4. Tab `defineExpose` / 回显行为不变
5. bind/unbind 非空才调 `deviceActivate`
6. v2：无页内重复壳样式；无废弃横滚模式
7. linter 无新增错误

## 使用示例

```text
使用 $组件-穿梭框：transfer_v2 已有，把 BindDeviceDialog 收成 DeviceTransfer，对照 template/v2-after。
```

```text
用户明确要用 customTransfer 页内布局，不用 DeviceTransfer，对照 template/before|after v1。
```

## 延伸阅读

- 新增：[`feature-skills/新增-Transfer穿梭框套件/SKILL.md`](feature-skills/新增-Transfer穿梭框套件/SKILL.md)
- 更新（默认）：[`feature-skills/更新-页面接入Transfer_v2/SKILL.md`](feature-skills/更新-页面接入Transfer_v2/SKILL.md)
- 更新（v1）：[`feature-skills/更新-页面接入Transfer/SKILL.md`](feature-skills/更新-页面接入Transfer/SKILL.md)
- [`references/transfer-api.md`](references/transfer-api.md)
- [`references/transfer-v2-layout.md`](references/transfer-v2-layout.md)
- [`references/transfer-page-ui.md`](references/transfer-page-ui.md)
- Few-shot：[`assets/few-shot-example/`](assets/few-shot-example/)（域外：[`cross-domain-transfer-migration.md`](assets/few-shot-example/cross-domain-transfer-migration.md)）
