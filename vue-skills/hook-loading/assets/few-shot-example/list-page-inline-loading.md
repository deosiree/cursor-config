# Few-shot：列表查询页内联 loading（形态 B）

触发语：「告警列表查询时加全屏 loading，不要抽 composable」

## 判定

读 [`page-archetypes.md`](../../references/page-archetypes.md) → **形态 B**，**停止**创建 `useAlarmList` 等领域 hook。

## 落地（页面内 try/finally）

拷贝 [`list-query-loading.fragment.ts`](../../template/mvp/src/views/_shared/list-query-loading.fragment.ts) 范式：

```ts
import { useLoading } from "@/layouts/composables/useLoading";

const { startLoading, stopLoading } = useLoading(); // 默认 500ms

async function fetchAlarmList() {
  try {
    startLoading();
    const res = await AlarmGateway.getList(queryParams.value);
    tableData.value = res.items ?? [];
  } finally {
    stopLoading();
  }
}
```

**必须 `await`**：勿在 try 内 `.then()` 而不 await，否则 `finally` 会立刻 `stopLoading()`（见 anti-patterns §10）。

## 禁止

- 勿抽 `useAlarmList` / `useUserList` composable（除非用户明确要求复杂状态机）
- 勿用 `useLoading(0)`（列表快请求用默认 delay 防闪烁）
- 勿与表格外层 `v-loading` 叠同一请求

## 真源

`nebula/opsdeck/src/views/projectManage/index.vue` → `getProjectList` 段。
