# hook-loading 产出清单

## 新建-hook 完成

- [ ] `src/layouts/composables/useLoading.ts` 与 template/mvp 对齐
- [ ] `startLoading/stopLoading` 在 try/finally 成对
- [ ] delay 约定已写入领域 hook 或文档
- [ ] 未误改业务页（除验证用临时代码）

## 应用-hook 完成

- [ ] 模板无假 fallback（`XXX`、假邮箱等）
- [ ] `views/{page}/composables/use{Xxx}.ts` 已建
- [ ] 页面删除 inline `loadXxx` / `getCurrentUserId`
- [ ] 首次 load 仅在 hook `onBeforeMount`
- [ ] 提交后 `refreshXxx()` 无全屏 loading
- [ ] `onMounted` 无 `refresh/load` 叠打
- [ ] ESLint 无新增错误

## skill 文档维护

- [ ] template/before|after 与 apex commit 一致
- [ ] references 与实现无矛盾
- [ ] test-prompts 可触发父级路由
