# 为何整支用 merge 而不是 cherry-pick

## 结论

要把**整条**临时分支的成果纳入主分支并丢掉临时分支名，用 `git merge`，不要用逐个 `cherry-pick`。

## 对照

| | merge | cherry-pick |
| --- | --- | --- |
| 意图 | 整支合入 | 只要部分提交 |
| 历史 | 保留分支关系（尤其 `--no-ff`） | 在目标上生成新 hash 的副本 |
| 收工删分支 | 自然下一步 | 仅当你只关心内容、不关心整支拓扑时 |

## 误用信号

用户说「临时分支不要了，全部合进 main」却去逐条挑 commit → 改走本 skill。

## 参考流程

对齐 finishing-a-development-branch 的「本地 merge」选项：checkout 目标 →（可选）pull → merge → 验收 → `branch -d`。
