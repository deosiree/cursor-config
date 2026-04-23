---
name: microfb-i18n-commit-playbook
description: Use when a nebula microservice needs to migrate to the microfb-style i18n runtime by replaying the proven commit chain from static deprecation through runtime cleanup
---

# microfb i18n Commit Playbook

## Overview

这个父 skill 负责编排 `microfb` 的 11 个真实 i18n 迁移提交，把它们路由成一条可在其他微服务复用的迁移剧本。

## When to Use

- 你要在 nebula 体系内复用 `microfb` 的新 i18n 方案。
- 你面对的是混合状态仓库，不确定应该先退化旧链路还是先接新 runtime。
- 你需要把模板文案、表单规则、`script setup`、`trans()`、动态文本边界拆清楚。

## Workflow

1. 先判断旧链路是否仍存在
   - 如果仍有 `src/lang`、语言枚举、旧切换入口，先读 `commit-01-static-deprecation`
2. 建立新基座
   - 顺序固定：`commit-02-plugin-install` -> `commit-03-runtime-bootstrap`
3. 按场景推进消费侧迁移
   - 语言切换器：`commit-04-lang-select-recovery`
   - locale key 补齐：`commit-05-locale-json-fill`
   - Vue 模板：`commit-06-vue-template-dollar-t`
   - 表单规则：`commit-07-form-rules-consumption-boundary`
   - script setup / TS：`commit-08-script-setup-runtime-t`
4. 处理提取器与动态文本特例
   - 默认值 key 标记：`commit-09-trans-key-marking-mvp`
   - 动态文本回调化：`commit-10-dynamic-function-text-callback`
   - 基座收尾：`commit-11-foundation-cleanup`

## Guardrails

- 不允许跳过 `commit-01` 就在旧 runtime 上叠加新 runtime。
- 不允许在 locale key 未补齐时大量改模板消费点。
- 不允许把 `trans()` 当成最终展示翻译。
- 不允许把动态文本继续固化在 util 层返回字符串。

## Deliverables

- `README.md`
- `templates/migration-routing-table.md`
- `templates/orchestration-flow.md`
- `templates/migration-checklist.md`
- `subskills/*` 11 个提交级 skill

## MVP Template First

优先阅读：
- `templates/migration-routing-table.md`
- `templates/orchestration-flow.md`
- `templates/migration-checklist.md`
