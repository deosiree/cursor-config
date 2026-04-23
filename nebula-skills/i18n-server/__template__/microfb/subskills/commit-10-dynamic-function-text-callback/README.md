# commit-10-dynamic-function-text-callback

## 来源提交

- 提交哈希：`6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`
- 短哈希：`6a3e495`
- 主题：MVP：解决函数的动态拼接翻译文件，通过业务层回调 t 到函数定义中

## 背景

处理 `trans()` 无法覆盖的动态拼接文本，把翻译责任回推到业务调用层。

## 触发条件

- 已经采用 `trans()` 标记静态 key
- 存在动态渠道、倒计时、masked 值等文本拼接场景
- 业务层可以注入 `t` 或在 computed 中组装

## 改动范围

- 把 util 中的展示文案函数改为接受 `t` 或返回更原始的数据
- 页面 computed 中重新拼装文本
- 避免 util 层直接产出最终翻译字符串

## 核心文件

- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`

## 完成后的中间态

动态文本的翻译边界已回到业务层，util 更偏向返回结构化数据或 key。

## 推荐迁移步骤

1. 先确认当前仓库是否满足本提交的输入前置。
2. 参考 `template/mvp/` 只落本提交的最小必要改动。
3. 如需对照阶段完成态，再看 `template/snapshot/`。
4. 完成本提交后，进入 `commit-11-foundation-cleanup`。

## 常见误用

- 把本提交和下一提交的职责混在同一轮里一起改。
- 只看模板快照，不理解为什么要建立这个中间态。
- 忽略本提交中的边界约束，导致后续步骤继续返工。
