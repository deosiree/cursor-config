# Template Guide

## 对应提交

- 提交：`6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`
- 主题：MVP：解决函数的动态拼接翻译文件，通过业务层回调 t 到函数定义中

## mvp 用法

`template/mvp/` 只包含本提交最小必要改动样例，适合按步骤迁移其他微服务时逐步套用。

包含文件：
- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`

## snapshot 用法

`template/snapshot/` 包含该提交完成后的阶段性快照，仅保留与本阶段主题直接相关的目录，适合对照“这一阶段完成后应该长什么样”。

包含文件：
- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`

## 约束

- `mvp` 不越界到后续提交。
- `snapshot` 不是整仓镜像，只用于阶段对照。
- 所有样例均来自 `microfb` 的真实提交状态。
