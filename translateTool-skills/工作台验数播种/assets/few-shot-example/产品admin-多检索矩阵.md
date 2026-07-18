# Few-shot：产品 admin · 多检索矩阵

种子：`translationtool/db/opt/seed-verify-admin-retrieval.sql`  
任务：`verify-admin-retrieval`（6 词条，entry_state=3）  
Harness：`evals/suites/product/B02-workbench-verify-seed` + `verify_adm_pretranslate --strict`

## 一键（skill 自动化）

```powershell
$skill = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\工作台验数播种"
$root  = "F:\Documents\Repertory\Sieyuan\translationtool"
& "$skill\scripts\apply-workbench-verify-seed.ps1" -ProjectRoot $root -SeedProfile custom `
  -SeedSqlPath "$root\db\opt\seed-verify-admin-retrieval.sql"
& "$skill\scripts\verify-workbench-translate-ready.ps1" `
  -TaskId "verify-admin-retrieval-task" -ProductId "a2128cfc-14f2-46ab-930e-76350aaf0255" -ExpectedEntryCount 6
cd "$root\terminology-agent"; python -m devtools.verify_adm_pretranslate --strict
```

## 路径覆盖

exact×2 · fuzzy|none×1 · decomposed×2 · none×1（见 DEV_DB_CHECKPOINT「多检索验数矩阵」）
