# hook-loading 模板索引

真相源：**apex_dev** commit `3a98909`（父提交 `3a98909^` 为 RED）。

## 目录

| 路径 | 类型 | 说明 | 来源 |
|------|------|------|------|
| [`mvp/src/layouts/composables/useLoading.ts`](mvp/src/layouts/composables/useLoading.ts) | MVP | 全屏 loading composable | `git show 3a98909:src/layouts/composables/useLoading.ts` |
| [`mvp/src/views/_shared/usePageData.skeleton.ts`](mvp/src/views/_shared/usePageData.skeleton.ts) | MVP | 领域 hook 泛化骨架（形态 A） | 自维护 |
| [`mvp/src/views/_shared/list-query-loading.fragment.ts`](mvp/src/views/_shared/list-query-loading.fragment.ts) | MVP | 列表内联 loading（形态 B） | opsdeck projectManage 摘要 |
| [`before/src/views/profile/index.profile-loading.fragment.vue`](before/src/views/profile/index.profile-loading.fragment.vue) | before | 个人中心 RED：假 fallback + inline load | `git show 3a98909^:src/views/profile/index.vue` |
| [`after/src/views/profile/index.profile-loading.fragment.vue`](after/src/views/profile/index.profile-loading.fragment.vue) | after | 个人中心 GREEN：接入 useProfile | `git show 3a98909:src/views/profile/index.vue` |
| [`after/src/views/profile/composables/useProfile.ts`](after/src/views/profile/composables/useProfile.ts) | after | 领域 hook 成品 | `git show 3a98909:src/views/profile/composables/useProfile.ts` |
| [`before/.../securityConfig/useSecurityConfigPage.ts`](before/src/views/system/securityConfig/useSecurityConfigPage.ts) | before | 形态 E RED：默认策略闪现 + onMounted reload | apex HEAD^（改造前） |
| [`before/.../index.security-config-loading.fragment.vue`](before/src/views/system/securityConfig/index.security-config-loading.fragment.vue) | before | 形态 E 页面 RED | apex HEAD^ |
| [`after/.../securityConfig/useSecurityConfigPage.ts`](after/src/views/system/securityConfig/useSecurityConfigPage.ts) | after | 形态 E GREEN：useLoading(0)+configLoaded | apex 实仓改造后 |
| [`after/.../index.security-config-loading.fragment.vue`](after/src/views/system/securityConfig/index.security-config-loading.fragment.vue) | after | 形态 E 页面 GREEN | apex 实仓改造后 |

## 维护

业务仓变更后，用下列命令刷新样本：

```bash
cd apex_dev
git show 3a98909^:src/views/profile/index.vue > .cursor/vue-skills/hook-loading/template/before/src/views/profile/index.profile-loading.fragment.vue
git show 3a98909:src/views/profile/index.vue > .cursor/vue-skills/hook-loading/template/after/src/views/profile/index.profile-loading.fragment.vue
git show 3a98909:src/views/profile/composables/useProfile.ts > .cursor/vue-skills/hook-loading/template/after/src/views/profile/composables/useProfile.ts
git show 3a98909:src/layouts/composables/useLoading.ts > .cursor/vue-skills/hook-loading/template/mvp/src/layouts/composables/useLoading.ts
```
