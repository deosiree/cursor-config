# commit-03-runtime-bootstrap

## 来源提交

- 提交哈希：`4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`
- 短哈希：`4d51b5b`
- 主题：i18n 实例初始化：其他样板代码

## 背景

建立 `src/i18n` 新骨架、locale JSON、extract config、lang store 和入口接线。

## 触发条件

- 依赖已安装
- 允许新增 `src/i18n` 目录
- 需要引入 locale JSON 与语言存储 key

## 改动范围

- 新增 `i18n-extract.config.ts`
- 新增 `src/i18n/index.ts`、`messages.ts`、`element.ts`、locale JSON
- 新增 `src/store/lang.ts` 并在入口安装 i18n

## 核心文件

- `i18n-extract.config.ts`
- `src/i18n/index.ts`
- `src/i18n/messages.ts`
- `src/store/lang.ts`
- `src/main.ts`
- `src/App.vue`

## 完成后的中间态

新 i18n 基座已存在，语言包与 store 已接线，仓库从此进入新 runtime 主链。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-04-lang-select-recovery`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
