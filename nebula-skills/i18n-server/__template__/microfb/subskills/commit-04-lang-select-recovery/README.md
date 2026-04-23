# commit-04-lang-select-recovery

## 来源提交

- 提交哈希：`06624c8d0c22a0b3094b94ad861b188eb307ac80`
- 短哈希：`06624c8`
- 主题：修改语言选择器，定义语言下拉框常量

## 背景

恢复语言切换 UI，并把语言选项常量收敛到 `src/i18n/messages.ts`。

## 触发条件

- 已有 `useLangStore`
- 已有 locale JSON 和消息映射
- 界面上仍需保留语言切换器

## 改动范围

- 恢复下拉式语言切换器
- 新增 `langOptions` 常量
- 语言切换成功后更新 store 并提示用户

## 核心文件

- `src/components/LangSelect/index.vue`
- `src/i18n/messages.ts`
- `src/store/lang.ts`

## 完成后的中间态

用户已经可以通过统一下拉框切换 `zh-CN` / `en-US`，语言选项来源不再散落。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-05-locale-json-fill`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
