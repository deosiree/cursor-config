# db-回滚数据库

## 定位

translationtool MySQL 的 **备份 / 整库恢复 / audit 逐条回滚** 三套能力：

| 模式 | 场景 | 复杂度 |
|------|------|--------|
| **backup + restore** | 本地功能测试前后 | 低（推荐） |
| **audit_rollback** | 只撤销部分术语同意 | 中 |

备份默认目录：[`translationtool/db/backups/`](F:/Documents/Repertory/Sieyuan/translationtool/db/backups/)

## 推荐工作流

```text
测试前：使用 $db-回滚数据库 备份 translationtool 数据库
测试中：随意操作（同意词条、预翻译等）
测试后：使用 $db-回滚数据库 恢复到最新备份
```

## 目录职责

```
db-回滚数据库/
├── SKILL.md
├── README.md
├── intention-skills/
│   ├── 分析-回滚模式判定/          # backup | restore | audit_rollback
│   ├── 分析-回滚范围确认/            # audit 专用
│   ├── 编排-备份数据库/
│   ├── 编排-整库恢复/
│   └── 编排-审核副作用回滚/
├── feature-skills/
│   ├── 执行-mysqldump备份/
│   ├── 查询-备份清单/
│   ├── 执行-整库恢复/
│   ├── 验证-整库恢复/
│   ├── 查询-审核副作用/
│   ├── 执行-软删除与解绑/
│   └── 验证-回滚结果/
├── scripts/
│   ├── backup-database.ps1
│   ├── restore-database.ps1
│   ├── list-backups.ps1
│   ├── inspect-audit-rollback.sql
│   └── execute-audit-rollback.sql
├── references/
│   ├── 备份与整库恢复说明.md
│   ├── 表结构与副作用说明.md
│   ├── 连接与执行约定.md
│   └── 扩展场景-预翻译与工作台.md
└── assets/ … template/ … evals/
```

## 脚本快速用法

```powershell
# 备份
& "...\db-回滚数据库\scripts\backup-database.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool"

# 列出备份
& "...\db-回滚数据库\scripts\list-backups.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool"

# 恢复（需 -Force）
& "...\db-回滚数据库\scripts\restore-database.ps1" -UseLatest -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Force
```

## 关联

- Docker MySQL：[`docker-compose.yml`](F:/Documents/Repertory/Sieyuan/translationtool/docker-compose.yml)
- audit 副作用源码：[`TermAuditService`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/app/services/term_audit/service.py)
