---
name: feature-migration
description: Use when a frontend repository must migrate to the unified i18n-server scheme with locale JSON files, extraction config, trans helpers, and a shared language-store contract
---

# Feature Migration

## Overview

这个 skill 负责把仓库接入统一的新 i18n 方案，并定义未来所有微服务都遵守的目录结构、调用方式和迁移顺序。它依赖 `feature-analysis` 讲清旧链路，也依赖 `feature-deprecation` 先完成中间态退化。本 skill 只服务“两步走”场景。

## When to Use

- 已有 `feature-analysis` 输出。
- 已有 `feature-strategy` 输出，且明确这次是“两步走”。
- 已有 `feature-deprecation` 输出，且仓库已经在中间态上可运行，或仓库需要直接接入新方案。
- 需要统一 `src/i18n` 目录、语言码、fallback、抽词命令。
- 需要明确组件、路由、常量、枚举、消息提示等不同场景的写法。

## Target Contract

1. 目录统一到 `src/i18n`
2. 语言包统一到 `src/i18n/locales/*.json`
3. 非组件文件通过 `trans()` 标记词条
4. 组件通过 `t/$t`
5. 语言切换由独立 store 管理
6. Element Plus locale 映射与业务语言同步
7. 输入分支不再依赖旧 runtime 才能正常运行

## Workflow

1. 读取输入
   - 新方案文档
   - 旧资产映射
   - 已脱钩的中间态源码
   - 语言种类、fallback、Element locale 需求

2. 建立新骨架
   - `src/i18n/index.ts`
   - `src/i18n/messages.ts`
   - `src/i18n/utils.ts`
   - `src/i18n/locales/*.json`
   - `i18n-extract.config.ts`

3. 定义消费边界
   - 组件：`t/$t`
   - 路由、常量、枚举：`trans`
   - 提示消息、运行时文本：触发时调用 `t`

4. 迁移旧资产
   - 将旧 TS 词典转换为 locale JSON
   - 将旧语言码统一为 `zh-CN`、`en-US` 之类的运行时格式
   - 只在必要时保留临时兼容 helper

5. 输出模板
   - 给 agent 用的迁移计划
   - 给人类看的最终源码示例

## Guardrails

- 不把旧 `src/lang` 直接原封不动搬到 `src/i18n`。
- 不跳过退化中间态直接在旧 runtime 上叠新 runtime。
- 不在一步到位场景下复用本 skill。
- 不延续旧语言码如 `zh-cn`、`en`，除非仓库有强制兼容约束。
- 不在常量文件里直接调用 `i18n.global.t`。
- 不把用户输入内容混入静态词条抽取体系。

## Deliverables

- `README.md`
- 新结构模板
- `microfb` 迁移后示例源码
- 迁移顺序文档

## MVP Template

优先阅读：

- `template/microfb-migration-plan.md`
- `template/microfb/target/src/i18n`
- `template/microfb/target/src/components/LangSelect/index.vue`
