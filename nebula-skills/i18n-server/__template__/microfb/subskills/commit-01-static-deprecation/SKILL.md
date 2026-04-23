---
name: commit-01-static-deprecation
description: Use when a microservice still depends on a legacy src/lang runtime, language enum switching, or global route-title translation and must first degrade to a static single-language intermediate state
---

# commit-01-static-deprecation

## Overview

把旧 i18n 依赖退化成静态单语言运行中间态，为后续新基座接入清场。

## When to Use

- 旧仓库中仍存在 `src/lang` 运行时或语言枚举
- 语言切换入口仍在生效
- 需要获得一个可运行、可提交的静态中文中间态

## Required Inputs

- 提交来源：`ac05eebfbe5f2d35125cec76ba84a545d35d1067`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：仓库仍可运行，但语言切换已失效，展示文案以静态中文为主，旧 i18n 运行时只保留最低兼容壳。
6. 进入下一步：`commit-02-plugin-install`

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
- `src/store/modules/app.store.ts`
- `src/utils/i18n.ts`
