# 租户绑定设备：gateway + Dialog 接入

## 场景

租户管理「绑定设备」Dialog，大数据 + 双列表 bind/unbind。

## 真相源

| 侧 | commit | 文件 |
|----|--------|------|
| before | `cdb58504^` | `template/before/.../BindDeviceDialog.vue`、`device.gateway.ts` |
| after Dialog | **HEAD** | `template/after/.../BindDeviceDialog.vue` |
| after gateway | `cdb58504` | `template/after/.../device.gateway.ts` + pagination/notification |

## 关键 diff

### gateway

- **before**：`pageSize: 999999`
- **after**：`fetchAllDevicePages`，`PAGE_SIZE_MAX=50`，`concurApiErr`

### Dialog

- **before**：`transferTitles` 含 `(${unboundTotal})`
- **after**：纯文案；`:virtual-scroll="true"`
- **HEAD 增量**：`handleSubmit` 仅 bind/unbind 非空时调 `deviceActivate`

### UI 四必选

- **数量**：`transferFormat = { noChecked: " ", hasChecked: " " }`（勿用空串）
- **纵向滚动**：`.transfer-container { height: 500px }` + 列表高度链
- **tooltip**：`#default` 各列 `:title` + ellipsis
- 见 [`references/transfer-page-ui.md`](../../references/transfer-page-ui.md)

## agent 动作

1. 改 gateway → 对照 after `device.gateway.ts`
2. 改 Dialog → 对照 after `BindDeviceDialog.vue`（HEAD）
3. 勿在 view 层拼分页

## 验收

- 全量设备可加载、穿梭流畅
- 关闭 Dialog 清搜索
- 无变更点确定不调激活接口
- 面板头无 `0/N`；列表可纵向滚动；截断有 hover 全文
