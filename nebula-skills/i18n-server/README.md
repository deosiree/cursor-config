# i18n-server

这是 nebula 体系的 i18n 迁移 skill 套件。

本套件采用 `写skill` 要求的本地中文模式：

- `frontmatter.name` 使用中文
- `frontmatter.description` 使用中文触发描述
- 根 `SKILL.md` 只消费意图层 skill，不直接消费源码功能层

根层验证口径采用“双文件、单事实源”：

- `evals/evals.json` 是 should-trigger / should-not-trigger 的主事实源
- `test-prompts.json` 是为达尔文式 `dry_run` / controlled-trial 复用的试跑镜像
- 两者语义必须保持一致；若只改一处，视为套件退化

## 目录结构

```text
i18n-server/
├─ SKILL.md
├─ README.md
├─ intention-skills/
├─ feature-skills/
├─ template/
├─ assets/
├─ references/
├─ evals/
├─ docs/
└─ errors/
```

各目录职责如下：

- `SKILL.md`
  顶层父 agent，负责观察、判断、提问与选择当前意图 skill
- `README.md`
  给维护者看的总说明
- `intention-skills/`
  分析、策略、编排、功能路由等意图层 skill
- `feature-skills/`
  具体源码级功能 skill，共享能力池
- `template/`
  根层路由与编排模板
- `assets/`
  few-shot、检查清单和 frontmatter 模板
- `references/`
  长篇方法论、历史台账和边界说明
- `evals/`
  根层 should-trigger / should-not-trigger 验证样例
- `docs/`
  i18n 方案、背景说明和约束文档
- `errors/`
  常见故障记录

## 节点分层

### intention-skills

- `分析-i18n链路`
- `迁移-退化到新增-无中间态`
- `迁移-收敛旧到新-有中间态`
- `策略-新增新i18n`
- `路由-选择功能子skill`
- `编排-i18n迁移`

这些节点都是意图层 agent，但职责不同：

- `分析-i18n链路`
  既可被用户直接消费，也可作为其他意图 skill 的公共前置能力
- `迁移-*`
  负责旧 i18n 仍存在时的策略判断
- `策略-新增新i18n`
  负责无旧 i18n 或旧 i18n 已彻底退化后的新增阶段
- `路由-选择功能子skill`
  负责单次功能路由，不承载总方案
- `编排-i18n迁移`
  负责多方案、改动面对比和推荐路径

### feature-skills

`feature-skills/` 是共享能力池，不隶属于某一个单独的意图 skill。

- 所有意图层节点都可以按需消费这些功能 skill
- 单个功能 skill 可以被多个意图层节点复用
- 当链路事实不足时，意图层节点应先依赖 `分析-i18n链路`，而不是直接猜功能落点
- 组件内 `t()` 与纯 TS 文件直接 `i18n.global.t(...)` 的消费边界已经拆分，路由时要区分组件上下文与全局实例上下文

## 分析作为横向公共能力

`分析-i18n链路` 不是只在“用户明确说要分析”时才使用。

它还承担以下公共前置能力：

- 为 `编排-i18n迁移` 提供方案矩阵的事实基础
- 为 `路由-选择功能子skill` 提供功能缺口判断的依据
- 为迁移类策略节点提供 legacy 复杂度、中间态风险和 readiness 证据

只有在以下事实已明确时，后续节点才可以跳过分析：

- 当前仓库已无旧 i18n
- 当前能力缺口已明确定位
- 已有高置信度的前一轮分析产物

## 使用方式

优先从 `i18n迁移总入口` 开始，让父 agent 先判断当前链路事实是否足够，再选择当前意图 skill。

如果用户已经非常明确：

- 只要链路分析：直接进入 `分析-i18n链路`
- 只要单次功能路由：直接进入 `路由-选择功能子skill`
- 只要多方案推荐：直接进入 `编排-i18n迁移`

父 agent 单轮输出结构见 `[[template/root-single-iteration-template.md]]`。

## 使用示例

```text
我不知道这个仓库当前 i18n 怎么跑，先帮我分析链路，再告诉我下一步更适合走哪条意图路径。
```

预期命中：`分析-i18n链路`

```text
帮我比较这个仓库接新 i18n 的几种方案，给出改动面、前后链路和推荐路径。
```

预期命中：`编排-i18n迁移`

```text
旧 i18n runtime 还很重，我不想长期保留中间态，先退化旧方案，再新增新 i18n。
```

预期命中：`迁移-退化到新增-无中间态`

```text
这个仓库 legacy 负担不算大，我接受中间态，想边迁边把旧 i18n 收敛到新方案。
```

预期命中：`迁移-收敛旧到新-有中间态`

```text
当前模块从来没接过 i18n，只想参考 microfb 第二阶段，规划新增新 i18n 的顺序。
```

预期命中：`策略-新增新i18n`

```text
我只想知道当前这一步最应该进哪个功能 skill，不需要总方案。
```

预期命中：`路由-选择功能子skill`
