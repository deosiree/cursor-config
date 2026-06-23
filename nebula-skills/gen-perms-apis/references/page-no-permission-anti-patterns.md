# 页面无权限空态 — 反模式与修复对照

## 反模式清单

| ID | 反模式 | 扫描信号 | 用户感知 | 修复 |
|----|--------|----------|----------|------|
| AP-01 | 仅清空列表数据 | `fetchData` 内 `!canQuery` → `pageData=[]`；`el-table` 无自定义 empty | 「暂无数据」 | 增加 `PageNoPermission` 兄弟分支 |
| AP-02 | 裸 el-empty | `v-else` 直接 `<el-empty>`，无 `el-card` | 布局不一致 | 改用 `<PageNoPermission v-else />` |
| AP-03 | 空态嵌套列表 card | `el-card` 内 `v-if`/`v-else` 与表格同 card | 无独立白卡片 | `el-card v-if` 与 `PageNoPermission` 并列 |
| AP-04 | 页面级重复样式 | `.tenant-no-perm` 等 scoped 样式 | 多页不一致 | 删除，样式内聚 `PageNoPermission` |
| AP-05 | 误用 microfb 404 | 在子应用内仿 404 全页路由错误 | 架构错位 | 用业务页 `PageNoPermission` |
| AP-06 | 门控与操作混淆 | 缺 `add` 却整页空态 | 过度拦截 | 仅 `v-hasPerm` 藏按钮 |

## grep 扫描建议

```bash
# 可能有 AP-01
rg "pageData\.value = \[\]" src/views
rg "total\.value = 0" src/views

# 可能有 AP-02/AP-03
rg "暂无页面访问权限|暂无权限查看" src/views
rg "tenant-no-perm|device-data-no-perm" src

# 已正确接入
rg "PageNoPermission" src/views
```

## 对照样本

| 路由 | before 文件 | after 文件 |
|------|-------------|------------|
| `/Apex/tenant` | `before-02/tenant-index.template.vue` | `after-02/tenant-index.template.vue` |
| `/Apex/dashboard` | `before-02/dashboard-index.template.vue` | `after-02/dashboard-index.template.vue` |
