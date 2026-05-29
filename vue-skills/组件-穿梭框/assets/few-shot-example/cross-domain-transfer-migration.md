# Few-shot：域外双列表迁移（非设备域）

## 何时读

- 目标仓库**不是** nebula / apex_dev，或业务实体不是「设备三页」
- test-prompt **#12** 类诉求

## 原则

- **流程**与 nebula 相同：G1 → G2（多列）→ 默认 v2 改页
- **样本**只借结构，不借 `DeviceGateway`、`BindDeviceDialog` 路径与字段名

## 域外对照（速查）

| nebula | 域外 |
|--------|------|
| `DeviceGateway.getBind` / `getUnbind` | `XxxGateway.fetchAllPages` + 你的 bind API |
| `deviceColumns`（名称/编码/描述） | `DeviceTransferColumn[]` 按业务列 `getValue` |
| `template/v2-after/.../BindDeviceDialog.vue` | Dialog + `DeviceTransfer` + `host-height` 结构参考 |
| `buildTransferData` 的 `device` 字段 | 映射为 `{ key, label, entity }` |
| `deviceActivate` | 非空才调你的关联/授权接口 |
| `fetchAllDevicePages` | [`gateway-full-fetch.md`](../../references/gateway-full-fetch.md) 通则 |

## 禁止

- 硬抄 `getBind`、`pageSize: 999999`、三页文件名
- 在业务页复制 `DeviceTransfer.vue` 内布局 CSS

## 路由

仍走父级 [`SKILL.md`](../../SKILL.md) 口诀；gateway 细节见 [`api-gateway-add`](../../../nebula-skills/api-gateway-add/SKILL.md) 若需新建接口。
