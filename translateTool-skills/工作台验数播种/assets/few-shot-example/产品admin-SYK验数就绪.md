# Few-shot：产品 admin · SYK 术语库验数就绪

来源实跑：2026-07-18 · 种子 `db/opt/seed-verify-syk-admin-product.sql` · 卡 `db/backups/VERIFY_TERM_SYK_CARD.md`

## 目标

| 项 | 值 |
|----|-----|
| 产品名 / id | **admin** / `a2128cfc-14f2-46ab-930e-76350aaf0255` |
| 任务名 / id | **verify-syk-admin** / `verify-syk-admin-task` |
| 语种 / 部门 | 英文 / 通用平台部 |
| 五人员 | 全 `admin` |
| 词条态 | `entry_state=3`，`en_trans_id=NULL` |

## 词条矩阵

| entry_info id | 原文 | 术语库译文 |
|---------------|------|------------|
| verify-admin-syk-exact | VERIFY/SYK-exact-用户登录 | SYK-HIT-User Login |
| verify-admin-syk-exact2 | VERIFY/SYK-exact-权限管理 | SYK-HIT-Permission Mgmt |
| verify-admin-syk-exact3 | VERIFY/SYK-exact-数据备份 | SYK-HIT-Data Backup |
| verify-admin-syk-miss | VERIFY/SYK-miss-全新句子XYZ | （无） |

## 踩坑（必须记住）

1. **人员只写 creator** → 工作台任务流异常 → 五字段全填  
2. **entry_state=0** → `getTaskPending` 系统服务异常 → 必须 3  
3. **有 t_translate 命中种子但把 en_trans_id 指过去** → 不再是「待译点术语库」场景  

## 一键命令

```powershell
$skill = "F:\Documents\Default-Obsidian\huiyanSkills\translateTool-skills\工作台验数播种"
$root  = "F:\Documents\Repertory\Sieyuan\translationtool"
& "$skill\scripts\apply-workbench-verify-seed.ps1" -ProjectRoot $root -SeedProfile syk_glossary
```

## UI 路径

产品 **admin** → 任务 **verify-syk-admin** → 翻译 → 引擎「术语库」。
