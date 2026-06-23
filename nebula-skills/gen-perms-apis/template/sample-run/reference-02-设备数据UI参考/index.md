# reference-02：设备数据 UI 参考（只读）

> **本目录仅作视觉对照，不在权限空态落地批次中改动设备数据模块源码。**

## 参考来源

- `apex_dev/src/views/dataSearch/deviceData/index.vue`（`v-else` 分支）
- `apex_dev/src/views/dataSearch/deviceData/index.scss`（`.device-data-no-perm`）

## 对齐要点

- 独立 `el-card shadow="hover"` 包裹空态
- `el-empty` flex 居中，`min-height: 320px`
- `el-card__body`：`height: 100%`; `padding: 13px`
- 文案：`$t('暂无页面访问权限')`

## 与 PageNoPermission 关系

`PageNoPermission` 将上述 inline 实现抽取为 `apex_dev/src/components` 公共组件，供首页、租户管理等本模块页面复用。
