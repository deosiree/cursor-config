# useLoading API

路径：`src/layouts/composables/useLoading.ts`（apex_dev / opsdeck 同款）。

## 签名

```ts
export function useLoading(delay = 500): {
  startLoading: (text?: string) => void;
  stopLoading: () => void;
};
```

## 行为

| 方法 | 行为 |
|------|------|
| `startLoading(text?)` | 若已有 timer 或已 shown，直接 return；否则 `delay` ms 后 `ElLoading.service({ lock: true, text, background: 'rgba(0,0,0,0.3)' })` |
| `stopLoading()` | timer 未触发：clearTimeout；已 shown：`loadingInstance.close()` |

## delay 选型

| 场景 | 推荐 | 原因 |
|------|------|------|
| 列表查询、弹窗内拉数 | `useLoading()`（500） | 快请求不显示，防闪烁 |
| 路由进入个人中心/详情 | `useLoading(0)` | 一点击进入即遮罩，避免闪占位 |
| 敏感操作需即时反馈 | `useLoading(0)` | 同 opsdeck `EditNodePortDialog` |

## 与 v-loading 选型

| 需求 | 选用 |
|------|------|
| 全屏锁页、路由级首屏 | `useLoading` |
| 表格/卡片/弹窗内容区 | `v-loading` on 容器 |
| 全局每个请求 | request 拦截器 / loading.store（本子 skill 不覆盖） |

## 调用范式

```ts
const { startLoading, stopLoading } = useLoading();

async function fetchData() {
  try {
    startLoading();
    await api.call();
  } finally {
    stopLoading();
  }
}
```

**必须** `try/finally` 成对，避免导航离开或异常后遮罩残留。领域 hook 在 `onUnmounted` 再调一次 `stopLoading()` 作兜底。
