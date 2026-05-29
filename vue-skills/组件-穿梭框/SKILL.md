---
name: 组件-穿梭框
description: 当业务需双列表选型、大数据穿梭框、el-transfer/el-table 改 customTransfer，或 getBind 全量分页时使用；先判定新增套件或页面接入。
---

# 组件-穿梭框

双列表 **Transfer**：基于 Element Plus API 的 `customTransfer`，支持 **virtual-scroll**；gateway 侧用 `fetchAllDevicePages` 拉全量。

## 何时使用

- 绑定/解绑、关联资源等 **左右列表** 选型
- 数据量大（千级以上）需 **虚拟滚动**
- 要把 `el-transfer` / `el-table` 多选改为复用 `@/components/transfer`
- gateway 仍用 `pageSize: 999999` 或单次假全量

## 何时不要使用

- 纯表格操作列折叠 → [`组件-操作列折叠`](../组件-操作列折叠/SKILL.md)
- 全量 i18n 迁移 → `i18n-server`（本 skill **不**顺带改业务文案 i18n）
- 仅改 gateway 错误 toast、与穿梭框 UI 无关 → [`shownotification`](../../nebula-skills/shownotification/SKILL.md)

## RED：失败基线（先判定再改码）

1. 无 `src/components/transfer/src/transfer.vue`
2. 业务页仍用 `<el-transfer>` 或 `<el-table type="selection">` 做双列表
3. 大数据场景未开 `:virtual-scroll="true"`
4. gateway `getBind`/`getUnbind` 使用 `pageSize: 999999`
5. 标题硬编码 `(total)` 或面板头仍显示 `0/N`（缺 `:format` 空格占位 `noChecked/hasChecked: " "`，**勿**用 `''`）
6. 并行分页失败重复 toast（缺 `newConcurLock` / `concurApiErr`）
7. 无变更仍调 `deviceActivate`（见 BindDeviceDialog after HEAD）
8. 纵向滚动链断裂（外层无高度上限 / 列表未 `overflow-y: auto`）或单元格截断无 `:title`
9. `#default` 使用 `defineComponent` + 字符串 `template`（Vite 下插槽文案不渲染）
10. 面板样式仅写 `:deep(.el-transfer-panel)` 而未命中 `.el-panel`（布局挤偏、无纵滚）
11. `.el-panel` 为 flex 列时 **未给 `.el-panel__filter` 设 `order: 2`**（filter 默认 0，搜索框跑到全选标题上方）
12. 列表行间距只写在 `.full-height-transfer` 或未包在 `.transfer-container`，append-to-body 下规则 0 命中（改 CSS「无变化」）
13. 间距类改动未在 DevTools 验收 Computed 是否命中本页 scoped 规则即宣称完成

对照样本见 [`template/README.md`](template/README.md)。UI 回归案例（含第二波间距/order）见 [`assets/few-shot-example/project-device-config-regression.md`](assets/few-shot-example/project-device-config-regression.md)。

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新增** | 无 `transfer.vue` 或缺 `vue3-virtual-scroll-list` | [`feature-skills/新增-Transfer穿梭框套件/SKILL.md`](feature-skills/新增-Transfer穿梭框套件/SKILL.md) |
| **更新** | 组件已有；目标页仍 el-transfer / el-table 多选 / gateway 反模式 | [`feature-skills/更新-页面接入Transfer/SKILL.md`](feature-skills/更新-页面接入Transfer/SKILL.md) |
| **组合** | 新模块 / 新仓库 | **先新增 → 再更新** |

判定口诀：**没有 Transfer 先新增；有 Transfer 但页面或 gateway 未按 after 接线就更新。**

## 检查点（改码前暂停）

| 时机 | 触发条件 | 动作 |
|------|----------|------|
| **路由歧义** | 无法判断新增 vs 更新 | 问：是否已有 `transfer.vue`？页面是否仍为 el-table / el-transfer？ |
| **场景选型** | Dialog 大数据 vs Tab 小列表 | Dialog → `virtual-scroll=true`（租户）；Tab → 常 `false`（角色 DeviceTab） |
| **gateway** | 列表不全 / 接口超时 | 对照 [`references/gateway-full-fetch.md`](references/gateway-full-fetch.md) |
| **UI 四必选** | 数量/滚动/tooltip/CSS | 读 [`references/transfer-page-ui.md`](references/transfer-page-ui.md) §①–④ |
| **间距与 order** | 搜索框错位、checkbox 贴字、改 CSS 无效果 | 读 transfer-page-ui **§⑤** + regression 第二波 |
| **样式类名** | 面板布局/宽度不生效 | 读 [`references/dom-class-map.md`](references/dom-class-map.md)（面板根 `.el-panel`） |
| **DevTools 验收** | 样式已写但页面无变化 | 选中列表行 / `.el-panel__filter`，确认 Computed 命中 `.transfer-container` 下 `:deep` |
| **Tab 高度** | Tab 内面板高度不对 | 读 [`references/tab-embedded-layout.md`](references/tab-embedded-layout.md) |

**页面样本速查**：

| 形态 | few-shot | after | virtual-scroll |
|------|----------|-------|----------------|
| 租户绑定 Dialog | bind-device-gateway-replace | tenant/BindDeviceDialog | **true** |
| 角色设备 Tab | role-device-tab-replace | role/DeviceTab | **false** |
| 项目配置设备 Dialog | project-device-config-regression | [`template/after/.../ProjectDeviceConfigDialog`](template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) | **true** |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。验收：

1. `customTransfer` + 场景正确的 `virtual-scroll`
2. gateway 返回 `{ list, total }`，total 来自 `pagination.totalCount`
3. Dialog 关闭时 `clearQuery('left'|'right')`（BindDeviceDialog）
4. Tab 嵌入时 `defineExpose` / `initialDeviceIds` / `defaultSelectAll` 行为不变（DeviceTab）
5. 提交前 bind/unbind 非空才调接口（BindDeviceDialog after HEAD）
6. UI 四必选 + §⑤：无设备数量、纵向滚动、截断 tooltip、容器链；flex order 1/2/3/4；间距以 BindDevice 视觉为准
7. 改 scoped 样式后 DevTools 已验收（见 transfer-page-ui §⑤）
8. linter 无新增错误

## 使用示例

```text
使用 $组件-穿梭框 把角色编辑里的设备 Tab 从 el-table 多选改成 Transfer，对照 template/after/role/DeviceTab。
```

```text
租户绑定设备 gateway 还在用 999999 pageSize，请按 template/after gateway 样本改 fetchAllDevicePages。
```

## 延伸阅读

- 新增：[`feature-skills/新增-Transfer穿梭框套件/SKILL.md`](feature-skills/新增-Transfer穿梭框套件/SKILL.md)
- 更新：[`feature-skills/更新-页面接入Transfer/SKILL.md`](feature-skills/更新-页面接入Transfer/SKILL.md)
- [`references/transfer-api.md`](references/transfer-api.md)
- [`references/transfer-page-ui.md`](references/transfer-page-ui.md)
- [`references/dom-class-map.md`](references/dom-class-map.md)
- Few-shot：[`assets/few-shot-example/`](assets/few-shot-example/)
