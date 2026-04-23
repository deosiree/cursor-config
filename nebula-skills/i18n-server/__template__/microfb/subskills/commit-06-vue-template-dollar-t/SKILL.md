---
name: commit-06-vue-template-dollar-t
description: Use when a component template still renders hard-coded text in vue SFC templates and the new i18n runtime is already available in the component tree
---

# commit-06-vue-template-dollar-t

## Overview

把 Vue template 内硬编码文案迁移为 `$t()` 运行时消费。

## When to Use

- locale key 已补齐
- 组件可直接使用 `$t()`
- 需要优先处理模板层静态文案

## Required Inputs

- 提交来源：`1763c88e24581ea46c71d9119f114299cd376fb7`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：模板层文本已进入 i18n runtime，剩余工作主要集中在规则工厂、`script setup` 和 util 文案。
6. 进入下一步：`commit-07-form-rules-consumption-boundary`

## Guardrails

- 不跨越到后续提交的职责。
- 不把 `template/snapshot/` 直接当成全量仓库覆盖包。
- 不在缺少前置条件时跳过本提交。

## Deliverables

- `README.md`
- `SKILL.md`
- `template/README.md`
- `template/mvp/`
- `template/snapshot/`

## MVP Template First

优先阅读：
- `src/views/login/components/ForgotResetStep.vue`
- `src/views/login/components/ForgotVerifyStep.vue`
- `src/views/login/index.vue`
