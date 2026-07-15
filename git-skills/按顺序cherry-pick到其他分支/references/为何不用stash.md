# 为何不用 stash 搬已落地 commit

## 结论

要把**已经落地的 commit**挪到另一分支，用 `git cherry-pick`，不要用 `git stash`。

## 原因

`stash` 只适合保存**尚未提交**的工作区改动。目标提交若已是 commit，正确动作是在目标分支上重新应用该 commit 的补丁并生成新的 commit。

硬套 stash 时典型痛苦路径：

1. 用 `reset` / `checkout` 把提交里的改动「掏」成未提交状态
2. 再 `stash` → 切分支 → `stash pop`
3. 源分支若领先/落后远程很多，极易把无关改动卷进去

## 正确最短路径（单挑）

```text
# 1. 记下源 commit hash
# 2. 确认工作树干净
git checkout <target_branch>
# 可选：git pull origin <target_branch>
git cherry-pick <hash>
# 冲突则解决后：git add … && git cherry-pick --continue
# 默认不 push；用户明确要求再 push
```

## 源文档

- `F:\Documents\Default-Obsidian\语言\git快捷使用\恢复 & 回滚\提交到另一分支cherry-pick.md`
