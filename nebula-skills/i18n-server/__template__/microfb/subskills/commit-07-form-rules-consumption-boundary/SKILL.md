---
name: commit-07-form-rules-consumption-boundary
description: Use when validation rules still freeze translated text too early and the repository needs a clear boundary between message keys, rule factories, and page-level t injection
---

# commit-07-form-rules-consumption-boundary

## Overview

把表单消息定义和规则生成拆层，确保翻译发生在运行时规则工厂中。

## When to Use

- 表单校验文案仍是硬编码字符串
- 页面或 composable 需要响应语言切换重新计算 rules
- 希望抽离可复用规则工厂

## Required Inputs

- 提交来源：`462a31dbe13af101443bac1869b021803af6e945`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：form rules 已具备运行时 i18n 边界，后续 `script setup` 页面可以直接组合规则工厂。
6. 进入下一步：`commit-08-script-setup-runtime-t`

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
- `src/constants/form-validation.ts`
- `src/utils/formRules.ts`
