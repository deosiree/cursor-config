# 工作台验数播种

为 translationtool **工作台**准备可测任务与词条：创建任务（五人员齐填）→ 设计验数词条 → 挂到产品 → 下发回填并进入**翻译**阶段 → 验证。

## 与 `db-回滚数据库` 的边界

| 诉求 | 套件 |
|------|------|
| 备份 / 整库恢复 / ADM 污染清理 | `db-回滚数据库` |
| 建任务、灌词条、进翻译阶段 | **本套件** |

本套件编排开头可**委托** `db-回滚数据库` 的 `backup-database.ps1` 做检查点。

## 快速开始

```powershell
$skill = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\工作台验数播种"
$root  = "F:\Documents\Repertory\Sieyuan\translationtool"

# 可选：先备份（db-回滚）
$dbSkill = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\db-回滚数据库"
& "$dbSkill\scripts\backup-database.ps1" -ProjectRoot $root -Label "before_workbench_verify"

# 应用种子（默认 syk_glossary → seed-verify-syk-admin-product.sql）
& "$skill\scripts\apply-workbench-verify-seed.ps1" -ProjectRoot $root -SeedProfile syk_glossary
```

## 目录

```text
SKILL.md                 # 主路由
intention-skills/        # 分析目标 + 总编排
feature-skills/          # 四步 + 验证
references/              # 状态机与表写入顺序
assets/                  # checklist + few-shot
scripts/                 # 应用种子 SQL
test-prompts.json        # Darwin evaluate-only
```

## Agent 路由

见主 [`SKILL.md`](SKILL.md)：先 `分析-验数目标确认`，再 `编排-工作台验数就绪`。
