---
name: 策略-选择阶段
description: 当已有流程现状快照，需要唯一判定 phase（推草稿 / 本地审查 / 审查中热修 / 收回本地待成对publish / 发布最终 / 强推改路由 / blocked）时使用。
---

# 核心任务

根据用户意图 + [[../分析-流程现状/SKILL.md]] 快照，输出唯一 `phase`，并指出下一个编排节点。

## 判定表

| 条件 | `phase` | 下一编排 |
| --- | --- | --- |
| 用户要先推草稿给人看；草稿尚未稳妥在远端 | `push_draft` | [[../编排-推送草稿/SKILL.md]] |
| 草稿已在远端；要本地收回改动审查 / 建临时分支 reset（**不**撤远端） | `local_review` | [[../编排-本地审查回滚/SKILL.md]] |
| 已在审查分支；发现草稿/CI bug，要先修到共享分支，再把草稿+热修**整包**收回本地审查 | `hotfix_during_review` | [[../编排-审查中热修草稿/SKILL.md]] |
| 远端继续展示待审最新版；把该版改动**收回本地审**；审完后再成对推 `revert:`+F（**本阶段不推 revert**） | `revert_and_reclaim` | [[../编排-revert并收回本地审查/SKILL.md]] |
| 审查完成；要成对推 `revert:`（若尚未在远端）+ 最终版 | `publish_final` | [[../编排-revert并推送最终版/SKILL.md]] |
| 用户明确要 force / force-with-lease 覆盖共享分支 tip | `handoff_force_push` | **STOP**（非本套件） |
| 意图是 merge 整支 / cherry-pick 部分 / 开沙盒 | `blocked`（改路由） | 指向邻近 skill |
| 关键事实不足 | `blocked` | 追问 |

## 三易混对照（判 phase 前先看）

| | `local_review` | `revert_and_reclaim` | `publish_final` |
| --- | --- | --- | --- |
| 改远端？ | 否 | **否**（远端仍显示待审最新） | **是**：连续推 `revert:` + F |
| 上最终版？ | 否 | 否 | 是 |
| 关键词 | 本地 reset / 远端别动 | 收回本地审 / 审完再成对推 revert+F / **现在别推 revert** | 审完了 / 推最终 |
| 错误路径 | — | 审前就推 `revert:` → 他人立刻看到旧码 | 只推 F 不 revert |

## 热修触发词（命中则优先 hotfix）

- 审查中发现 bug / CI 挂了先止血
- 先修远端，再把草稿和热修提交都收回本地审查

## revert_and_reclaim 触发词（优先于「审前推 revert」误读）

- 远端先保持最新；改动拿回本地审；审完再推 revert 和最终版
- revert 先别 push / 只落到本地审查
- 与 `publish_final` 区分：后者才推 `revert:` + F
- 若用户坚持「现在就推 revert 让远端变旧」→ 警告后仍建议本 phase；仅当用户明确接受他人看到旧码才另议（默认 STOP 劝改）

## 规则

1. 同一轮只输出一个主 `phase`。
2. `handoff_force_push` 不得进入改写共享历史的 feature。
3. `revert_and_reclaim` **不得**调用会 push 共享分支的节点。
4. 用户说「revert 并立刻推最终版」→ `publish_final`；「先收回本地审、先别推」→ `revert_and_reclaim`。

## 输出

`phase` | `nextOrchestration` | `reason` | `missingFields[]` | `handoffSkill`

## 边界

- 不执行 git 写操作

## 使用示例

```text
远端保持最新待审版；我把这一版收回本地审，审完再一起推 revert: 和最终版。现在不要推 revert。
使用 $策略-选择阶段。
```
