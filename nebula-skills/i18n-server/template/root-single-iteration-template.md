# 父 agent 单轮输出模板

## 输入摘要

- `userRequest`：
- `repoScope`：
- `targetGoal`：
- `allowHumanConfirmation`：

## 单轮判断结果

- `currentUnderstanding`：
- `repoStateFacts`：
  - 事实 1：
  - 事实 2：
- `goalUnderstanding`：
- `analysisRequirement`：
  - `analysis_required` / `analysis_optional`
- `chainConfidence`：
  - `high` / `medium` / `low`

## 当前路由决策

- `selectedIntentionSkill`：
- `whyThisIntentionSkill`：
- `alternativeIntentionSkills`：

## 阻塞与提问

- `missingFacts`：
- `humanQuestions`：

若 `allowHumanConfirmation` 未明确或为“否”，仍要给出：

- 当前能确认的最小事实集
- 若不补事实会导致什么误判

## 下一步动作

- `nextIterationAction`：
- 是否继续留在根层：
- 是否切到下游意图节点：
