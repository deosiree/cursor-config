# 触发与误触发用例

## should-trigger（应激活本 skill）

1. 「绑定设备穿梭框卡顿，数据几千条」
2. 「用 customTransfer / 项目 Transfer 替换 el-transfer」
3. 「角色关联设备从 el-table 多选改成穿梭框」
4. 「getBind 要拉全部分页，别用 999999 pageSize」
5. 「fetchAllDevicePages / PAGE_SIZE_MAX 设备列表」
6. 「穿梭框开 virtual-scroll」
7. 「租户 BindDeviceDialog 对照 template/after」
8. 「DeviceTab Tab 内嵌 Transfer 固定高度」
9. 「穿梭框关闭清空搜索 clearQuery」
10. 「绑定设备没变更别调 deviceActivate」
11. 「穿梭框没有纵向滚动条 / 面板显示 0/100」
12. 「ProjectDeviceConfigDialog 穿梭框优化 / 项目配置设备」
13. 「穿梭框只有 checkbox 没有设备名 / 挤在左边一半」
14. 「defineComponent 字符串 template 穿梭框插槽」
15. 「穿梭框搜索框在标题上面 / filter order」
16. 「穿梭框改 CSS 没变化 / 样式不生效」
17. 「checkbox 和设备名贴太紧 / 对齐 BindDevice 间距」

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
- `template/mvp`（新增）、`template/before|after`（更新）
- `dom-class-map`、`project-device-config-regression`
- `.el-panel`、`TransferOverflowText`、禁止 `overflow-x` 横滚
- `transfer-page-ui` §⑤、`order: 2`、`.transfer-container`、DevTools、第二波回归

## 路由期望

| 输入特征 | 应进入 |
|----------|--------|
| 无 transfer 目录 | 新增-Transfer穿梭框套件 |
| 有 transfer，页面仍 el-table / el-transfer / 999999 | 更新-页面接入Transfer |
| 新仓库 | 先新增 → 再更新 |
