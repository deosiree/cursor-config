# commit-01-static-deprecation

## 来源提交

- 提交哈希：`ac05eebfbe5f2d35125cec76ba84a545d35d1067`
- 短哈希：`ac05eeb`
- 主题：退化 i18n 的旧方案：全部硬切静态化

## 背景

把旧 i18n 依赖退化成静态单语言运行中间态，为后续新基座接入清场。

## 触发条件

- 旧仓库中仍存在 `src/lang` 运行时或语言枚举
- 语言切换入口仍在生效
- 需要获得一个可运行、可提交的静态中文中间态

## 改动范围

- 移除或短路语言切换行为
- 把 Element Plus locale 固定到静态中文
- 让 route title 翻译回退为直接返回原字符串

## 核心文件

- `src/components/LangSelect/index.vue`
- `src/store/modules/app.store.ts`
- `src/utils/i18n.ts`
- `src/lang/index.ts`
- `src/settings.ts`

## 完成后的中间态

仓库仍可运行，但语言切换已失效，展示文案以静态中文为主，旧 i18n 运行时只保留最低兼容壳。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-02-plugin-install`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
