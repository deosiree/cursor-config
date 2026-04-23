---
name: commit-05-locale-json-fill
description: Use when locale JSON files exist but the new runtime still lacks enough keys for template migration, notifications, and login-related flows
---

# commit-05-locale-json-fill

## Overview

补齐 locale JSON，让后续模板和运行时消费点迁移有 key 可用。

## When to Use

- locale JSON 已建立
- 准备开始改模板或 TS 消费点
- 需要确保 key 先入库再改引用

## Required Inputs

- 提交来源：`198a60a2215c68d0aafef7bb0110d01b497cf803`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：后续页面迁移所需的主要 key 已进入 JSON，模板迁移不会因为缺 key 反复回头补词条。
6. 进入下一步：`commit-06-vue-template-dollar-t`

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
- `src/i18n/locales/en_US.json`
- `src/i18n/locales/zh_CN.json`
