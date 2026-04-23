# commit-06-vue-template-dollar-t

## 来源提交

- 提交哈希：`1763c88e24581ea46c71d9119f114299cd376fb7`
- 短哈希：`1763c88`
- 主题：修改 Vue 模板中使用 $t()

## 背景

把 Vue template 内硬编码文案迁移为 `$t()` 运行时消费。

## 触发条件

- locale key 已补齐
- 组件可直接使用 `$t()`
- 需要优先处理模板层静态文案

## 改动范围

- 将标题、按钮、占位符等模板文本改为 `$t()`
- 保留 props / emit 结构不变
- 优先迁移视图层明显静态文案

## 核心文件

- `src/views/login/components/ForgotResetStep.vue`
- `src/views/login/components/ForgotStepPanel.vue`
- `src/views/login/components/ForgotVerifyStep.vue`
- `src/views/login/index.vue`

## 完成后的中间态

模板层文本已进入 i18n runtime，剩余工作主要集中在规则工厂、`script setup` 和 util 文案。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-07-form-rules-consumption-boundary`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
