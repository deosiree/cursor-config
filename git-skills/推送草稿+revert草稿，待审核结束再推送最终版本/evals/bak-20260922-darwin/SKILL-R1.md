---
name: 推送草稿+revert草稿，待审核结束再推送最终版本
description: 当需要在共享分支（默认 develop）先推草稿给人看，再在本地临时分支 reset 收回改动做审查，审查结束后用 revert 消除远端草稿效果并 push 最终版时使用。触发词：推草稿、revert 草稿、本地审查后再推、草稿给后端看、临时分支 reset、最终版上 develop。不要用于：特性分支 force-with-lease 覆盖、reset --hard、整支 merge 删分支、只挑部分 commit、开/删 worktree 沙盒、批提交文案。
---

# 目标

把「共享分支草稿可见 → 本地可审查重构 → 远端 revert 后再上最终版」收敛为可路由的父级 agent。主文件只做触发、边界与阶段路由；执行下沉到 `intention-skills` / `feature-skills`。

## 一句话

共享分支先推草稿 → 临时分支 `reset` 审查 → `revert` 草稿 → 再 push 最终版；**禁止强推抹历史**。

## 何时使用

- 草稿要尽快让后端/同事在共享分支上看到
- 之后还要在本地大量去冗余、改命名，不想立刻把最终版定死
- 共享分支不允许 force push，必须用 `revert` + 新提交

## 何时不要使用

- 私有特性分支可用 `git push --force-with-lease` 覆盖 tip（非本套件）
- 草稿尚未 push，只需本地 `reset` / 改 commit
- 用户要 `reset --hard` 丢改动
- 整支合入并删临时分支 → [[../merge临时分支到主分支并删除临时分支/SKILL.md]]
- 只要部分 commit → [[../按顺序cherry-pick到其他分支/SKILL.md]]
- 开/删 worktree 沙盒 → [[../创建沙盒分支/SKILL.md]]

## 输入契约（父级）

缺关键字段且无法从现状推断 → **🛑 STOP** 追问：

| 字段 | 必填场景 | 默认 |
| --- | --- | --- |
| `repo` | 全程 | — |
| `shared_branch` | 全程 | `develop` |
| `draft_commit` | `local_review` 之后、`publish_final` | 推草稿后必须记下 |
| `temp_branch` | `local_review` / `publish_final` | 如 `temp/review-after-draft` |
| `final_commit` | `publish_final` | 临时分支上的最终 tip |
| `phase` | 可推断 | 见策略节点 |
| `push` | 推草稿 / 推最终 | 须用户明确或检查点确认 |
| `draft_commit_count` | 多 commit 草稿 | `1` |

## 硬约束

1. 禁止对共享分支使用 `--force` / `--force-with-lease`。
2. 禁止 `git reset --hard`（会丢掉审查所需改动）。
3. `git revert` 必须使用已记录的**草稿 commit SHA**（多 commit 则按新→旧依次 revert，或按用户授权的区间策略）。
4. 默认在临时分支上 `reset`（mixed）；`--soft` 仅当用户明确要求。
5. push 共享分支必须过 🔴 CHECKPOINT；冲突只走检查点，禁止擅自 abort 后强推。
6. 删除临时分支须在最终版已上共享分支并验收之后。

## 检查点总目录（父级必遵守）

任一写操作前，必须先输出对应确认块；未确认 → `status=awaiting_confirm`，禁止继续。

| ID | 触发阶段 | 确认块必含字段 | 未确认则禁止 |
| --- | --- | --- | --- |
| 🔴 CHECKPOINT-DRAFT-PUSH | `push_draft` | `repo`、`shared_branch`、`diff --stat` 摘要、commit message、`force=false` | `git push` |
| 🔴 CHECKPOINT-TEMP-RESET | `local_review` | `temp_branch`、`draft_commit`、`resetMode`∈{mixed,soft}、明确非 hard | `git reset` |
| 🔴 CHECKPOINT-REVERT | `publish_final` | `shared_branch`、`draft_commit`（可多 SHA）、将执行 `revert` 非 force | `git revert` |
| 🔴 CHECKPOINT-FINAL-PUSH | `publish_final` | `revertSha`（或说明）、`final_commit`、`shared_branch`、`force=false` | `git push` |
| 🔴 CHECKPOINT-DELETE-TEMP | `publish_final` 末 | `temp_branch`、最终版已在共享历史的证据、是否 `-D` | `branch -d/-D` |
| 🔴 CHECKPOINT-CONFLICT | revert/cherry-pick 冲突时 | 冲突文件列表、选项 continue / abort | 擅自 `--abort` 或改强推 |

确认块推荐格式（每检查点输出一次）：

```text
checkpoint: <ID>
phase: <phase>
fields:
  ...
ask: 确认后继续 / 取消
status: awaiting_confirm
```

细节与编排内文案见各 `intention-skills/编排-*`；**父级不得跳过本表**。

## RED / GREEN / REFACTOR

### RED

记录失败基线：用户会不会直接要求强推；是否漏记草稿 SHA；是否在 develop 上直接 reset 导致与 pull 搅在一起。

### GREEN

先 [[intention-skills/分析-流程现状/SKILL.md]] → [[intention-skills/策略-选择阶段/SKILL.md]] → 对应编排；命令细节只在 feature 节点。

### REFACTOR

父级变厚、编排与功能混写、README 丢「一句话」时，下沉到子节点并恢复边界表。

## 失败模式（三段式）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 用户要强推共享分支 | `phase=handoff_force_push`，解释改用 revert | 拒绝执行强推 |
| 缺 `draft_commit` 却要 publish | 从 reflog/对话追问 | `blocked` |
| 工作树脏且与当前阶段冲突 | 列路径，STOP | 用户清干净后再继续 |
| revert / cherry-pick 冲突 | CHECKPOINT，等用户选择 | 无授权不 abort、不强推 |
| 误在共享分支上长期 reset | 改走临时分支 | 报告分叉风险 |

## 路由表

| 用户意图 | 先走 | 再走 |
| --- | --- | --- |
| 推草稿给后端 / 先上 develop 一版 | [[intention-skills/分析-流程现状/SKILL.md]] | [[intention-skills/策略-选择阶段/SKILL.md]] → [[intention-skills/编排-推送草稿/SKILL.md]] |
| 本地收回改动审查 / reset 草稿提交 | 同上 | 策略 → [[intention-skills/编排-本地审查回滚/SKILL.md]] |
| 审查完了，revert 再推最终版 | 同上 | 策略 → [[intention-skills/编排-revert并推送最终版/SKILL.md]] |
| 要 force push 覆盖草稿 | 同上 | `handoff_force_push`：**STOP**，不执行 |
| 整支 merge / 只挑 commit / 开沙盒 | **改路由** 邻近 skill | — |

## 输出契约（每轮必出）

`currentUnderstanding` | `phase`∈{`push_draft`,`local_review`,`publish_final`,`handoff_force_push`,`blocked`} | `draftSha` | `tempBranch` | `finalSha` | `status`∈{`blocked`,`awaiting_confirm`,`in_progress`,`conflict`,`done`} | `nextAction` | `riskFlags`

### 输出样例（按 phase）

**push_draft 成功后：**

```text
currentUnderstanding: 草稿已推上 develop，供后端查看
phase: push_draft
draftSha: a1b2c3d4e5f6789012345678abcdef0123456789
tempBranch: n/a
finalSha: n/a
status: done
nextAction: 若要审查，进入 local_review（建临时分支并 reset）
riskFlags: []
```

**local_review 在 reset 后、最终提交前：**

```text
phase: local_review
draftSha: a1b2c3d4…
tempBranch: temp/review-after-draft
finalSha: n/a
status: in_progress
nextAction: 用户审查重构；完成后调用提交最终审查版
riskFlags: [local_behind_remote]
```

**publish_final 成功后：**

```text
phase: publish_final
draftSha: a1b2c3d4…
tempBranch: temp/review-after-draft
finalSha: f0e1d2c3…
status: done
nextAction: 无；远端历史应为 草稿→(同事)→revert→最终
riskFlags: []
```

**缺 draftSha 时：**

```text
phase: publish_final
status: blocked
nextAction: 请用户提供草稿 SHA，或从记录草稿SHA/对话历史找回
riskFlags: [missing_draft_sha]
```

## 使用示例

```text
草稿可以给后端看了，先 commit 并 push 到 develop，记下 SHA；
然后拉临时分支 reset 回来让我审查改命名。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

```text
审查提交已经在 temp/review-after-draft 上了。develop pull 后 revert 草稿 abc1234，
cherry-pick 最终版，push，再删临时分支。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

## 资源

- 检查清单：[[assets/执行检查清单.md]]
- few-shot：[[assets/few-shot-example/SKILL.md]]
- 边界：[[references/与邻近git-skills边界.md]]
- 为何 revert：[[references/为何用revert而非强推.md]]
- 触发用例：[[evals/触发用例.md]]
- 叙事样本：[[template/示例-develop草稿后审查再最终版.md]]
