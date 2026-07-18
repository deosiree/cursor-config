# custom 词条矩阵骨架

在写 SQL / 调用 `new-custom-seed.ps1` 前填本表。规则：≥1 命中 + ≥1 miss；待译行 `entry_state=3`、目标 `*_trans_id` 空。

| id 后缀 | 原文 entry | 术语库译文（空=miss） | comment |
|---------|------------|----------------------|---------|
| exact1 | VERIFY/CUSTOM-exact-… | CUSTOM-HIT-… | |
| exact2 | VERIFY/CUSTOM-exact-… | CUSTOM-HIT-… | |
| miss1 | VERIFY/CUSTOM-miss-… | | |

## 绑定

| 字段 | 值 |
|------|-----|
| productId | |
| taskId / taskName | |
| department / translate_type | 通用平台部 / 英文 |
| userId（t_user.id） | |
| id_prefix | verify-custom-`<slug>` |
| expectedEntryCount | |

填完 → 生成 SQL → `apply-workbench-verify-seed.ps1 -SeedProfile custom -SeedSqlPath …` → `verify-workbench-translate-ready.ps1 -ExpectedEntryCount <n>`。
