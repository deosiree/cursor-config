---
name: 应用-hook
description: 当 useLoading 已存在、目标页仍 inline 拉数或首屏闪占位时，按 template/before|after 抽领域 composable 并接入页面。
---

# 应用-hook

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点负责 **业务页从 inline 迁到领域 hook**。profile 为规范样本；其他页按 [`page-archetypes.md`](../../references/page-archetypes.md) 泛化命名。

## 何时使用

- 已存在 `src/layouts/composables/useLoading.ts`
- 目标页 inline `loadXxx` / `getCurrentUserId` / `onMounted await load`
- 模板误导性 fallback 或提交后重复全屏 loading

## 何时不要使用

- 无 `useLoading.ts` → [`../新建-hook/SKILL.md`](../新建-hook/SKILL.md)
- 仅需给表格加 `v-loading`

## 规范样本

| 样本 | 路径 | 说明 |
|------|------|------|
| **before** | [`template/before/src/views/profile/`](../../template/before/src/views/profile/) | RED：假 fallback + inline load |
| **after 页面** | [`template/after/.../index.profile-loading.fragment.vue`](../../template/after/src/views/profile/index.profile-loading.fragment.vue) | GREEN：接入 `useProfile` |
| **after hook** | [`template/after/.../useProfile.ts`](../../template/after/src/views/profile/composables/useProfile.ts) | 领域 composable 成品 |

Few-shot：[`profile-hook-replace.md`](../../assets/few-shot-example/profile-hook-replace.md)、[`detail-page-hook-replace.md`](../../assets/few-shot-example/detail-page-hook-replace.md)

泛化骨架：[`usePageData.skeleton.ts`](../../template/mvp/src/views/_shared/usePageData.skeleton.ts)

## RED：迁移前核对

**先判定页面形态**（[`page-archetypes.md`](../../references/page-archetypes.md)）：列表查询（形态 B）→ **停止抽领域 hook**，仅在页面内 `useLoading()` + fetch。

对照 [`template/before`](../../template/before/)：

- [ ] 模板是否存在 `XXX`、假邮箱、假手机、默认「管理员」等 fallback
- [ ] `userProfile = ref({})` 且无 session seed
- [ ] 页面内 `loadUserProfile` + `onMounted` 末尾 `await`
- [ ] 提交处 `getCurrentUserId()` 而非 `userProfile.id`
- [ ] `onMounted` 是否误含 `refreshProfile`（与 hook 首次 load 叠打）

## CHECKPOINT · STOP

| 触发条件 | 必须动作 |
|----------|----------|
| 无 `useLoading.ts` | **停止应用**，改走 [`新建-hook`](../新建-hook/SKILL.md) |
| 目标页无「首屏闪占位 / inline load」问题 | 确认是否走错 skill（可能只需 v-loading） |

## GREEN：通用步骤（个人中心样本）

### 1. 模板：去假 fallback + loaded 门控

```vue
<!-- before -->
{{ userProfile.userName || "XXX" }}

<!-- after -->
{{ userProfile.userName || "-" }}
```

- 依赖接口的字段（如状态 tag）加 `v-if="profileLoaded"`，或整页 `v-if="profileLoaded"` 包裹内容区

### 2. 新建 `views/{page}/composables/use{Name}.ts`

对齐 [`template/after/.../useProfile.ts`](../../template/after/src/views/profile/composables/useProfile.ts)：

```ts
import { onBeforeMount, onUnmounted, ref } from "vue";
import { useLoading } from "@/layouts/composables/useLoading";

export function useProfile() {
  const userProfile = ref(profileFromSession()); // 可选：session 首屏 seed
  const profileLoaded = ref(false);
  const { startLoading, stopLoading } = useLoading(0); // 路由页即时遮罩

  async function loadProfile(options?: { withLoading?: boolean }) {
    const withLoading = options?.withLoading ?? !profileLoaded.value;
    try {
      if (withLoading) startLoading();
      const userId = userProfile.value.id;
      if (!userId) return;
      userProfile.value = await UserGateway.getProfile({ id: userId });
      profileLoaded.value = true;
    } finally {
      if (withLoading) stopLoading();
    }
  }

  function refreshProfile() {
    return loadProfile({ withLoading: false });
  }

  startLoading(); // setup 同步，早于 onMounted
  onBeforeMount(() => { void loadProfile(); });
  onUnmounted(() => { stopLoading(); });

  return { userProfile, profileLoaded, loadProfile, refreshProfile };
}
```

要点见 [`hook-data-flow.md`](../../references/hook-data-flow.md)。

### 3. 页面瘦身

```ts
// before：页面内 loadUserProfile、getCurrentUserId、useLoading
// after：
import { useProfile } from "@/views/profile/composables/useProfile";
const { userProfile, profileLoaded, refreshProfile } = useProfile();
```

- 删除 inline `loadUserProfile`、`getCurrentUserId`（提交改用 `userProfile.value.id`）
- 删除 `onMounted` 里的 `await loadProfile/refreshProfile`
- 提交成功后：`await refreshProfile()`

### 4. 保留与数据无关的 onMounted

个人中心 `device` 轮询、`resize` 监听 **仅服务布局**，不是拉 detail；保留在 `onMounted`，且 **不要** 在其中再调 `refreshProfile`。

### 5. 分模块要点（profile）

| 改动点 | before | after |
|--------|--------|-------|
| 数据源 | `ref({})` | `profileFromSession()` + 网关覆盖 |
| 首次 load | `onMounted` | hook `onBeforeMount` |
| loading | 无 | `useLoading(0)` + setup `startLoading` |
| 提交 id | `getCurrentUserId()` | `userProfile.value.id` |
| 提交后 | `loadUserProfile()` | `refreshProfile()` |

## 失败 fallback

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 仍闪假数据 | 清模板 fallback；确认网关已覆盖 seed | diff before/after |
| loading 太晚 | `useLoading(0)` + setup `startLoading` | 读新建-hook delay 表 |
| 提交后又遮罩 | 仅用 `refreshProfile`，勿 `loadProfile()` 默认门控 | 查 `profileLoaded` |
| 两次 detail | 删 onMounted 内 refresh/load | anti-patterns §2 |
| 全屏 loading 闪退 | fetchList 改 async/await，勿 .then() 不 await | anti-patterns §10 |
| 提交报无 userId | 用 `userProfile.value.id`，勿再读 session | hook-data-flow |

## REFACTOR（泛化，勿照抄 useProfile）

| 场景 | 处理 | 样本 |
|------|------|------|
| 路由详情（形态 A） | 从 skeleton 或 profile after 拷贝，按命名表改 hook/gateway | detail-page few-shot |
| 配置表单（形态 E） | **已有** page composable 内接 loading + `configLoaded` | security-config before\|after |
| 列表查询（形态 B） | 页面内 `useLoading()` + fetchList try/finally | [`list-query-loading.fragment.ts`](../../template/mvp/src/views/_shared/list-query-loading.fragment.ts)、[`list-page-inline-loading.md`](../../assets/few-shot-example/list-page-inline-loading.md) |
| 弹窗内拉数（形态 C） | 简单：弹窗 open 时 inline load；复杂：小型 `useDialogXxx` | — |
| 无 session seed | `ref` 初始 `{}`，fallback `"-"` + `loaded` 门控 | profile after 模板节 |
| 微前端子应用 | 同形态 A/B；主应用导航 loading 不在此 skill | hook-data-flow 边界节 |

命名对照表见 [`page-archetypes.md`](../../references/page-archetypes.md#命名泛化禁止照搬-useprofile)。

## 验收

- [ ] 冷进入无假默认值
- [ ] 首次进入即时全屏 loading，接口返回后关闭
- [ ] 提交成功后无二次全屏 loading
- [ ] 无重复 detail（仅 hook 内首次 load）
- [ ] `onMounted` 无数据 refresh
- [ ] linter 无新增错误

## 延伸阅读

- 数据流：[`hook-data-flow.md`](../../references/hook-data-flow.md)
- 反模式：[`anti-patterns.md`](../../references/anti-patterns.md)
- 形态：[`page-archetypes.md`](../../references/page-archetypes.md)
- Few-shot：[`profile-hook-replace.md`](../../assets/few-shot-example/profile-hook-replace.md)、[`detail-page-hook-replace.md`](../../assets/few-shot-example/detail-page-hook-replace.md)
