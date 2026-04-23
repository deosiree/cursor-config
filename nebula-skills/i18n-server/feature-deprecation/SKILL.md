---
name: feature-deprecation
description: Use when an existing frontend repository already has an i18n implementation and it must be retired, renamed, or backed up before adopting the unified i18n-server migration scheme
---

# Feature Deprecation

## Overview

这个 skill 用来把“旧 i18n 运行方案”退化成“可审计、可回溯、可复用的遗产资产层”。核心不是先改目录，而是先基于 `feature-analysis` 产出的旧链路说明，识别真实依赖，再让源码消费侧脱离旧 runtime，回归到可以单独验证的硬编码/静态常量中间态，最后冻结旧资产。

## When to Use

- 仓库里已经有 `vue-i18n`、自建 `lang` 目录、语言 store、路由翻译 helper。
- 新方案要求统一目录、统一语言码、统一抽词规则。
- 你需要分批落地：先退化并验证当前开发环境，再单独提交，然后再执行迁移。
- 你不想直接删除旧词条，因为新方案仍可能复用它们。
- `feature-analysis` 已经完成，旧链路已有时序图和源码落点表。

## Required Outputs

1. 旧 i18n 入口盘点
2. 旧链路依赖确认
3. 消费侧脱钩方案
4. store 去翻译化方案
5. 退化动作决策表
6. 备份命名方案
7. 可复用词条资产映射
8. 交给 `feature-migration` 的迁移契约

## Workflow

1. 读取前置分析
   - 必须先读取 `feature-analysis` 的时序图和源码落点表。
   - 如果没有旧链路分析，先停下并补做分析，不允许直接退化。

2. 识别旧入口
   - 查找 `createI18n`、`useI18n`、`i18n.global.t`、语言包目录、语言 store、路由翻译 helper。
   - 不只看 `src/lang`，也看 `constants`、`utils`、`router`、`stores`。

3. 识别消费侧依赖
   - 列出组件层的 `t/$t`。
   - 列出非组件层的 `i18n.global.t`、`translateXXX`、语言常量 helper。
   - 列出 store 中直接或间接依赖翻译结果的逻辑。

4. 结合链路做退化切口判断
   - 根据时序图判断哪个参与者是 runtime 核心入口，哪个参与者是高风险双写点。
   - 根据源码落点表确认变量/函数/文件的真实依赖，不凭经验推断。

5. 脱钩消费侧
   - 非组件层稳定文本优先回归到硬编码或静态常量。
   - 路由、菜单、枚举、表头、导航文案这类稳定文本，先停止依赖旧 runtime。
   - 组件层如需分批保守推进，可暂时保留直接显示文本，但不得继续扩大旧 `t()` 使用面。
   - 这一阶段的目标是“移除旧 runtime 的消费依赖”，不是“引入新方案”。

6. store 去翻译化
   - store 只保留语言状态、语言切换动作、持久化逻辑。
   - store 不再依赖 `useI18n()`，也不缓存翻译后的文案。
   - 所有翻译结果必须回到组件渲染层或后续新 i18n utility 层。

7. 划分资产类型
   - 运行时入口：必须退化。
   - 词条资产：尽量保留。
   - 业务常量：先收口为静态常量，再交给迁移 skill。
   - 组件消费点：如仍保留，必须明确是临时中间态。

8. 设计退化方式
   - 删除：无复用价值、纯运行时胶水代码。
   - 改名备份：可能被新方案继续消费的语言包、旧 helper。
   - 只读保留：作为迁移对照样本的源码。

9. 生成退化契约
   - 旧目录改名建议，例如 `src/lang-legacy`。
   - 旧 helper 改名建议，例如 `src/utils/i18n-legacy.ts`。
   - 中间态源码形态：哪些文本已回归硬编码，哪些已收口为静态常量。
   - 词条可复用清单。
   - 需要新方案补齐的空白点。

10. 交接给迁移 skill
   - 明确哪些资产将被 `feature-migration` 直接消费。
   - 明确哪些旧 key 需要平铺或改写成新 JSON 结构。
   - 明确迁移前提：当前仓库已经在“无旧 runtime 依赖”的中间态上可正常运行。

## Guardrails

- 不在这个 skill 里定义新 runtime 目录结构。
- 不在没有旧链路时序图的情况下直接开始退化。
- 不把旧方案和新方案耦合在一个步骤里。
- 不直接从旧 `t()` 切到新 `t()`，中间必须先有可验证的脱钩态。
- 不让 store 继续持有翻译文案或依赖 `useI18n()`。
- 不直接丢弃旧词条资产，除非确认无复用价值。
- 退化不是“删除全部”，而是“降低运行地位，提升审计可见性”。

## Deliverables

- `README.md`
- 盘点清单
- 旧链路依赖确认单
- 消费侧脱钩清单
- 资产映射模板
- `microfb` 前后示例源码

## MVP Template

优先阅读：

- `template/microfb-deprecation-checklist.md`
- `template/microfb/before`
- `template/microfb/after`
