# 组件-穿梭框

Vue **Transfer 穿梭框** skill：v1 `customTransfer`（虚拟滚动）+ v2 **`DeviceTransfer`** 多列布局壳 + 业务页接入。

## 解决什么问题

- 大数据双列表选型卡顿（需 `virtual-scroll`）
- 多列设备 Dialog/Tab 统一为 **DeviceTransfer**（默认）
- 业务页仍用 `el-transfer` / `el-table` 多选
- gateway 用 `pageSize: 999999` 假全量
- v1 强定制布局（人类指定时用页内 `customTransfer`）

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新增-Transfer穿梭框套件   → template/mvp + template/v2-mvp
├── feature-skills/更新-页面接入Transfer_v2  → template/v2-before|v2-after 【默认】
└── feature-skills/更新-页面接入Transfer     → template/before|after 【非默认，人类指定 v1】
```

判定口诀：**没有 transfer 或没有 v2 壳 → 新增；要改页面 → 默认 v2 接入；只有人说用 Transfer v1 或布局用不了 v2 → v1 接入。**

## 真相源（维护）

与 **apex_dev** 对齐：

| 变更类型 | 真相源 commit | 同步目标 |
|----------|--------------|----------|
| Transfer v1 组件 | `cdb58504` 或 HEAD | [`template/mvp/`](template/mvp/) |
| DeviceTransfer 壳 | `a609804` | [`template/v2-mvp/`](template/v2-mvp/) |
| 三设备页 v2 | `a609804^` / `a609804` | [`template/v2-before/`](template/v2-before/) / [`template/v2-after/`](template/v2-after/) |
| gateway 配套 | `cdb58504` | [`template/after/.../device.gateway.ts`](template/after/src/gateway/device/device.gateway.ts) 等 |
| v1 设备页 after | `cdb58504` 等 | [`template/after/`](template/after/)（勿被 v2 覆盖） |

维护：**先改 apex_dev → 再覆盖对应 template 目录**。

## 域外仓库迁移（5 步 + 对照表）

非 nebula / 非设备域时，勿硬抄 `DeviceGateway.getBind` 与三页样本名。概念对照见父级 [`SKILL.md`](SKILL.md) §域外对照；few-shot 见 [`cross-domain-transfer-migration.md`](assets/few-shot-example/cross-domain-transfer-migration.md)。

| nebula | 域外 |
|--------|------|
| `getBind` / `getUnbind` | 你的全量 list + bind API |
| `deviceColumns` 三列 | 业务字段 `DeviceTransferColumn[]` |
| `v2-after/BindDeviceDialog` | 结构参考，不抄路径 |
| `deviceActivate` | 你的关联接口，非空才调 |

1. **GREEN-1**：`template/mvp` → 目标仓 `@/components/transfer`
2. **GREEN-2**：`template/v2-mvp`（多列）或跳过（单列可长期 v1）
3. **抽象 gateway**：全量分页模式（见 [`references/gateway-full-fetch.md`](references/gateway-full-fetch.md)）
4. **默认改页**：`DeviceTransfer` + `columns`（[`更新-页面接入Transfer_v2`](feature-skills/更新-页面接入Transfer_v2/SKILL.md)）
5. **人类指定 v1** 或布局不适配 v2 → [`更新-页面接入Transfer`](feature-skills/更新-页面接入Transfer/SKILL.md)

## 目录说明

```text
组件-穿梭框/
├── SKILL.md
├── template/mvp|v2-mvp|v2-before|v2-after|before|after/
├── feature-skills/（新增 + 更新_v2 + 更新 v1）
├── references/
├── assets/few-shot-example/
└── evals/
```

## 关联 skill

- [`api-gateway-add`](../../nebula-skills/api-gateway-add/SKILL.md) — gateway 全量拉取
- [`layout-fixedHeadTail-adaptiveMiddle`](../layout-fixedHeadTail-adaptiveMiddle/SKILL.md) — 列表页固定头尾（非穿梭框）
