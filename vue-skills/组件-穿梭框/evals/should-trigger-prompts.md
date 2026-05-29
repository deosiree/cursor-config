# 触发与误触发用例

## should-trigger（应激活本 skill）

1. 「绑定设备穿梭框卡顿，数据几千条」
2. 「用 customTransfer / 项目 Transfer 替换 el-transfer」
3. 「角色关联设备从 el-table 多选改成穿梭框」
4. 「getBind 要拉全部分页，别用 999999 pageSize」
5. 「fetchAllDevicePages / PAGE_SIZE_MAX 设备列表」
6. 「穿梭框开 virtual-scroll」
7. 「租户 BindDeviceDialog 对照 template/v2-after」（默认 v2；v1 人类指定时用 template/after）
8. 「DeviceTab Tab 内嵌 DeviceTransfer / template/v2-after DeviceTab」
9. 「穿梭框关闭清空搜索 clearQuery」
10. 「绑定设备没变更别调 deviceActivate」
11. 「穿梭框没有纵向滚动条 / 面板显示 0/100」
12. 「ProjectDeviceConfigDialog 穿梭框优化 / 项目配置设备」
13. 「穿梭框只有 checkbox 没有设备名 / 挤在左边一半」
14. 「defineComponent 字符串 template 穿梭框插槽」
15. 「穿梭框搜索框在标题上面 / filter order」
16. 「穿梭框改 CSS 没变化 / 样式不生效」
17. 「checkbox 和设备名贴太紧 / 对齐 BindDevice 间距」
18. 「DeviceTransfer / transfer_v2 / 收成 columns」
19. 「三页穿梭框 CSS 重复 / 页内 :deep el-panel」
20. 「有 transfer 没有 DeviceTransfer / 补 v2 壳」
21. 「不是设备域 / 用户角色双列表 / 域外仓库穿梭框」

## should-not-trigger（不应激活本 skill）

| 用户说法 | 应路由到 |
|----------|----------|
| 表格操作列折叠、OperationColumn | `组件-操作列折叠` |
| 列表固定头尾、分页被裁切 | `layout-fixedHeadTail-adaptiveMiddle` |
| 全项目 i18n 迁移 | `i18n-server` |
| 仅 gateway 错误 toast 收口 | `shownotification` |
| 仅改 deviceActivate 业务字段、与 UI 无关 | 不触发 |

## 期望产物关键词

- `customTransfer`、`virtual-scroll`
- `fetchAllDevicePages`、`PAGE_SIZE_MAX`
- `buildTransferData`、`selectedDeviceKeys`
- `template/mvp`（新增 GREEN-1）、`template/v2-mvp`（GREEN-2）
- `template/v2-before|v2-after`（**默认**更新）、`template/before|after`（v1 非默认）
- `DeviceTransfer`、`deviceColumns`、`transfer_v2`
- `transfer-v2-layout`、禁止 `max-content` / `table-viewport`
- v1：`dom-class-map`、`transfer-page-ui` §⑤、`.transfer-container`
- 域外：`cross-domain-transfer-migration`、勿硬抄 `getBind`

## 路由期望

| 输入特征 | 应进入 |
|----------|--------|
| 无 transfer 目录 | 新增-Transfer穿梭框套件 GREEN-1 |
| 有 v1 无 `transfer_v2/DeviceTransfer.vue` | 新增-Transfer穿梭框套件 GREEN-2 |
| 套件齐，改多列设备页（默认） | **更新-页面接入Transfer_v2** |
| 人类明确 customTransfer / 不用 DeviceTransfer | 更新-页面接入Transfer（v1） |
| 新仓库 | 先新增 G1→G2 → 再 v2 更新 |
| 域外实体（非设备）双列表 + 全量分页 | 仍本 skill；读域外对照 + test-prompt #12 |
