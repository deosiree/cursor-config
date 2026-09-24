---
name: 策略-创建或删除
description: 当已有沙盒现状快照，需要根据用户话术判定走创建编排、安全删除编排，或改路由到 merge/cherry-pick 时使用。
---

# 核心任务

输出唯一 `intent`，并指定下一个 intention 节点；禁止直接执行 git 变更。

## 判定表

| 话术信号 | intent | 下一节点 |
| --- | --- | --- |
| 开沙盒、新建 worktree、并发分支、恢复 stash 到沙盒 | `create` | [[../编排-创建沙盒/SKILL.md]] |
| 删沙盒、拆掉 worktree、不要这条沙盒了、安全删除 | `delete` | [[../编排-安全删除沙盒/SKILL.md]] |
| merge 进 main/develop、收工合入再删临时分支 | `handoff_merge` | 邻近 merge skill |
| 只要中间几次 commit / 按顺序挑提交 | `handoff_cherry_pick` | 邻近 cherry-pick skill |
| 同时要开又要删且目标不清 | `blocked` | 追问后重判 |

## 冲突消解

1. 「删掉并合进 main」→ **先** `handoff_merge`，合入完成后再可选 `delete` 清残留 worktree。
2. 「开沙盒顺便实现某某功能」→ `create` 只负责生命周期；业务实现不在本套件。
3. 要删的名字命中 `develop`/`main`/`master` → `blocked`，禁止进入删除编排。

## 输出（必填 + 示例）

开沙盒：

```text
intent=create
reason=用户要求基于 develop 开 sibling 沙盒并恢复 stash
nextIntention=编排-创建沙盒
handoffTarget=
missingFields=
```

误触发 merge：

```text
intent=handoff_merge
reason=用户要整支合入主分支而非仅拆沙盒
nextIntention=
handoffTarget=merge临时分支到主分支并删除临时分支
missingFields=
```

## 边界

- 不调用 feature 节点。
- 缺 `repo` 或（删除时）缺 path/branch → `blocked` 追问。

## 使用示例

```text
现状已经看完了：用户说「devmgr 不要了，帮我安全删掉」。
使用 $策略-创建或删除。
```
