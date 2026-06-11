---
name: i18n迁移总入口
description: 当需要在 nebula 仓库中判断当前 i18n 状态、选择正确意图 skill，并允许 agent 通过多轮观察与收敛继续推进时使用。
---

# i18n迁移总入口 Agent Skill

## RED

- 没有这个父 agent 时，用户会把“分析、策略、总编排、单次功能路由”混在一次请求里
- agent 容易直接跳到某个功能节点，跳过 `analysis_required` / `analysis_optional` 判断
- 结果通常是：
  - 在链路事实不足时过早进入实现层
  - 把需要多轮推进的问题错误压成一次性 router
  - 把需要总方案比较的问题错误收缩成单节点建议

## 适用场景

- 用户要处理旧 i18n 链路、退化旧方案、接入新方案，或清理迁移中间态
- 当前仓库状态不明确，必须先判断是纯硬编码、旧 runtime 残留、已退化中间态，还是已经进入新方案收口
- 任务需要多轮推进，而不是一次性固定走完整条链

## 输入契约

至少要拿到：

- `目标仓库根目录`
- `目标模块 / 页面 / 组件范围`
- `目标结果`
- `是否允许多轮人工确认`

若用户没有明确回答 `是否允许多轮人工确认`，默认按以下策略执行：

- 可以继续做只读分析、状态判断和意图路由
- 不可以擅自把多步迁移压成一次性执行方案
- 只要后续节点需要裁决迁移路径、保留中间态或确认范围，就进入人工提问

## Agent 工作循环

每一轮都遵循：

1. 观察
2. 判断
3. 选择当前意图 skill
4. 验证事实是否足够
5. 继续、切换节点或提问

每一轮必须显式产出：

- `currentUnderstanding`
- `repoStateFacts`
- `goalUnderstanding`
- `analysisRequirement`
- `chainConfidence`
- `selectedIntentionSkill`
- `whyThisIntentionSkill`
- `alternativeIntentionSkills`
- `missingFacts`
- `humanQuestions`
- `nextIterationAction`

## 分析触发准则

以下情况归为 `analysis_required`：

- 用户无法描述当前 i18n 是如何工作的
- 无法确认是否存在旧 i18n runtime
- 无法确认是否已经处于迁移中间态
- 无法判断适合先退化再新增，还是边收敛边迁移
- 无法判断当前一步应该进入哪个功能 skill

以下情况可归为 `analysis_optional`：

- 用户明确给出当前仓库已无旧 i18n，只需新增新 i18n
- 用户明确指出某个功能点已经定位，例如只差 `qiankun` 语言桥接
- 已有前一轮分析产物，且 `chainConfidence` 足够高

`chainConfidence` 取值约束：

- `high`：已有直接源码事实或上一轮稳定分析产物支撑当前判断
- `medium`：已有部分事实，但仍需要在进入实现前补 1 轮确认
- `low`：当前只能提出假设，必须优先走分析或人工提问

## 状态分类

父 agent 必须先把仓库归到以下之一：

1. `no_i18n_hardcoded_only`
2. `legacy_i18n_runtime_present`
3. `detached_intermediate_state`
4. `new_runtime_present_boundary_incomplete`
5. `unclear_or_mixed_state`

## 意图 skill 调用规则

意图 skill 位于 `[[intention-skills/]]`，父 agent 只直接消费这一层：

- 当前链路不明确、用户也说不清现状，必须先进入 `[[intention-skills/分析-i18n链路]]`
- 用户只想还原现状、摸清链路，也进入 `[[intention-skills/分析-i18n链路]]`
- 想看总方案、改动面对比、推荐方案、前后链路：进入 `[[intention-skills/编排-i18n迁移]]`
  - 若链路事实不足，先补 `[[intention-skills/分析-i18n链路]]`
- 旧 i18n 改动面较大，推荐先退化旧 i18n，再新增新 i18n，且不保留长中间态：进入 `[[intention-skills/迁移-退化到新增-无中间态]]`
  - 若 legacy 复杂度尚未被证实，先补 `[[intention-skills/分析-i18n链路]]`
- 旧 i18n 改动面较小，推荐带着中间态逐步把旧 i18n 收敛到新 i18n：进入 `[[intention-skills/迁移-收敛旧到新-有中间态]]`
  - 若是否适合中间态尚不清楚，先补 `[[intention-skills/分析-i18n链路]]`
- 明确没有旧 i18n，或旧 i18n 已经彻底退化完成，只需要接入新 i18n：进入 `[[intention-skills/策略-新增新i18n]]`
- 当前已经明确只差某项能力，只需要选择某一个功能 skill：进入 `[[intention-skills/路由-选择功能子skill]]`
  - 若能力缺口判断依赖当前链路事实，先补 `[[intention-skills/分析-i18n链路]]`

## 人工介入门禁

以下情况必须先问人：

- 无法确认当前模块是“纯硬编码”还是“旧 i18n 链路残留”
- 仓库同时存在旧 runtime、新 runtime、临时 helper 和局部迁移，且事实不足以裁决主路径
- 用户目标是“全站 i18n”还是“只清旧链路”不清楚
- 是否允许保留部分接缝作为后续迁移资产不清楚

若 `是否允许多轮人工确认 = 否`，也不要跳过上述门禁；此时应输出：

- 当前能确认的最小事实集
- 仍阻断路由的缺口
- 需要用户一次性补齐的关键问题

## GREEN

- 顶层只做会话级判断、多轮路由、人工门禁与节点切换
- 真实分析、策略、编排与功能路由下沉到 `intention-skills/`
- 源码级执行能力下沉到 `feature-skills/`
- `分析-i18n链路` 既是可直接使用的意图 skill，也是横向公共前置能力

## 使用示例

```text
我说不清当前 i18n 怎么跑，也不知道下一步该进哪个技能，先帮我判断。
```

预期：先进入 `分析-i18n链路`

```text
给我几个迁移方案，比较改动面和推荐路径，我要决定这次怎么做。
```

预期：进入 `编排-i18n迁移`，必要时先补分析

```text
旧 i18n 很重，先退化掉，再规划新增新 i18n。
```

预期：进入 `迁移-退化到新增-无中间态`

```text
我接受中间态，只要改动面小，帮我规划逐步收口到新 i18n。
```

预期：进入 `迁移-收敛旧到新-有中间态`

```text
当前没有旧 i18n，只差把新 i18n 能力接起来。
```

预期：直接进入 `策略-新增新i18n`

```text
我不需要总方案，只想知道这一步是该改 locale、模板，还是 TS 运行时。
```

预期：进入 `路由-选择功能子skill`

```text
业务字段要接 I18nInput 存 JSON wire，或切换语言后菜单侧栏不更新。
```

预期：先 `路由-选择功能子skill` 判定：
- 表单未接 wire → `新增-i18nInput-表单字段`
- 读侧乱码 → `新增-i18nInput-读侧展示`
- 缓存投影 → `更新-i18nInput-缓存投影`

## 输出模板

单轮输出优先复用 `[[template/root-single-iteration-template.md]]`。

当需要解释“为什么先分析、为什么此时不能直接进功能 skill”时，可同时引用：

- `[[template/migration-routing-template.md]]`
- `[[template/orchestration-template.md]]`

## REFACTOR

- 如果父级仍表现成一次性 router，继续收紧 `analysis_required` / `analysis_optional` 判定
- 如果下游节点重复猜链路，优先补强 `分析-i18n链路` 的复用字段
- 如果意图节点选错率高，优先补根层路由判定表和 should-not-trigger 用例
