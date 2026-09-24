# 与邻近 git-skills 边界

| 场景 | 用哪个 |
| --- | --- |
| 共享分支草稿 → 本地审查 →（热修）→ revert → 最终版 | **本套件** |
| 审查中先修 CI/草稿 bug，再整包收回本地审查 | **本套件** `hotfix_during_review` |
| 整支合入主分支并删临时分支 | [[../merge临时分支到主分支并删除临时分支/SKILL.md]] |
| 按顺序挑部分 commit | [[../按顺序cherry-pick到其他分支/SKILL.md]] |
| 开/删 sibling worktree 沙盒 | [[../创建沙盒分支/SKILL.md]] |
| 批提交文案与 push 计划 | `git-commit-batching-workflow` |
| 私有分支 force-with-lease 覆盖 tip | **非本套件**（手动或另写 skill） |

## 组合用法

- 在沙盒里改完再走本套件上 develop：先沙盒内提交，再回主仓按本套件阶段执行；或把沙盒最终 commit cherry-pick 进审查临时分支。  
- 本套件删的是**审查临时分支**，不是 worktree 沙盒；沙盒拆除仍走「创建沙盒分支」删除编排。  
- 热修默认 push `origin` +（若有）`upstream`，以覆盖 Jenkins 跟的上游仓。
