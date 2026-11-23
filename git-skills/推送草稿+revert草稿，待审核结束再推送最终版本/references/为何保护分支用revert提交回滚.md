# 为何保护分支用 `revert:` 提交回滚（且须审后成对推）

## 问题

共享分支常为保护分支：禁止 force / 改写已推送历史。回滚只能**向前追加** `revert:` 提交。

## 正确时机

1. **审查中**：远端继续展示待审最新版；本地 reclaim 审查。**不要**此时 push `revert:`，否则他人统编立刻变成旧码。
2. **审核通过后（`publish_final`）**：同一发布会话内连续推送两笔——`revert:`（回滚待审系列）+ 最终版 F。

## 错误路径

| 错误 | 后果 |
| --- | --- |
| 审前单独推 `revert:` | 远端变旧；他人基于旧码统编 |
| 只推 F 不 revert | 与未审草稿叠罗汉 / 冲突 |
| force 抹掉草稿 | 保护分支拒绝 / 破坏协作 |

## 命令形态（仅 publish 阶段）

```bash
git revert --no-commit <sha>
git commit -m "revert: …（回滚 <sha>）"
git cherry-pick <final>
git push origin develop   # 两笔都推上去后再让别人拉
```
