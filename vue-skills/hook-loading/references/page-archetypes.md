# 页面形态与 hook 选型

应用-hook 时 **先判定形态**，再决定「只 useLoading」还是「useLoading + 领域 hook」。勿照抄 `useProfile` 命名。

## 形态表

| 形态 | 典型场景 | useLoading delay | 是否抽领域 hook | 样本 |
|------|----------|------------------|-----------------|------|
| A 路由详情 | 个人中心、报表详情、设备详情 | `0` | **是** | profile after |
| B 列表查询 | 用户列表、租户列表、告警列表 | `500`（默认） | **否**，页面内 try/finally | [`list-query-loading.fragment.ts`](../template/mvp/src/views/_shared/list-query-loading.fragment.ts) |
| C 弹窗内拉数 | 编辑弹窗打开时拉详情 | `0` 或 `500` | 视复杂度：简单则页面内，复杂则 `useDialogData` | — |
| D 仅提交后刷新 | 表单页无首屏 detail | 首次可无 loading | **可选** hook，或仅 `refresh` 函数 | — |
| E 配置表单首屏拉数 | 安全配置、租户策略等 Tab 表单 | `0` | **已有** page composable 内接入 | securityConfig after |

## 命名泛化（禁止照搬 useProfile）

| profile 样本名 | 泛化替换规则 | 示例（报表详情） |
|----------------|--------------|------------------|
| `useProfile` | `use` + 领域名 | `useReportDetail` |
| `userProfile` | `{domain}Data` 或业务名 | `reportDetail` |
| `profileLoaded` | `{domain}Loaded` 或 `dataLoaded` | `detailLoaded` |
| `loadProfile` | `load` + 领域 | `loadReportDetail` |
| `refreshProfile` | `refresh` + 领域 | `refreshReportDetail` |
| `profileFromSession` | `fromSession` 或 `initialFromCache` | `reportFromRouteQuery`（按实际缓存） |
| `profileLoaded` | `{page}Loaded` | `configLoaded`（安全配置） |

## 决策树

```text
目标页是表格列表查询？
  ├─ 是 → 页面内 useLoading() + fetchList，不抽领域 hook（形态 B）
  └─ 否 → 路由进入后要先展示一块「详情/资料」区？
        ├─ 是 → 形态 A：useLoading(0) + useXxx hook + loaded 门控
        └─ 否 → 是否进入后要拉远程配置填表单（Tab 策略页）？
              ├─ 是 → 形态 E：`useLoading(0)` + 已有 page composable + `configLoaded` 门控
              └─ 否 → 是否仅为弹窗内一次拉数？
                    ├─ 是 → 形态 C
                    └─ 否 → 重新评估是否只需 v-loading
```

## session seed 是否必要

| 条件 | 建议 |
|------|------|
| 登录后 session 已有展示字段（userInfo 等） | 可做 `fromSession()` 减空白 |
| 仅靠路由 id 拉详情、无可用缓存 | `ref` 初始 `{}`，fallback `"-"` + `loaded` 门控 |
| 缓存与接口字段不一致 | seed 只填交集字段，接口覆盖为准 |
