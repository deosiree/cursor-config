# commit-07-form-rules-consumption-boundary

## 来源提交

- 提交哈希：`462a31dbe13af101443bac1869b021803af6e945`
- 短哈希：`462a31d`
- 主题：修改规则中心 formRules，校验器的 i18n 消费点在 formRules

## 背景

把表单消息定义和规则生成拆层，确保翻译发生在运行时规则工厂中。

## 触发条件

- 表单校验文案仍是硬编码字符串
- 页面或 composable 需要响应语言切换重新计算 rules
- 希望抽离可复用规则工厂

## 改动范围

- 把消息标识收敛到常量文件
- 在 `formRules.ts` 注入 `t` 生成规则
- 支持页面在 computed rules 中重新消费

## 核心文件

- `src/constants/form-validation.ts`
- `src/utils/formRules.ts`
- `src/views/login/components/LoginForgotPassword.vue`

## 完成后的中间态

form rules 已具备运行时 i18n 边界，后续 `script setup` 页面可以直接组合规则工厂。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-08-script-setup-runtime-t`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
