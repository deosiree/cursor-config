# should-not-trigger

以下 prompt **不应** 触发 `hook-loading`（或仅作边界提示后退出）。

1. 用户列表表格加 v-loading，查询时转圈
2. request 拦截器统一加全局 loading
3. opsdeck loading.store 和 axios 拦截怎么配
4. qiankun 主应用点击菜单瞬间就 loading（microfb NavbarActions）
5. Element Plus Skeleton 骨架屏怎么做
6. 个人中心改密码校验规则（formRules，非 loading/hook）
