# Template Guide

## 对应提交

- 提交：`e87b6d1202c782a53dce05799af22d1760bf7b13`
- 主题：修改 ts 或 script setup 中使用 t()，可以包变量

## mvp 用法

`template/mvp/` 只包含本提交最小必要改动样例，适合按步骤迁移其他微服务时逐步套用。

包含文件：
- `src/views/login/components/Login.vue`
- `src/views/login/components/LoginForgotPassword.vue`
- `src/views/login/components/VerifyTwoFactor.vue`

## snapshot 用法

`template/snapshot/` 包含该提交完成后的阶段性快照，仅保留与本阶段主题直接相关的目录，适合对照“这一阶段完成后应该长什么样”。

包含文件：
- `src/views/login/components/Login.vue`
- `src/views/login/components/LoginForgotPassword.vue`
- `src/views/login/components/VerifyTwoFactor.vue`

## 约束

- `mvp` 不越界到后续提交。
- `snapshot` 不是整仓镜像，只用于阶段对照。
- 所有样例均来自 `microfb` 的真实提交状态。
