# Few-shot：个人中心 profile hook 改造

真相源：apex_dev `3a98909^` → `3a98909`。

## 触发语

「个人中心刷新闪 XXX，抽 composable 加全屏 loading」

## RED 信号（before）

- `userProfile = ref({})`
- 模板：`|| "XXX"`、`|| "xxx123456@sieyuan.com"`、`|| "+86 1234567890"`、`|| $t("管理员")`
- 页面内 `loadUserProfile` + `getCurrentUserId` + `onMounted await loadUserProfile`
- 无 `useProfile.ts`、无 `useLoading.ts`

样本：[`template/before/.../index.profile-loading.fragment.vue`](../../template/before/src/views/profile/index.profile-loading.fragment.vue)

## GREEN 要点（after）

### 新增文件

- `src/layouts/composables/useLoading.ts` ← mvp
- `src/views/profile/composables/useProfile.ts` ← after 样本

### index.vue 删减

- 删 `loadUserProfile` 函数体
- 删 `getCurrentUserId`（提交改 `userProfile.value.id`）
- 删 `onMounted` 内 `await loadUserProfile/refreshProfile`
- 增 `import { useProfile } from "..."`
- 增 `const { userProfile, profileLoaded, refreshProfile } = useProfile()`

### index.vue 模板

```diff
- {{ userProfile.userName || "XXX" }}
+ {{ userProfile.userName || "-" }}

- <div class="profile-container">
+ <div v-if="profileLoaded" class="profile-container">
```

### useProfile 核心

```ts
const { startLoading, stopLoading } = useLoading(0);
startLoading();
onBeforeMount(() => { void loadProfile(); });
onUnmounted(() => { stopLoading(); });

function refreshProfile() {
  return loadProfile({ withLoading: false });
}
```

### handleSubmit

```diff
- const userId = getCurrentUserId();
+ const userId = userProfile.value.id;

- await loadUserProfile();
+ await refreshProfile();
```

## 勿改

- `onMounted` 内 `device` 轮询、`resize` 监听（布局专用）
- 安全设置区已有 `|| ""` 的 desc-value

## 验收口诀

无假字、单数据源、首次遮罩、提交不遮、detail 不双打。
