---
name: commit-10-dynamic-function-text-callback
description: Use when a helper function assembles dynamic MFA, OTP, or notification text and trans() cannot safely represent the final translated string because runtime variables must be interpolated at the call site
---

# commit-10-dynamic-function-text-callback

## Overview

处理 `trans()` 无法覆盖的动态拼接文本，把翻译责任回推到业务调用层。

## When to Use

- 已经采用 `trans()` 标记静态 key
- 存在动态渠道、倒计时、masked 值等文本拼接场景
- 业务层可以注入 `t` 或在 computed 中组装

## Required Inputs

- 提交来源：`6a3e495bd1545ccfb8b23e8c0e654e0ef1919fbe`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：动态文本的翻译边界已回到业务层，util 更偏向返回结构化数据或 key。
6. 进入下一步：`commit-11-foundation-cleanup`

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
- `src/utils/login-mfa.ts`
- `src/views/login/components/Login.vue`
