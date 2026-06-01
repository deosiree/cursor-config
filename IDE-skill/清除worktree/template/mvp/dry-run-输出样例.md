# dry-run 输出样例

```
=== 清除临时 worktree ===
WorkspaceRoot : F:\Documents\Repertory\Sieyuan\nebula
OlderThanDays : 3
Cutoff (LastWriteTime <) : 2026-05-26 12:00:00
Mode          : DRY-RUN

GitRoot                              WorktreePath                                                    LastWrite            AgeDays Action  Reason
-------                              ------------                                                    ---------            ------- ------  ------
F:\...\nebula\apex_dev               F:\...\apex_dev\.claude\worktrees\agent-a445da02e0320deb3       2026-05-20 08:11:02  9       dry-run
F:\...\nebula\apex_dev               F:\...\apex_dev\.claude\worktrees\agent-abf8184508821f976       2026-05-28 14:22:10  1       skip    未过期 (< 3d)

汇总: dry-run/preview=1 removed=0 skipped=1 failed=0

以上为预览。确认后请加 -Execute 重新运行。
```

## 列说明

| 列 | 含义 |
|----|------|
| GitRoot | 所属 Git 仓库根 |
| WorktreePath | 候选临时目录 |
| LastWrite | 目录最后写入时间 |
| AgeDays | 距今天数 |
| Action | dry-run / skip / removed / failed |
| Reason | skip 或 failed 原因 |
