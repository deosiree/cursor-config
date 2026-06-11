# dry-run 期望输出（test-prompts 对照）

> eval_mode=dry_run 时，agent 读完 skill 后应能产出下列关键决策；用于 dim8 打分。

| id | prompt 摘要 | 期望路由 | 期望关键输出 |
|----|-------------|----------|--------------|
| 1 | 个人中心闪 XXX | apply-hook | useProfile + useLoading(0) + profileLoaded 门控 |
| 2 | 迁 useLoading | new-hook | 复制 template/mvp/useLoading.ts |
| 3 | profile inline 改 composable | apply-hook | diff before/after，删 onMounted load |
| 4 | 报表详情改 composable | apply-hook | useReportDetail（非 useProfile）+ skeleton |
| 5 | 告警列表 loading | 形态 B 边界 | 页面内 useLoading() + fetchList，**不**建 hook |
| 8 | 安全配置闪默认值 | apply-hook 形态 E | 已有 composable 内 loading + `configLoaded`；禁 useProfile |

## dim8 干跑判分锚点

- prompt 4 若仍输出 `useProfile` → dim8 ≤ 6
- prompt 5 若创建 `useAlarmList` → dim8 ≤ 6
- prompt 8 若新建 useProfile / 保留 onMounted reload → dim8 ≤ 6
- 形态 E 题均正确 → dim8 ≥ 8
