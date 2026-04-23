---
name: commit-08-script-setup-runtime-t
description: Use when a component script still hard-codes text in computed state, notifications, or reusable rules and must migrate those runtime strings to t() inside script setup or TS factories
---

# commit-08-script-setup-runtime-t

## Overview

把 `script setup` / TS 中的消息、rules、通知文案改为运行时 `t()` 消费。

## When to Use

- 规则工厂已支持注入 `t`
- 页面脚本里仍存在硬编码通知、按钮、MFA 文案
- 可以删除旧的 rules composable

## Required Inputs

- 提交来源：`e87b6d1202c782a53dce05799af22d1760bf7b13`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：页面脚本内的主要文案已经迁移到 `t()`，只剩默认值 key 标记和动态拼接场景。
6. 进入下一步：`commit-09-trans-key-marking-mvp`

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
- `src/views/login/components/Login.vue`
- `src/views/login/components/LoginForgotPassword.vue`
- `src/views/login/components/VerifyTwoFactor.vue`
