---
name: 策略-新增新i18n
description: 当当前模块没有旧 i18n，或旧 i18n 已完全退化完成，只需要规划并接入新 i18n 时使用。
---

# 策略-新增新i18n

## RED

- 没有本节点时，agent 容易把“已无旧 i18n”的场景误送到 `[[../迁移-退化到新增-无中间态]]`
- 也容易把“已经进入新增阶段”的问题误收缩成 `[[../路由-选择功能子skill]]` 的单次功能选择
- 结果是：
  - 要么继续讨论 legacy 迁移，无法进入新增阶段
  - 要么只选出 1 个功能节点，缺少新增阶段的整体能力顺序

## GREEN

- 本节点只处理“没有旧 i18n，或旧 i18n 已完全退化后”的新增阶段
- 若事实不足，先消费 `[[../分析-i18n链路]]`，拿到 `newI18nReadinessAssessment`
- 进入本节点后，必须产出：
  - 新增阶段证据
  - `featureSkillSequence`
  - 顺序理由
  - 前后链路
  - 验证点与停止条件

## REFACTOR

- 若误触发到 legacy 仍存在的场景，优先收紧适用场景与 should-not-trigger
- 若 agent 只给功能节点名单、不说明顺序理由，优先补 `[[assets/skill-output-checklist.md]]`
- 若用户明明需要的是单次节点选择或多方案比较，优先回退到：
  - `[[../路由-选择功能子skill]]`
  - `[[../编排-i18n迁移]]`
- 不要把模板正文搬回主 `SKILL.md`

## 适用场景

- 当前模块从未接过 i18n
- 或旧 i18n 已完全退化掉
- 接下来只需要接入和收口新 i18n

## 前置要求

- 若 `newI18nReadinessAssessment` 不明确，先消费 `[[../分析-i18n链路]]`
- 若仍存在旧 i18n 运行时证据，不应直接使用本节点

## 输出契约

- `strategyGoal`
- `currentNoLegacyStateEvidence`
- `candidateFeatureSkills`
- `recommendedFeatureSkillSequence`
- `whyThisSequence`
- `whyNotLegacyRelatedStrategies`
- `verificationPlan`
- `stopCondition`

## 默认推荐能力序列

以下顺序用于参考，不要求每次都全走：

1. `[[../../feature-skills/新i18n-安装插件]]`
2. `[[../../feature-skills/新i18n-样板代码]]`
3. `[[../../feature-skills/新i18n-基座-语言选择器]]` 或 `[[../../feature-skills/新i18n-微服务-语言选择器]]`
4. `[[../../feature-skills/新i18n-补充翻译json]]`
5. `[[../../feature-skills/新i18n-Vue模板中使用$t()]]`
6. `[[../../feature-skills/新i18n-纯ts中用i18n.global.t]]`
7. `[[../../feature-skills/新i18n-ts或script setup中使用t(),可以包变量]]`
8. 按需进入 `trans` / 动态拼接 / wrapper 清理相关功能 skill
9. 用户可编辑入库字段接 I18nInput：`[[../../feature-skills/新增-i18nInput-表单字段]]`
10. wire 已有、读侧展示：`[[../../feature-skills/新增-i18nInput-读侧展示]]`
11. 导航缓存双字段投影：`[[../../feature-skills/更新-i18nInput-缓存投影]]`（通常在 9→10 之后）

## Guardrails

- 不允许在仍存在旧 i18n runtime 时直接判定为“新增阶段”
- 不允许把 legacy 迁移策略再次混入本节点
- 必须给出为什么当前可以跳过 legacy 相关策略的证据

## 使用示例

```text
当前仓库已经没有旧 i18n，只需要规划新增新 i18n 的能力顺序。
```

```text
参考 microfb 退化后的第二阶段，告诉我新增新 i18n 先做哪些节点。
```

```text
我不确定旧 i18n 是否已经完全退化，如果分析结果显示已经退化完了，再帮我进入新增新 i18n 阶段。
```
