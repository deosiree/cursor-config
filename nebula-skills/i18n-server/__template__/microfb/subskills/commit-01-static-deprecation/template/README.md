# Template Guide

## 对应提交

- 提交：`ac05eebfbe5f2d35125cec76ba84a545d35d1067`
- 主题：退化 i18n 的旧方案：全部硬切静态化

## mvp 用法

`template/mvp/` 只包含本提交最小必要改动样例，适合按步骤迁移其他微服务时逐步套用。

包含文件：
- `src/components/LangSelect/index.vue`
- `src/store/modules/app.store.ts`
- `src/utils/i18n.ts`

## snapshot 用法

`template/snapshot/` 包含该提交完成后的阶段性快照，仅保留与本阶段主题直接相关的目录，适合对照“这一阶段完成后应该长什么样”。

包含文件：
- `src/components/LangSelect/index.vue`
- `src/store/modules/app.store.ts`
- `src/utils/i18n.ts`
- `src/lang/index.ts`
- `src/settings.ts`

## 约束

- `mvp` 不越界到后续提交。
- `snapshot` 不是整仓镜像，只用于阶段对照。
- 所有样例均来自 `microfb` 的真实提交状态。
