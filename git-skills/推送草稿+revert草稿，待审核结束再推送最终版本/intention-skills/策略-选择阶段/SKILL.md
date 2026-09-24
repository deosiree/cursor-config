---
name: 策略-选择阶段
description: 当已有流程现状快照，需要唯一判定 phase（推草稿 / 本地审查 / 审查中热修 / 发布最终 / 强推改路由 / blocked）时使用。
---

# 核心任务

根据用户意图 + [[../分析-流程现状/SKILL.md]] 快照，输出唯一 `phase`，并指出下一个编排节点。

## 判定表

| 条件 | `phase` | 下一编排 |
| --- | --- | --- |
| 用户要先推草稿给人看；草稿尚未稳妥在远端 | `push_draft` | [[../编排-推送草稿/SKILL.md]] |
| 草稿已在远端；要本地收回改动审查 / 建临时分支 reset | `local_review` | [[../编排-本地审查回滚/SKILL.md]] |
| 已在审查分支；发现草稿/CI bug，要先修到共享分支，再把草稿+热修**整包**收回本地审查 | `hotfix_during_review` | [[../编排-审查中热修草稿/SKILL.md]] |
| 审查完成（有最终提交或明确工作区终态）；要 revert + 上最终版 | `publish_final` | [[../编排-revert并推送最终版/SKILL.md]] |
| 用户明确要 force / force-with-lease 覆盖共享分支 tip | `handoff_force_push` | **STOP**（非本套件） |
| 意图是 merge 整支 / cherry-pick 部分 / 开沙盒 | `blocked`（改路由） | 指向邻近 skill |
| 关键事实不足（无 repo、publish 缺 draft SHA、热修缺 commit_message） | `blocked` | 追问 |

## 热修触发词（命中则优先 hotfix，而非 publish）

- 审查中发现 bug / CI 挂了先止血
- 先修远端，再把草稿和热修提交都收回本地审查
- 不要回到修 bug 前的改动 / 整包收回 / 基于已修复代码审查

## 规则

1. 同一轮只输出一个主 `phase`；用户说「整条链路做完」时可顺序规划，但仍按阶段逐步编排并设检查点。
2. `handoff_force_push` 不得进入任何会改写共享历史的 feature。
3. 若用户已在临时分支上且改动未提交，默认可走 `local_review`（继续审查）或 `hotfix_during_review`（先修远端）；以用户是否要「先推修复到 develop」区分。
4. 热修**不**改变已记录的 `draft_commit`；热修是共享分支上的新提交。

## 输出

`phase` | `nextOrchestration` | `reason` | `missingFields[]` | `handoffSkill`（若改路由）

## 边界

- 不执行 git 写操作
- 不代替编排节点做 CHECKPOINT 文案细节

## 使用示例

```text
现状：在 temp-review 上有 WIP；Jenkins 因缺 js-yaml 挂了，要先修 develop 再回来审查。
使用 $策略-选择阶段。
```
