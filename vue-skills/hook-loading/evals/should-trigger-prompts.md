# should-trigger

以下 prompt 应触发 `hook-loading` 父级路由，并进一步委派新建-hook 或应用-hook。

## 新建-hook

1. 从 opsdeck 把 useLoading 迁到 apex_dev 的 layouts/composables
2. 新子应用没有全屏 loading composable，要加 ElLoading.service 封装
3. apex 仓库还没有 useLoading.ts，先落地基础设施

## 应用-hook

1. 个人中心刷新闪 XXX 假邮箱，抽 composable 加全屏 loading
2. profile 页 inline loadUserProfile 改成 useProfile，对照 before after
3. 进入个人中心先显示管理员和假手机号，接口回来才变真数据
4. 提交改邮箱后又弹全屏 loading，想改成静默 refresh

## 组合

1. 从零给详情页加 useLoading 并抽 useXxx hook，首屏不要闪占位
