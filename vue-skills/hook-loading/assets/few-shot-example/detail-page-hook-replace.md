# Few-shot：非 profile 详情页泛化接入

触发语：「报表详情页 inline fetchReport 改成 composable，首屏加全屏 loading」

## 先判定形态

读 [`page-archetypes.md`](../../references/page-archetypes.md) → **形态 A 路由详情**。

## 命名映射（勿保留 useProfile）

| profile 样本 | 本页替换 |
|--------------|----------|
| `useProfile` | `useReportDetail` |
| `userProfile` | `reportDetail` |
| `profileLoaded` | `detailLoaded` |
| `loadProfile` | `loadReportDetail` |
| `refreshProfile` | `refreshReportDetail` |

## 落地步骤

1. 从 [`usePageData.skeleton.ts`](../../template/mvp/src/views/_shared/usePageData.skeleton.ts) 拷贝到 `views/report/composables/useReportDetail.ts`
2. 接入 `ReportGateway.getDetail`，类型改为 `ReportDetailVO`
3. `useLoading(0)` + setup `startLoading` + `onBeforeMount` load（同 profile after）
4. 页面删 inline `fetchReport` / `onMounted await`
5. 模板 fallback 统一 `"-"`，`v-if="detailLoaded"` 包裹依赖接口区块
6. 提交成功后 `await refreshReportDetail()`，无全屏 loading

## 列表页反例（不应抽领域 hook）

触发语：「告警列表查询加全屏 loading」

→ **形态 B**：页面内 `useLoading()` + `fetchAlarmList` try/finally，**不**创建 `useAlarmList` hook。见 opsdeck `projectManage/index.vue` 范式。
