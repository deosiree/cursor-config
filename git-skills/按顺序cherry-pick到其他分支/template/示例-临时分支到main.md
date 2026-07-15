# 示例：临时分支连续提交 → main

> 给人仿写的完整叙事。假设仓库工作树已干净。

## 场景

- 仓库：`F:/Documents/Default-Obsidian/huiyanSkills`
- 源分支：`auto-optimize/20260715-1605-translate`
- 目标分支：`main`
- 待挑（旧 → 新，连续）：

| 顺序 | hash（示例） | subject |
| --- | --- | --- |
| 1 | `3280240` | optimize translate: dim8 fixture … |
| 2 | `6e398e3` | optimize translate: darwin stop … |
| 3 | `4be9c93` | feat(nebula)：菜单节点的校验 |
| 4 | `16f0af7` | fix：输出测试用例csv |

用户已确认清单；不要 push；挑完后若用户说不要临时分支，再删源分支。

## 命令序列

```bash
cd "F:/Documents/Default-Obsidian/huiyanSkills"

git status --short
# 必须无输出（或仅忽略规则内文件）；否则停下

git log --oneline main..auto-optimize/20260715-1605-translate
# 与用户确认 old→new 列表

git checkout main
# 用户未要求则不 pull

git cherry-pick 3280240^..16f0af7
# 等价于挑 3280240 … 16f0af7 全部连续提交

# 若中途冲突：
#   # 解决文件后
#   git add -A
#   git cherry-pick --continue
# 用户要放弃整段：
#   git cherry-pick --abort
# 用户要保留已成功部分并退出：
#   git cherry-pick --quit

git log --oneline -5
git status

# 仅当用户明确要求：
# git push origin main
# git branch -d auto-optimize/20260715-1605-translate
```

## 离散挑（非连续）时

若只要第 1、3 个提交：

```bash
git cherry-pick 3280240 4be9c93
```

仍须 old→new；不要颠倒顺序。

## 单挑时

```bash
git cherry-pick 16f0af7
```
