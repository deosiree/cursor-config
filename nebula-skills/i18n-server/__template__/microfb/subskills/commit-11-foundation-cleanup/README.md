# commit-11-foundation-cleanup

## 来源提交

- 提交哈希：`f3f6f109a3900577f5f56718813f95e82db5ab17`
- 短哈希：`f3f6f10`
- 主题：trans 收尾：基座国际化的收尾

## 背景

清理过渡 helper，把仍残留在 util 中的展示文案彻底收口到页面运行时。

## 触发条件

- 前面的模板与 script 迁移已完成
- 仍有 util 文件直接返回展示文本
- 需要最终基座收尾和边界固化

## 改动范围

- 把 util 中的展示文案挪回页面 computed
- 保留 util 负责协议、渠道、结构化枚举映射
- 完成 trans/t 的最终职责划分

## 核心文件

- `src/utils/login-auth.ts`
- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`

## 完成后的中间态

microfb 风格的新 i18n 方案完成收尾，页面展示文本和 util 结构化逻辑的边界稳定。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `结束；后续在其他微服务按场景选择复用子 skill`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
