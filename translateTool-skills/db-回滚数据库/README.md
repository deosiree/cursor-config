# db-回滚数据库

## 定位

translationtool MySQL 的 **备份 / 整库恢复 / audit 逐条回滚 / ADM 矩阵还原** 四套能力：

| 模式 | 场景 | 复杂度 |
|------|------|--------|
| **backup + restore** | 本地功能测试前后 | 低（推荐） |
| **audit_rollback** | 只撤销部分术语同意 | 中 |
| **adm_matrix_reset** | ADM 6 路径污染、多次预翻译后全变 exact | 低（不 DROP 整库） |

备份默认目录：[`translationtool/db/backups/`](F:/Documents/Repertory/Sieyuan/translationtool/db/backups/)

## 推荐工作流

```text
测试前：使用 $db-回滚数据库 备份 translationtool 数据库
测试中：随意操作（同意词条、预翻译等）
测试后：使用 $db-回滚数据库 恢复到最新备份
```

## ADM 矩阵一键还原

```powershell
& "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库\scripts\reset-adm-matrix.ps1" `
  -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Apply
```

或自然语言：

```text
使用 $db-回滚数据库 回滚测试用的 ADM 术语，替我清理数据库
```

## 目录职责

```
db-回滚数据库/
├── SKILL.md
├── README.md
├── intention-skills/
│   ├── 分析-回滚模式判定/
│   ├── 分析-回滚范围确认/
│   ├── 编排-备份数据库/
│   ├── 编排-整库恢复/
│   ├── 编排-审核副作用回滚/
│   └── 编排-ADM验收数据还原/     # v1.2 新增
├── feature-skills/
│   ├── 执行-ADM污染清理/         # v1.2
│   ├── 执行-ADM种子重建/         # v1.2
│   ├── 验证-ADM矩阵验收/         # v1.2
│   └── …（backup / restore / audit）
├── scripts/
│   ├── reset-adm-matrix.ps1      # v1.2
│   └── …
└── references/
    ├── 扩展场景-ADM矩阵验收污染.md
    └── …
```

## 脚本快速用法

```powershell
# ADM 矩阵还原（preview）
& "...\db-回滚数据库\scripts\reset-adm-matrix.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -DryRun

# ADM 矩阵还原（执行 + 验收）
& "...\db-回滚数据库\scripts\reset-adm-matrix.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool" -Apply

# 备份
& "...\db-回滚数据库\scripts\backup-database.ps1" -ProjectRoot "F:\Documents\Repertory\Sieyuan\translationtool"
```

## 关联

- ADM devtools 源码：[`terminology-agent/devtools/`](F:/Documents/Repertory/Sieyuan/translationtool/terminology-agent/devtools/)
- Docker MySQL：[`docker-compose.yml`](F:/Documents/Repertory/Sieyuan/translationtool/docker-compose.yml)
