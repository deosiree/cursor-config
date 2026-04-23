---
name: commit-04-lang-select-recovery
description: Use when the new i18n runtime is bootstrapped and the microservice must restore its language selector with a store-backed langOptions contract
---

# commit-04-lang-select-recovery

## Overview

恢复语言切换 UI，并把语言选项常量收敛到 `src/i18n/messages.ts`。

## When to Use

- 已有 `useLangStore`
- 已有 locale JSON 和消息映射
- 界面上仍需保留语言切换器

## Required Inputs

- 提交来源：`06624c8d0c22a0b3094b94ad861b188eb307ac80`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：用户已经可以通过统一下拉框切换 `zh-CN` / `en-US`，语言选项来源不再散落。
6. 进入下一步：`commit-05-locale-json-fill`

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
- `src/components/LangSelect/index.vue`
- `src/i18n/messages.ts`
