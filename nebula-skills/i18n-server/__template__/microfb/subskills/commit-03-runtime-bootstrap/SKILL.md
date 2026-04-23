---
name: commit-03-runtime-bootstrap
description: Use when a repository has installed the new i18n packages and must bootstrap src/i18n, locale JSON files, extract config, and language storage wiring
---

# commit-03-runtime-bootstrap

## Overview

建立 `src/i18n` 新骨架、locale JSON、extract config、lang store 和入口接线。

## When to Use

- 依赖已安装
- 允许新增 `src/i18n` 目录
- 需要引入 locale JSON 与语言存储 key

## Required Inputs

- 提交来源：`4d51b5b1f7bcfdda603fe2d9870425a418a3e0f8`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：新 i18n 基座已存在，语言包与 store 已接线，仓库从此进入新 runtime 主链。
6. 进入下一步：`commit-04-lang-select-recovery`

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
- `i18n-extract.config.ts`
- `src/i18n/index.ts`
- `src/i18n/messages.ts`
- `src/store/lang.ts`
