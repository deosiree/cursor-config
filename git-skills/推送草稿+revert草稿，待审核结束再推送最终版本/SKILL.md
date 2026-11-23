---
name: 推送草稿+revert草稿，待审核结束再推送最终版本
description: 当需要在共享分支（默认 develop）先推草稿给人看，再在本地临时分支 reset 收回改动做审查；审查中可热修远端 bug 再整包收回；也可在远端继续展示待审最新版的同时把改动收回本地审，审完后成对推送 revert: 与最终版时使用。触发词：推草稿、revert 草稿、收回本地审、审完再成对推 revert 和最终版、审查中热修、整包收回、最终版上 develop。不要用于：force-with-lease、reset --hard、审前单独推 revert 让远端变旧、整支 merge、只挑 commit、开/删沙盒、批提交文案。
---

# 目标

把「共享分支草稿可见 → 本地可审查 →（可选）热修后整包收回 →（可选）远端保持待审最新、改动收回本地审 → 审完成对推 revert: + 最终版」收敛为可路由的父级 agent。主文件只做触发、边界与阶段路由；执行下沉到 `intention-skills` / `feature-skills`。

## 一句话

共享分支先推草稿 → 临时分支 `reset` 审查 →（可选）热修后整包收回 →（可选）远端**保持**待审最新、改动收回本地审 → 审完后成对推 `revert:` + 最终版；**禁止强推；禁止审前单独推 revert。**

## 阶段速查（防混淆）

| 你在说什么 | phase | 回来审查时工作区应是 |
| --- | --- | --- |
| 先给人看一版 | `push_draft` | — |
| 草稿收回来改命名/去冗余（远端不动） | `local_review` | 仅草稿 B 的改动（`reset` 后） |
| CI/bug 先修到 develop，再审**全部**相关提交 | `hotfix_during_review` | **`draft^..series_tip` 整包**（含热修）；**不是**修 bug 前的 stash |
| 保护分支撤远端上一版，改动拿回本地先审 | `revert_and_reclaim` | **`draft^..series_tip` 整包**；**远端 tip 不变**（仍显示待审最新） |
| 审完了上最终版 | `publish_final` | 干净树；**成对**推 `revert:`（若尚未）+ cherry-pick final |

热修回路口令：`stash(仅切分支) → 修并 push → checkout -B temp tip → reset draft^ → 默认 drop 旧 stash`。

revert+收回口令（**本阶段不推**）：`记下 series_tip → 只 reclaim（reset draft^）→ 停在临时支审查`。  
审完 publish 口令：`pull → revert:…（新→旧）→ cherry-pick F → 双推（两笔都在审后才上远端）`。

## 三易混 phase（一眼对照）

| | `local_review` | `revert_and_reclaim` | `publish_final` |
| --- | --- | --- | --- |
| 远端 tip | **不变** | **不变**（继续显示待审最新） | 追加 `revert:` + F |
| 本地工作区 | 仅草稿 B（或继续审） | `draft^..series_tip` 整包 | 干净树再 cherry-pick F |
| 用户口头 | 「远端先别动，我本地 reset」 | 「远端保持最新；收回本地审；审完再成对推 revert+F」 | 「审完了，推最终版」 |
| 下一步 | 审 / 热修 / 日后 publish | 审完 → `publish_final`（成对推） | 删临时分支 |
| **禁止** | — | **审前推 `revert:`**（他人会立刻看到旧码） | 只推 F 漏 revert |

## 何时使用

- 草稿要尽快让后端/同事在共享分支上看到
- 之后还要在本地大量去冗余、改命名，不想立刻把最终版定死
- 审查中发现草稿/CI bug：先把修复推到 develop，再把草稿与热修的**全部改动**收回本地做整批审查优化
- 保护分支不能改远端历史：只能推 `revert:` 回滚上一版，并把改动拿回本地先审，审完再上最终版
- 共享分支不允许 force push，必须用对**草稿系列**的 `revert` + 新最终提交

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
| `draft_commit` | `local_review` 之后、热修、`revert_and_reclaim`、`publish_final` | 推草稿后必须记下（系列起点） |
| `series_tip` / `commitsInSeries` / `pre_revert_tip` | 热修收回、`revert_and_reclaim`、`publish_final` | tip 默认热修后或回滚前共享 tip；须确认无他人夹杂 |
| `temp_branch` | `local_review` / `hotfix_during_review` / `revert_and_reclaim` / `publish_final` | 如 `temp-review-after-draft-…` |
| `final_commit` | `publish_final` | 临时分支上审查优化后的最终 tip |
| `commit_message` | `hotfix_during_review` | — |
| `hotfix_paths` | （旧路径字段，可选） | 整包收回后通常不需要按文件拷贝 |
| `push_remotes` | 热修 / 推草稿 / 推 revert / 推最终 | `origin` +（存在则）`upstream` |
| `phase` | 可推断 | 见策略节点 |
| `push` | 推草稿 / 热修 / 推 revert / 推最终 | 须用户明确或检查点确认 |
| `draft_commit_count` | 多 commit 草稿 | `1` |

## 硬约束

1. 禁止对共享分支使用 `--force` / `--force-with-lease`。
2. 禁止 `git reset --hard`（会丢掉审查所需改动）。
3. `git revert` 必须使用已记录的**草稿系列 SHA**（含 B 与热修 H…，新→旧）；**热修 SHA ≠ 草稿 SHA，但 publish / midstream revert 时两者都要 revert**。
4. 保护分支回滚只能**追加** `revert:` 提交，不能改写已推送历史；且 **`revert:` 与最终版 F 须在审核通过后的 `publish_final` 成对推送**，禁止审前单独推 `revert:`（否则他人统编立刻看到旧码）。
5. 默认在临时分支上 `reset`（mixed）；`--soft` 仅当用户明确要求。
6. push 共享分支必须过 🔴 CHECKPOINT；冲突只走检查点，禁止擅自 abort 后强推。
7. 删除临时分支须在最终版已上共享分支并验收之后。
8. 热修**禁止** `commit --amend` 已推送草稿；禁止在脏审查分支上裸 `checkout` 丢 WIP（须先 stash）。
9. 热修返回审查 / midstream reclaim：**禁止**把审查基线恢复成「修 bug 前的旧 stash WIP」；必须把 `draft^..series_tip` 整包收回工作区。
10. `revert_and_reclaim`：**只 reclaim，不 push**；远端 tip 保持待审最新。

## 检查点总目录（父级必遵守）

任一写操作前，必须先输出对应确认块；未确认 → `status=awaiting_confirm`，禁止继续。

| ID | 触发阶段 | 确认块必含字段 | 未确认则禁止 |
| --- | --- | --- | --- |
| 🔴 CHECKPOINT-DRAFT-PUSH | `push_draft` | `repo`、`shared_branch`、`diff --stat` 摘要、commit message、`force=false` | `git push` |
| 🔴 CHECKPOINT-TEMP-RESET | `local_review` | `temp_branch`、`draft_commit`、`resetMode`∈{mixed,soft}、明确非 hard | `git reset` |
| 🔴 CHECKPOINT-HOTFIX-STASH | `hotfix_during_review` | `temp_branch`、脏文件摘要；告知回来后**不**以该 stash 为审查基线 | `stash` / 切分支 |
| 🔴 CHECKPOINT-HOTFIX-PUSH | `hotfix_during_review` | `shared_branch`、`commit_message`、`diff --stat`、`push_remotes`、`force=false`、非 amend 草稿 | `git push` |
| 🔴 CHECKPOINT-RECLAIM-SERIES | `hotfix_during_review` 末 / `revert_and_reclaim` | `draft^..series_tip` 列表、将 `reset` 到 `draft^`；revert_and_reclaim 须写明**不 push、远端保持待审最新** | mixed reset 收回 |
| 🔴 CHECKPOINT-REVERT | `publish_final` | 系列 SHA（新→旧）、将执行 `revert`；若已在远端则注明跳过 | `git revert` |
| 🔴 CHECKPOINT-REVERT-PUSH | `publish_final`（与 FINAL-PUSH 可合并确认） | `revert:` 文案、`force=false`；须与最终版**同次发布**推送 | 单独 push 仅 revert（审前） |
| 🔴 CHECKPOINT-FINAL-PUSH | `publish_final` | `revertSha`（或本会话将推的 revert）、`final_commit`、`force=false` | `git push` |
| 🔴 CHECKPOINT-DELETE-TEMP | `publish_final` 末 | `temp_branch`、最终版已在共享历史的证据、是否 `-D` | `branch -d/-D` |
| 🔴 CHECKPOINT-CONFLICT | revert/cherry-pick 冲突，或 reclaim 后用户强行 pop 旧 stash 冲突 | 冲突文件、continue/abort；**默认不 pop 热修前 stash** | 擅自 abort 后强推 / hard reset |

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

记录失败基线：强推；漏记草稿 SHA；develop 上裸 reset；热修后误 pop 旧 WIP；publish 只 revert B 漏热修；**审前单独推 `revert:` 导致他人看到旧码**；只推 F 不 revert。

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
| revert / cherry-pick / stash pop 冲突 | CHECKPOINT，等用户选择 | 无授权不 abort、不强推、不 hard |
| 误在共享分支上长期 reset | 改走临时分支 | 报告分叉风险 |
| 后端/同事已基于草稿联调 | 发布前同步：将 revert+最终版；确认接口契约是否变 | 用户取消 publish 或先协商窗口 |
| `pull` 后草稿 SHA 不在当前历史 | 用 `git branch -a --contains <sha>` 定位；禁止瞎 revert tip | `blocked`，请用户核对 SHA |
| 热修缺 `commit_message` | 追问 | `blocked` |
| 仅一侧 remote push 失败 | 报告成功/失败列表，继续修另一侧 | 不自动 revert 已成功侧 |
| **审前**就推 `revert:` | STOP；远端应保持待审最新；改走审完后 `publish_final` 成对推 | 若已误推：再推一笔恢复 tip 效果，本地继续审 |
| 把 `local_review` / reclaim 当成已撤远端 | 澄清远端仍有待审版 | — |
| publish 只推 F 不 revert | STOP；须成对 | — |
| `series_tip` 夹他人提交未确认 | STOP；只列本系列 SHA | 用户圈定 tip 后再继续 |
| origin/upstream tip 不一致 | 先对齐再 push | 一侧失败只报告，不 force |

## 路由表

| 用户意图 | 先走 | 再走 |
| --- | --- | --- |
| 推草稿给后端 / 先上 develop 一版 | [[intention-skills/分析-流程现状/SKILL.md]] | [[intention-skills/策略-选择阶段/SKILL.md]] → [[intention-skills/编排-推送草稿/SKILL.md]] |
| 本地收回改动审查 / reset 草稿提交 | 同上 | 策略 → [[intention-skills/编排-本地审查回滚/SKILL.md]] |
| 审查中发现 bug / CI 先止血再回审查分支 | 同上 | 策略 → [[intention-skills/编排-审查中热修草稿/SKILL.md]] |
| 保护分支推 revert 回滚上一版，改动拿回本地先审 | 同上 | 策略 → [[intention-skills/编排-revert并收回本地审查/SKILL.md]] |
| 审查完了，revert（若尚未）再推最终版 | 同上 | 策略 → [[intention-skills/编排-revert并推送最终版/SKILL.md]] |
| 要 force push 覆盖草稿 | 同上 | `handoff_force_push`：**STOP**，不执行 |
| 整支 merge / 只挑 commit / 开沙盒 | **改路由** 邻近 skill | — |

## 输出契约（每轮必出）

`currentUnderstanding` | `phase`∈{`push_draft`,`local_review`,`hotfix_during_review`,`revert_and_reclaim`,`publish_final`,`handoff_force_push`,`blocked`} | `draftSha` | `hotfixSha` | `preRevertTip` | `tempBranch` | `finalSha` | `status`∈{`blocked`,`awaiting_confirm`,`in_progress`,`conflict`,`done`} | `nextAction` | `riskFlags`

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
tempBranch: temp-review-after-draft-menu-io-v2
finalSha: n/a
status: in_progress
nextAction: 用户审查重构；若发现远端 bug → hotfix_during_review
riskFlags: [local_behind_remote]
```

**hotfix_during_review 成功后：**

```text
phase: hotfix_during_review
draftSha: f2e80622…        # 不变（系列起点）
hotfixSha: 0e14f561…
seriesTip: 0e14f561…
reviewBase: <draft^>
tempBranch: temp-review-after-draft-menu-io-v2
status: done
nextAction: 在工作区审查 A..tip 整包；publish 时 revert 系列全部 SHA 再上最终版
riskFlags: []
```

收回时实际执行的命令骨架（须出现在确认块后）：

```bash
git checkout -B "<temp_branch>" "<series_tip>"
git reset "<draft_commit>^"          # mixed；禁止 --hard
git stash list                        # 核对 hotfix 前那条
git stash drop stash@{N}              # 默认 drop；非用户要求不 pop
```

**revert_and_reclaim 成功后：**

```text
phase: revert_and_reclaim
draftSha: 1c6aa508…
seriesTip: 1c6aa508…   # 或恢复后的 tip（效果等同待审最新）
tempBranch: temp-review-after-revert-…
reviewBase: <draft^>
remoteUnchanged: true
status: done
nextAction: 本地审查；通过后 publish_final 成对推 revert:+F（勿审前推 revert）
riskFlags: []
```

命令骨架（仅 reclaim）：

```bash
git checkout -B "<temp_branch>" "<series_tip>"
git reset "<draft_commit>^"          # mixed；禁止 --hard
# 禁止：此时对 shared_branch revert + push
```

**publish_final 成功后：**

```text
phase: publish_final
draftSha: a1b2c3d4…
tempBranch: temp-review-after-draft
finalSha: f0e1d2c3…
status: done
nextAction: 无；远端历史应为 草稿→热修→(同事)→revert→最终
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
审查分支上 Jenkins 报缺 js-yaml。先修到 develop 并 push origin+upstream，
再把草稿+热修整包收回临时审查分支继续审查优化（不要 pop 回修 bug 前的旧 WIP）。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

```text
审查提交已经在临时分支上了。develop pull 后 revert 草稿 abc1234，
cherry-pick 最终版，push，再删临时分支。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

```text
远端保持最新待审版。把这一版改动收回临时分支让我先审；现在不要推 revert。
审完后再成对推 revert: 和最终版。
使用 $推送草稿+revert草稿，待审核结束再推送最终版本。
```

## 资源

- 检查清单：[[assets/执行检查清单.md]]
- few-shot：[[assets/few-shot-example/SKILL.md]]
- 边界：[[references/与邻近git-skills边界.md]]
- 为何 revert：[[references/为何用revert而非强推.md]]
- 为何保护分支推 revert:：[[references/为何保护分支用revert提交回滚.md]]
- 为何热修不 amend：[[references/为何审查中热修不amend草稿.md]]
- 触发用例：[[evals/触发用例.md]]
- 叙事样本：[[template/示例-develop草稿后审查再最终版.md]]、[[template/示例-审查中热修js-yaml依赖.md]]
