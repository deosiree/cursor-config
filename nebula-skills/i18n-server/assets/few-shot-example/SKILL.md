---
name: 会话示例：apex_dev 国际化收口
description: 当需要参考一次真实仓库会话，理解旧链路退化、新方案接入、formRules 动态 t 与基座清理应如何串起来时使用。
---

# 会话示例：apex_dev 国际化收口

## 背景

这个示例来自一次完整的 `apex_dev` 国际化会话，目标不是成为独立 skill，而是为 `i18n-server` 子skill提供可复用的事实样本。

## 重点

- 旧 runtime 先退化，再接新方案
- `locales/*.json` 先补词条，再清模板和组件
- `formRules.ts` 保持单文件集中定义，但通过 `createXxxRules(t)` 把翻译放回消费时
- 动态校验函数显式接收 `t`
- 基座清理只收 i18n 接缝，不顺手改别人维护的非 i18n 逻辑
