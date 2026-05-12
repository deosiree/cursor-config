---
name: 新i18n-纯ts中用i18n.global.t few-shot 入口
description: 当需要在主模板之外，为 `新i18n-纯ts中用i18n.global.t` 选择更贴近当前仓库形态的 few-shot 时使用。
---

# 新i18n-纯ts中用i18n.global.t few-shot 入口

## 使用方式

- 先看主模板，确认当前问题是否已经足够接近主模板。
- 如果当前仓库结构、文件位置或纯 TS 消费边界明显不同，再进入具体 few-shot 子目录。
- 优先选择同仓库、同模块类型、同全局实例消费方式的 few-shot。
- 如果当前问题是“纯 TS i18n 工厂 + 组件 computed locale 订阅”的联动场景，优先看 `microfb-*` 变体。

## 选择原则

- `opsdeck-*`：优先用于 `request.ts`、`util.ts`、`helper.ts` 等纯 TS 全局实例消费场景。
- `microfb-*`：优先用于登录、表单规则工厂、切语言后 rules 重建等联动场景。
- 如果未来补充了其他仓库变体，优先选择文件角色更接近、改动范围更小的那个。
