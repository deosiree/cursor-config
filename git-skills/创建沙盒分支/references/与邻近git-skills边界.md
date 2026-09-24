# 与邻近 git-skills 边界

| 场景 | 用哪个 |
| --- | --- |
| 开 sibling worktree 沙盒 / 恢复 stash 到沙盒 | **本套件** 创建编排 |
| 安全拆除沙盒 worktree + 本地分支 | **本套件** 删除编排 |
| 整支合入主分支并删临时分支 | [[../merge临时分支到主分支并删除临时分支/SKILL.md]] |
| 按顺序挑部分 commit | [[../按顺序cherry-pick到其他分支/SKILL.md]] |
| 共享分支草稿 → 本地审查 → revert → 最终版 | [[../推送草稿+revert草稿，待审核结束再推送最终版本/SKILL.md]] |
| 批提交文案与 push 计划 | `git-commit-batching-workflow` |

## 组合用法

收工且需要历史合入：先 merge skill，再视残留 worktree 回本套件删除编排。

若在沙盒内完成审查、最终要上共享 `develop` 且需保留草稿历史：走「推送草稿+revert…」套件，不要对本套件沙盒分支强推。
