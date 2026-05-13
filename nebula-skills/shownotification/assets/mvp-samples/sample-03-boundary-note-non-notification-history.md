# MVP Sample 03

## 标题

非通知职责的历史伴随改动，不纳入本 skill 主示例链路

## 历史版本

- before: `c16bf5a98e71ea9f2fa3df2dd9b2e71be0d3d0fb^`
- after: `c16bf5a98e71ea9f2fa3df2dd9b2e71be0d3d0fb`

## 说明

该提交的主轴是：

- 全局纯函数如何接 i18n 注入
- `main.ts` 如何调用 `setupRequestI18n(...)`
- `clipboard.ts` / `request.ts` 如何使用 `translate(...)`

这些内容不属于 `shownotification` 的职责范围，因此本次不回填为主 MVP 样本。

## 仅保留的结论

- 历史提交中可能夹带通知之外的伴随改动
- skill 回填样本时应只抽通知职责直接相关的最小片段
- 不能因为某个 commit 同时改了通知和 i18n，就把 i18n 规范并入通知 skill
- 不要把“重复弹窗治理”误解为必须在 `showNotificationError` 内加入标记或黑盒消重；
  本 skill 默认推荐先从 request / gateway / view 边界治理重复通知
