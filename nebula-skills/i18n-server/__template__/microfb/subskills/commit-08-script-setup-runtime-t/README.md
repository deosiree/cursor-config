# commit-08-script-setup-runtime-t

## 来源提交

- 提交哈希：`e87b6d1202c782a53dce05799af22d1760bf7b13`
- 短哈希：`e87b6d1`
- 主题：修改 ts 或 script setup 中使用 t()，可以包变量

## 背景

把 `script setup` / TS 中的消息、rules、通知文案改为运行时 `t()` 消费。

## 触发条件

- 规则工厂已支持注入 `t`
- 页面脚本里仍存在硬编码通知、按钮、MFA 文案
- 可以删除旧的 rules composable

## 改动范围

- 在页面 script 中引入 `useI18n()`
- computed rules 改为 runtime 生成
- 删除已经过时的 `use-auth-form-rules.ts`

## 核心文件

- `src/views/login/components/Login.vue`
- `src/views/login/components/LoginForgotPassword.vue`
- `src/views/login/components/VerifyTwoFactor.vue`
- `src/views/login/composables/use-auth-form-rules.ts`

## 完成后的中间态

页面脚本内的主要文案已经迁移到 `t()`，只剩默认值 key 标记和动态拼接场景。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-09-trans-key-marking-mvp`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
