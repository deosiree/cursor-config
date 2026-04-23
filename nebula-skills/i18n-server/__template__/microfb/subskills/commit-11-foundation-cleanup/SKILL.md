---
name: commit-11-foundation-cleanup
description: Use when most migration steps are done and the repository needs a final cleanup pass to remove transitional helper text generation and finish the microfb-style i18n runtime boundaries
---

# commit-11-foundation-cleanup

## Overview

清理过渡 helper，把仍残留在 util 中的展示文案彻底收口到页面运行时。

## When to Use

- 前面的模板与 script 迁移已完成
- 仍有 util 文件直接返回展示文本
- 需要最终基座收尾和边界固化

## Required Inputs

- 提交来源：`f3f6f109a3900577f5f56718813f95e82db5ab17`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：microfb 风格的新 i18n 方案完成收尾，页面展示文本和 util 结构化逻辑的边界稳定。
6. 进入下一步：`结束；后续在其他微服务按场景选择复用子 skill`

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
- `src/utils/login-auth.ts`
- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`
