---
name: commit-09-trans-key-marking-mvp
description: Use when default prop text or helper-returned strings must be visible to the extractor as i18n keys without being translated until the actual render or notification consumption point
---

# commit-09-trans-key-marking-mvp

## Overview

建立 `trans()` 只负责标记 key、消费点再 `t()` 的 MVP 约束。

## When to Use

- 项目已引入 `vue-i18n-kit-sy/runtime`
- 某些默认值需要被抽词工具识别
- 调用点仍能再套一层 `t()` 或 `$t()`

## Required Inputs

- 提交来源：`c05f40d07ec4f4092305df331bc94277ef2272da`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：提取器可以识别默认值里的国际化 key，但真实展示仍由调用点负责。
6. 进入下一步：`commit-10-dynamic-function-text-callback`

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
- `src/components/auth/field/CodeField.vue`
