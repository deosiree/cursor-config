# 组件-穿梭框

Vue **Transfer 穿梭框** skill：`customTransfer`（虚拟滚动）+ 业务页接入；gateway 全量分页合并。

## 解决什么问题

- 大数据双列表选型卡顿（需 `virtual-scroll`）
- 业务页仍用 `el-transfer` / `el-table` 多选做左右列表
- gateway 用 `pageSize: 999999` 假全量
- Tab / Dialog 内嵌穿梭框布局与选型回显
- ProjectDeviceConfig 类回归：`.el-panel` 类名、flex `order`、`.transfer-container` 行间距、DevTools 验收（见 `transfer-page-ui` §⑤）

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新增-Transfer穿梭框套件   → template/mvp
└── feature-skills/更新-页面接入Transfer     → template/before|after
```

## 真相源（维护）

与 **apex_dev** 对齐：

| 变更类型 | 真相源 commit | 同步目标 |
|----------|--------------|----------|
| Transfer 组件 | `cdb58504` 或当前 HEAD | [`template/mvp/src/components/transfer/`](template/mvp/src/components/transfer/) |
| BindDeviceDialog after | **当前 HEAD** | [`template/after/.../BindDeviceDialog.vue`](template/after/src/views/tenant/components/BindDeviceDialog.vue) |
| ProjectDeviceConfigDialog after | **当前 HEAD** | [`template/after/.../ProjectDeviceConfigDialog.vue`](template/after/src/views/tenant/components/ProjectDeviceConfigDialog.vue) |
| gateway 配套 after | `cdb58504` | [`template/after/.../device.gateway.ts`](template/after/src/gateway/device/device.gateway.ts) 等 |
| DeviceTab before | `e0a93b0` | [`template/before/.../DeviceTab.vue`](template/before/src/views/system/role/components/DeviceTab.vue) |
| DeviceTab after | 当前 HEAD / staged | [`template/after/.../DeviceTab.vue`](template/after/src/views/system/role/components/DeviceTab.vue) |

维护组件：**先改 apex_dev → 再覆盖 template**。

## 目录说明

```text
组件-穿梭框/
├── SKILL.md
├── template/mvp|before|after/
├── references/
├── assets/few-shot-example/
└── evals/
```

## 关联 skill

- [`api-gateway-add`](../../nebula-skills/api-gateway-add/SKILL.md) — gateway 全量拉取与集成分层
- [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md) — 列表页固定头尾（非穿梭框）
