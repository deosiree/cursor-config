---
name: 写skill
description: 当需要新建中文 skill、把旧 skill 升级为 agent 套件、拆分 intention-skills 与 feature-skills，或在 skill 落地后继续接入 Darwin 质量评估闭环时使用。
version: 2.0.0
tags: [skill, 写skill, agent, intention, feature, darwin, 质量评估]
metadata:
  hermes:
    category: development
    related_skills: [darwin-skill, write-skill-single]
---

# 目标
把 skill 工作收敛为：先判断任务类型，再路由最少必要子 skill，最后按需进入 Darwin 质量闭环。

## 何时使用
- 需要从 0 新建一个中文 skill 套件。
- 需要把旧单体 skill 升级为父级 agent skill。
- 需要把平铺子skill继续拆成 `[[intention-skills]]` 与 `[[feature-skills]]`。
- 需要对已写好的 skill 做质量评估、试跑或迭代优化。

## 何时不要使用
- 只是写一次性 prompt，不打算沉淀为 skill。
- 只是修业务代码，不涉及 skill 套件。
- 只是润色 README，不需要路由、模板、few-shot 或 evals。

## 输入契约
尽量提供：
- `targetPath`
- `skillTopic`
- `currentStructure`
- `goalState`
- `knownPainPoints`
- 是否允许引入 Darwin 评估闭环

以下关键事实缺失时，先停下来：
- 缺 `targetPath`，且无法稳定定位目标 skill
- 缺 `currentStructure`，无法判断是单文件、旧套件还是 agent 套件
- 缺 `goalState`，无法判断是新建、升级、拆层还是质量迭代
- 缺“是否允许引入 Darwin”，但请求又涉及评分、试跑或优化

## callback 约束
当前分层版 `write-skill` 受 `[[../write-skill-single/SKILL.md]]` 约束。

最低要求：
- 保留 `RED`、`GREEN`、`REFACTOR`
- 主 `SKILL.md` 与 `README.md` 都保留使用示例
- 子 skill 主文档不能空心化
- `template/`、`assets/`、`references/`、`evals/` 的职责边界清晰

细则见：`[[references/write-skill-single-guardrails.md]]`

## RED
1. 先识别失败基线，不要跳过现状判断。
2. 至少记录：
   - 典型用户会怎么提需求
   - 当前套件会漏掉什么
   - 误触发 / 不触发的主要原因
   - 产物结构最不稳定的部分
3. 先进入 `[[intention-skills/分析-skill现状/SKILL.md]]`


### 🛟 失败模式与 fallback 树

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| targetPath 无法定位 | 询问用户确切路径 | 提示用户提供绝对路径 |
| skillTopic 超出路由范围 | 退化为"通用 skill 新建"流程 | 提示用户当前 skill 分类不存在 |
| currentStructure 判断错误 | 重新分析目录结构 | 要求用户明确当前结构类型 |
| Darwin 评估流程不可用 | 请求用户提供外部 darwin-skill | 退化到内部简化闭环（简化评分+半手动优化） |
| 子 skill 模板缺失 | 复用同类模板 | 提示用户手动创建 |

## GREEN
### 任务分类
- `new_single_skill`
- `legacy_skill_suite_upgrade`
- `parent_agent_skill_refactor`
- `intention_feature_split`
- `darwin_quality_iteration`

### 意图层路由
- 新建：`[[intention-skills/策略-新建skill/SKILL.md]]`
- 升级旧 skill：`[[intention-skills/策略-升级旧skill/SKILL.md]]`
- 主 skill agent 化：`[[intention-skills/迁移-主skill改造为agent/SKILL.md]]`
- 拆 intention / feature：`[[intention-skills/迁移-拆分意图层与功能层/SKILL.md]]`
- 反空心化门禁：`[[intention-skills/主文档反空心化验收/SKILL.md]]`
- 质量迭代：`[[intention-skills/编排-skill质量迭代/SKILL.md]]`

### 常用功能层
- `[[feature-skills/子skill路由决策/SKILL.md]]`
- `[[feature-skills/模板类型判定/SKILL.md]]`
- `[[feature-skills/历史版本回填为few-shot/SKILL.md]]`
- `[[feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-基于RED写before/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-基于GREEN写after/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-写mvp/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-写snapshot/SKILL.md]]`
- `[[feature-skills/references与evals补全/SKILL.md]]`
- `[[feature-skills/Markdown格式规范收尾/SKILL.md]]`
- `[[feature-skills/darwin质量评估与迭代/SKILL.md]]`
- `[[feature-skills/Darwin-集成评估闭环/SKILL.md]]`

## Darwin
当请求明确涉及“质量评估 / 试跑 / keep or revert / 持续优化”时，才进入 Darwin 分支。

桥接与回退下沉到：
- `[[intention-skills/编排-skill质量迭代/SKILL.md]]`
- `[[feature-skills/darwin质量评估与迭代/SKILL.md]]`

如果用户只要求评分或 baseline，优先走 `evaluate-only`，不默认进入优化循环。


## 🚫 反模式

| 反模式 | 为什么错 | 正确做法 |
|--------|---------|---------|
| 跳过当前技能现状分析 | 不知道起点就无法规划路径 | 先进入 `分析-skill现状` |
| 不确认输入契约就开始写 | 缺 targetPath 或 goalState 则路径不稳定 | 缺关键事实先停下来问清楚 |
| 模板只写说明壳不写样本 | 说明壳无法当作 few-shot 使用 | template/ 下必须有实体样本 |
| 跳过 Darwin 评估直接交付 | 无质量门禁的 skill 不稳定 | 默认接入 Darwin 评估闭环 |
| 主 skill 承载过多细节 | 入口膨胀后子 skill 空心化 | 主 skill 保持精简，细节下沉到子 skill |
| 未拆 intention/feature 直接堆 | 路由不收敛，子 skill 平铺混乱 | 先拆 intention 层(判断)和 feature 层(执行) |

## REFACTOR
优先重构结构，而不是继续堆主入口：
- 主文件开始承载低频解释、长示例或 Darwin 细编排
- 节点已经存在，但中间层不承担判断职责
- 模板只有说明壳，没有实体样本或结构说明
- 功能已经拆开，但路由仍不收敛

## 🔴 CHECKPOINT · 人工门禁

以下情况必须先停下来确认：

| 节点 | 检查点动作 | 视觉标记 |
|------|-----------|---------|
| 目标识别模糊 | 无法稳定识别唯一目标 skill | 🔴 STOP |
| 请求混杂 | 混入 skill 套件改造与无关修改 | 🔴 CHECKPOINT |
| 单点补强 | 用户只要求单点补强 `few-shot`/`template`/`evals` | 🔴 CHECKPOINT |
| 评估限制 | 用户明确限制只评估不优化或不引入 Darwin | 🔴 STOP |
| 模板空壳 | 模板层只有说明壳，无真实历史样本 | 🔴 STOP |
| 关键事实缺失 | 缺 targetPath/currentStructure/goalState | 🔴 CHECKPOINT |
## 输出契约
每轮至少输出：
- `currentUnderstanding`
- `skillTaskClassification`
- `selectedSubskills`
- `artifactsPlan`
- `qualityGatePlan`
- `nextIterationAction`
- `missingFacts`
- `humanGateReason`

若进入 Darwin，再输出：
- `darwinIntegrationMode`
- `templateModelDecision`
- `baselinePlan`
- `trialPlan`
- `keepOrRevertRule`
- `suiteCompletionStage`

## 使用示例
```text
使用 $写skill 把 F:\Documents\Repertory\Sieyuan\nebula\.cursor\agent-skills\legacy-skill
升级为父级 agent + intention-skills + feature-skills 套件，
主 SKILL.md 保持精简，并在需要时接入 Darwin 评估。
```


## 实跑示例

### 示例1：新建 agent 套件

用户：`帮我写一个 Python 代码审查 skill`

执行路径：
1. 策略-新建skill → 确认 targetPath 和 skillTopic
2. 子skill路由决策 → 选最少必要子skill（intention: 分析-代码风格 + feature: 审查-代码扫描）
3. 编写 SKILL.md（RED: 漏检模式 + GREEN: 审查流程）
4. 模板类型判定 → mvp（最小可用）+ snapshot（完整用例）
5. references与evals补全 → 测试 prompt 3条
6. Darwin-集成评估闭环 → baseline 评分 → results.tsv 记录

### 示例2：旧 skill 升级

用户：`把旧的 proofreading skill 升级为 agent 套件`

执行路径：
1. 分析-skill现状 → 确认是单文件 skill
2. 策略-升级旧skill → 拆 intention: 分析-文本类型 + feature: 执行-拼写检查
3. 主SKILL瘦身与下沉 → 保留路由入口
4. Darwin-集成评估闭环 → baseline → 优化 → keep/revert
