# Git 抽取规格

## 命令语义

每仓：`git log --since --author --no-merges`

## 字段（commits_raw.json）

| 字段 | 说明 |
| --- | --- |
| repo | 仓别名 |
| commit_id / commit_short | 完整/短 hash |
| date | author date short |
| subject / body / message | 提交信息 |
| files | name-only 列表 |
| stat_summary | show --stat 末行 |

## 过滤

- **仅**排除 Merge
- 不因主域/非主域丢弃

## 脚本

`scripts/extract_commits.py --config configs/{profile}.config.json`
