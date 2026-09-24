---
name: 创建沙盒分支
description: 当需要基于基线分支（默认 develop）用 git worktree 开 sibling 沙盒并发开发，或在收工/放弃后安全删除沙盒 worktree 与本地分支时使用。覆盖创建与安全删除两套编排；可恢复指定 stash。触发词：开沙盒、沙盒分支、worktree、devmgr、恢复 stash 到沙盒、删掉沙盒、安全删除 worktree。不要用于：整支 merge 进主分支（用 merge临时分支…）、只挑部分 commit（用按顺序cherry-pick…）、在沙盒内实现业务需求本身。
---

# 目标

把「开沙盒并发」与「安全拆沙盒」收敛为可路由的父级 agent：主文件只做触发、边界与编排选择；执行下沉到 `intention-skills` / `feature-skills`。

## 何时使用

- 要在不动主仓检出的前提下，从 `develop`（或指定基线）新建 sibling worktree + 分支
- 要把暂存的 stash 恢复到新沙盒，继续并发需求
- 开发完成或明确放弃后，要安全删除某个沙盒目录与本地分支

## 何时不要使用

- 整支合入主分支并删临时分支 → [[../merge临时分支到主分支并删除临时分支/SKILL.md]]
- 只要部分 commit → [[../按顺序cherry-pick到其他分支/SKILL.md]]
- 用户只要求实现业务功能（本套件只管沙盒生命周期，不写业务）

## 输入契约（父级）

缺关键字段且无法从现状推断 → **🛑 STOP** 追问：

| 字段 | 创建编排 | 删除编排 | 默认 |
| --- | --- | --- | --- |
| `repo` | 必填 | 必填 | — |
| `sandbox_branch` | 必填 | 与 `sandbox_path` 至少一个 | — |
| `sandbox_path` | 可推断 | 与 `sandbox_branch` 至少一个 | sibling `{repoPrefix}_{branch}` |
| `base_branch` | 可选 | 可选 | `develop` |
| `stash_ref` / `apply_stash` | 可选 | — | 有明确 stash 意图则 apply |
| `push` | 可选 | 可选 | `false` |
| `allow_discard_dirty` | — | 可选 | `false` |
| `allow_delete_unmerged` | — | 可选 | `false` |
| `force_remove_worktree` | — | 可选 | `false` |
| `delete_remote` | — | 可选 | `false` |

## 硬约束

1. 创建前主仓工作树必须干净；删除前必须过风险检查点。
2. 禁止删除受保护分支：`develop` / `main` / `master` 及主仓当前检出分支。
3. 默认不 push、不删远端；删除编排**不**代做 merge/cherry-pick。
4. stash：先 `apply`，无冲突再 `drop`；有冲突禁止 drop。
5. `move_agent_to_root` 失败 → 报告绝对路径，请用户手开；不判整次失败。

## 失败模式（三段式）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 主仓脏（创建） | `blocked`，列脏路径 | 拒绝带脏树 `worktree add` |
| 缺分支名/路径（创建或删除） | 追问 | 拒答 → `blocked` |
| 沙盒路径或分支碰撞 | 报告占用方 | 换名或先删旧沙盒 |
| stash 冲突 | 保留 stash，报告冲突文件 | 不 drop；沙盒可已存在 |
| 删除时脏树/未合入 | CHECKPOINT，等授权 | 无授权不 remove / 不用 `-D` |
| 命中受保护分支 | 立即 `blocked` | 永不删除 |
| 切仓 MCP 失败 | 给出绝对路径手开 | 不回滚已建沙盒 |

## 路由表

| 用户意图 | 先走 | 再走 |
| --- | --- | --- |
| 开沙盒 / 并发分支 / 恢复 stash 到沙盒 | [[intention-skills/分析-沙盒现状/SKILL.md]] | [[intention-skills/策略-创建或删除/SKILL.md]] → [[intention-skills/编排-创建沙盒/SKILL.md]] |
| 删沙盒 / 拆 worktree / 不要这条沙盒了 | 同上分析 | 策略 → [[intention-skills/编排-安全删除沙盒/SKILL.md]] |
| 收工要合进 main/develop | **改路由** merge skill | 合入后再视需要回本套件删残留 worktree |
| 只要中间几次 commit | **改路由** cherry-pick skill | — |

策略判定细节见 [[intention-skills/策略-创建或删除/SKILL.md]]。

## 输出契约（每轮必出）

`currentUnderstanding` | `intent`∈{`create`,`delete`,`handoff_merge`,`handoff_cherry_pick`,`blocked`} | `sandboxPath` | `sandboxBranch` | `status` | `nextAction` | `riskFlags`

## 使用示例

```text
基于当前 develop 给 apex_dev 开沙盒分支 devmgr，把 stash@{0} 场站名称改动恢复进去；
菜单导入继续在原仓并发。使用 $创建沙盒分支。
```

```text
devmgr 沙盒做完了（或不要了），帮我安全删掉 apex_devmgr worktree 和本地分支；
未合入的话先问我，先别 force。使用 $创建沙盒分支。
```

## 资源

- 检查清单：[[assets/执行检查清单.md]]
- few-shot：[[assets/few-shot-example/SKILL.md]]
- 边界：[[references/与邻近git-skills边界.md]]
- worktree/stash：[[references/worktree与stash注意事项.md]]
- 删除检查点：[[references/安全删除检查点.md]]
- 触发用例：[[evals/触发用例.md]]
- 叙事样本：[[template/示例-从develop开沙盒并恢复stash.md]]、[[template/示例-安全删除未合入沙盒.md]]
