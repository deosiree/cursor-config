# 示例：临时分支 merge 进 main 并删除

> 假设工作树已干净；用户已确认。

## 场景

- 仓库：`F:/Documents/Default-Obsidian/huiyanSkills`
- 源：`auto-optimize/20260715-1945-cherry-pick-darwin`
- 目标：`main`
- `merge_mode`：`--no-ff`
- 删源分支：是；push：否

## 命令序列

```bash
cd "F:/Documents/Default-Obsidian/huiyanSkills"

git status --short
# 必须为空

git log --oneline --reverse main..auto-optimize/20260715-1945-cherry-pick-darwin
# 向用户展示范围 → 确认后再继续

git checkout main
# 用户未要求则不 pull

git merge --no-ff auto-optimize/20260715-1945-cherry-pick-darwin
# 冲突则解决后 git add && git commit；或用户授权后 git merge --abort

git log -5 --oneline
git status
git merge-base --is-ancestor auto-optimize/20260715-1945-cherry-pick-darwin HEAD
# 退出码 0 表示源 tip 已在当前历史中

git branch -d auto-optimize/20260715-1945-cherry-pick-darwin

# 仅当用户明确要求：
# git push origin main
# git push origin --delete auto-optimize/20260715-1945-cherry-pick-darwin
```
