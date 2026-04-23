---
name: commit-02-plugin-install
description: Use when the static intermediate state is ready and the repository must install vue-i18n 11 plus vue-i18n-kit-sy before building the new i18n runtime
---

# commit-02-plugin-install

## Overview

安装新 i18n runtime 所需依赖，并锁定新方案的版本基线。

## When to Use

- 已经有可运行的退化分支
- 允许升级 `vue-i18n` 主版本
- 需要对齐新 runtime 的依赖约束

## Required Inputs

- 提交来源：`aca321dcfbd75c0368481c4dbd4a46d88ddbf07b`
- 当前仓库现状：需满足本提交对应的触发条件
- 参考模板：优先看 `template/mvp/`，必要时对照 `template/snapshot/`

## Workflow

1. 识别当前仓库是否命中本提交的问题形态。
2. 对照 `README.md` 中的核心文件，限定本轮改动边界。
3. 先应用 `template/mvp/` 的最小必要样例。
4. 如果需要确认阶段完成态，再对照 `template/snapshot/`。
5. 验证仓库是否达到以下中间态：仓库依赖层已经具备新 i18n runtime 的安装条件，但业务代码尚未接线。
6. 进入下一步：`commit-03-runtime-bootstrap`

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
- `package.json`
