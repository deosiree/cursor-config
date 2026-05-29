# 项目配置设备 Dialog：UI 优化回归（反向示例）

## 场景

租户创建流程 [`TenantProjectSelectStep`](../../../../apex_dev/src/views/tenant/components/TenantProjectSelectStep.vue) 打开 [`ProjectDeviceConfigDialog`](../../template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue)：设备列表由父组件 `devices` prop 注入，**无 gateway**、无 `deviceActivate`。

典型需求：标题不显示设备数量、列表可**纵向**滚动、列宽 100% 放不下用省略号 + tooltip、**不要**横向滚动条。

## RED：湿跑失败症状（真实案例）

| 症状 | 用户描述 |
|------|----------|
| 设备「全丢」 | 左侧一列空 checkbox，无设备名称/描述/机器码 |
| 布局左挤 | 未绑定 + 按钮 + 已绑定挤在 Dialog 左半边，右侧大片空白 |
| 纵滚不可测 | 无数据或布局异常，无法验证滚动条 |

## RED：根因（勿重复）

| 错误做法 | 技术原因 |
|----------|----------|
| `script setup` 内 `defineComponent({ template: \`...\` })` 作 `#default` 子组件 | Vite 默认无运行时模板编译，虚拟列表插槽 VNode 无有效子树 → **有 checkbox 无文案** |
| `.full-height-transfer :deep(.el-transfer-panel)` 写 flex/高度，且无 `.el-panel` 宽度 | 面板根 DOM 为 **`.el-panel`**（见 `transfer-panel.vue`），选择器不命中 → **宽度规则未生效** |
| 把「缺滚动条」做成 `overflow-x: auto`、固定列 `min-width` | 产品要横向 100% + 省略号；缺的是 **纵向** 高度链 |

详见 [`references/dom-class-map.md`](../../references/dom-class-map.md)、[`references/anti-patterns.md`](../../references/anti-patterns.md)。

## 第二波 RED：间距 / order /「改了 CSS 没变化」（真实案例续）

| 症状 | 用户描述 |
|------|----------|
| 搜索框在标题上 | 全选行下面应是搜索，实际搜索跑到最顶 |
| 改间距无效 | agent 多轮改 padding/margin，页面「几乎没变化」 |
| 列头过高纵滚 | footer 固定高度 + body 魔法 `calc` 导致表头区异常 |

| 错误做法 | 技术原因 |
|----------|----------|
| 未给 `.el-panel__filter` 设 `order: 2` | flex 子项 filter 默认 `order:0`，排在 `header`(1) 前 |
| 列表行间距写在 `.full-height-transfer` 且无 `.transfer-container` | append-to-body + 选择器未穿透到行节点 → **0 命中** |
| 指望 EP `.el-transfer-panel__item` 全局规则 | 选择器祖先为 `.el-transfer-panel`，面板根已是 **`.el-panel`** |
| `filter { padding: 15px }` 照抄 EP | Dialog 78% 宽 + grid 三列下只需 **`padding-bottom: 15px`** 拉开竖向呼吸 |
| `header { padding-left: 15px }` 照抄 | 与全选左缘叠加，视觉偏空；成品常**注释掉** left padding |

## GREEN：修复要点

### 数据与标题（无 gateway）

- `transferTitles` 纯文案，禁止 `` `${t('未绑定')} (${n})` ``
- `transferFormat = { noChecked: " ", hasChecked: " " }`（空串 `''` 仍会显示 `0/N`）

### 文案 / tooltip

- **禁止** `defineComponent` + 字符串 `template`
- MVP：各列 `transfer-item__desc` + `:title` + ellipsis（BindDeviceDialog 同款）
- 升级 `el-tooltip`：独立 SFC，如 [`TransferOverflowText.vue`](../../template/after/src/views/tenant/components/TransferOverflowText.vue)；或仓库内 `SpanByTipsFill`

### CSS（fork BindDeviceDialog 的 `.transfer-container` 块）

- `.transfer-container { height: 500px }`（建议容器加 `id="projectDeviceConfig"` 便于 DevTools 定位）
- `.transfer-container :deep(.el-panel) { width: 45% !important; min-width: 350px }`
- `.full-height-transfer :deep(.el-panel)` 写 flex 列；**order**：header `1`、filter `2`、footer `3`、body `4`
- footer：`height: auto !important; overflow-y: hidden`（避免列头区撑出纵滚）
- 列表：`.el-transfer-panel__list` + 子节点 `overflow-y: auto`；body `flex:1; min-height:0`
- **行间距**写在 `.transfer-container :deep(.el-transfer-panel__item.el-checkbox)`（absolute input + `label padding-left:22px`）
- `el-dialog__body` 勿叠加大 `min-height`；用 `min-height: 0` + `overflow: hidden`
- **禁止** 列表/行 `overflow-x: auto` 作「看不全」的解法

### 间距 human-verified（成品片段）

见 after [`ProjectDeviceConfigDialog.vue`](../../template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) `.transfer-container`（与 apex HEAD 同步）：

- `el-panel__header`：`padding-bottom: 10px`；`padding-left: 15px` **注释掉**
- `el-panel__filter`：仅 `padding-bottom: 15px` + `box-sizing: border-box`
- 改完后 **DevTools** 确认 Computed 命中本文件 scoped 规则（见 [transfer-page-ui.md §⑤](../../references/transfer-page-ui.md)）

### virtual-scroll

- Dialog 大数据：`:virtual-scroll="true"`（与 BindDevice 一致）

## agent 动作

1. 先读 [`transfer-page-ui.md`](../../references/transfer-page-ui.md) + [`dom-class-map.md`](../../references/dom-class-map.md)
2. 样式以 after [`BindDeviceDialog.vue`](../../template/after/src/views/tenant/components/BindDeviceDialog.vue) 的 `.transfer-container` / `.el-panel` 为壳，勿从零发明 grid-only 深度样式
3. 对照成品：[`template/after/.../ProjectDeviceConfigDialog.vue`](../../template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue)
4. **不改** gateway（本页无分页拉取）

## 验收

- [ ] 左右面板各占约一半宽度，中间按钮居中
- [ ] 列表行显示三列文案（或 `-`），非空 checkbox
- [ ] 条数多时列表区有**纵向**滚动条
- [ ] 超长字段省略号；溢出 hover 有 tooltip（`:title` 或 SFC）
- [ ] 无横向滚动条；`titles` 无 `(count)`
- [ ] 区块顺序：全选标题 → 搜索框 → 表头 → 列表（filter 不在最顶）
- [ ] checkbox 与首列文案间距与 BindDevice 视觉一致
- [ ] DevTools：列表行 / filter 的 Computed 含 `.transfer-container` 下本页规则
