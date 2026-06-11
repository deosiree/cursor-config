# 反模式

## 1. 模板假 fallback 冒充真实数据

```vue
<!-- 反模式 -->
{{ userProfile.userName || "XXX" }}
{{ userProfile.email || "xxx123456@sieyuan.com" }}
{{ userProfile.roleName || $t("管理员") }}
```

接口未返回时用户会误以为已登录他人账号。应改为 `"-"` 或空串，并配合 `profileLoaded` / loading 遮罩。

## 2. onMounted 与 hook 首次 load 叠打

```ts
// useProfile 已在 onBeforeMount loadProfile
onMounted(async () => {
  await refreshProfile(); // 反模式：多打一次 detail
});
```

## 3. 把 device 轮询当成用户刷新

```ts
setInterval(() => {
  const currentDevice = localStorage.getItem("device") || "";
  // 仅同步 isMobile 布局，不是拉 userInfo
}, 1000);
```

勿在此 interval 内调 `getProfile`。

## 4. 提交时重复 getCurrentUserId

```ts
// 反模式：与 userProfile 双源
const userId = getCurrentUserId();

// 推荐：hook 已含 id
const userId = userProfile.value.id;
```

session 失效边缘场景由接口 401 处理；不必在提交再读 session。

## 5. 领域逻辑不抽离

`loadUserProfile`、`useLoading`、`profileFromSession` 全写在 `index.vue` — 难以复用「首次 loading / 提交 refresh」门控。应抽到 `composables/useProfile.ts`。

## 6. 列表页滥用 useLoading(0)

列表快刷场景用 `useLoading(0)` 会每次闪全屏。列表用默认 `500` 或 `v-loading`。

## 7. 与 v-loading 混用同一流程

同一请求既 `startLoading()` 又在表格外层 `v-loading` — 重复遮罩。二选一。

## 8. 非 profile 页照抄 useProfile 命名

报表/设备等页仍导出 `useProfile`、`profileLoaded` — 误导后续维护。按 [`page-archetypes.md`](page-archetypes.md) 命名表改为 `useReportDetail`、`detailLoaded` 等。

## 9. 列表页误抽领域 hook

用户列表查询只需形态 B：页面内 `useLoading()` + `fetchList`。勿为列表创建 `useUserList` hook（除非列表状态极复杂且用户明确要求）。

## 10. try/finally 内用 .then() 未 await（遮罩闪退）

```ts
// ❌ stopLoading 在请求完成前执行
try {
  startLoading();
  api.getList(params).then((res) => { tableData.value = res.items; });
} finally {
  stopLoading();
}

// ✅ async/await 闭环
async function fetchList() {
  try {
    startLoading();
    const res = await api.getList(params);
    tableData.value = res.items ?? [];
  } finally {
    stopLoading();
  }
}
```

真源反例：`opsdeck/src/views/alarmInfo/index.vue` `getAlarmRecords`（full_test baseline 发现）。

## 11. 无权限早退漏 stopLoading

setup 已 `startLoading()`，`reload` 在 `!canSave` 分支 `return` 前须 `stopLoading()`，否则遮罩卡死。见 securityConfig after 样本。
