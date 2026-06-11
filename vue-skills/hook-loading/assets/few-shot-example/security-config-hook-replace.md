# Few-shot：配置表单页首屏闪默认值 + 全屏 loading

触发语：「安全配置进入时闪默认策略值，已有 useSecurityConfigPage，加全屏 loading」

## 先判定形态

读 [`page-archetypes.md`](../../references/page-archetypes.md) → **形态 E 配置表单首屏拉数**（非 profile 详情 A，非列表 B）。

## 命名映射（勿照搬 useProfile）

| profile 样本 | 本页替换 |
|--------------|----------|
| `useProfile` | **已有** `useSecurityConfigPage`（勿改名） |
| `profileLoaded` | `configLoaded` |
| `loadProfile` | `reload`（保留业务名） |
| `refreshProfile` | 保存后本地设 baseline，**不必**再 reload |

## 落地步骤

1. 在 **已有** `useSecurityConfigPage.ts` 内接入 loading（勿新建第二个 composable）：
   - `useLoading(0)` + setup `startLoading()`
   - `configLoaded` ref
   - `reload(options?: { withLoading?: boolean })`，默认 `!configLoaded`
   - `onBeforeMount(() => void reload())` + `onUnmounted(stopLoading)`
2. 页面删 `onMounted(() => reload())`
3. 根节点 `v-if="configLoaded"`，避免 `createDefaultSecurityConfig()` 默认值闪现
4. 用户点「重置/重新加载」：`@reset="() => reload({ withLoading: true })"`
5. 保存成功仍走本地 baseline 更新，**不**二次全屏遮罩

## 对照样本

| 状态 | 路径 |
|------|------|
| before | [`template/before/.../useSecurityConfigPage.ts`](../../template/before/src/views/system/securityConfig/useSecurityConfigPage.ts) |
| after composable | [`template/after/.../useSecurityConfigPage.ts`](../../template/after/src/views/system/securityConfig/useSecurityConfigPage.ts) |
| after 页面 | [`index.security-config-loading.fragment.vue`](../../template/after/src/views/system/securityConfig/index.security-config-loading.fragment.vue) |

## 禁止

- 勿照抄 `useProfile` 命名或再建 `useSecurityProfile`
- 勿在 `index.vue` 保留 `onMounted reload` 与 composable `onBeforeMount` 叠打
- 勿保存成功后 `reload()` 带全屏 loading
