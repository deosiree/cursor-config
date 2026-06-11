---
name: hook-loading
description: 页面首屏/刷新误显示占位、需全屏 loading（useLoading）或抽离领域 composable 时使用；先判定新建 useLoading 或应用 hook 改造页面。
---

# hook-loading

页面 **数据加载 + 全屏遮罩** 收敛为：`layouts/composables/useLoading.ts`（基础设施）+ `views/{page}/composables/use{Xxx}.ts`（领域 hook）。

## 何时使用

- 路由进入后短暂显示假默认值（XXX、假邮箱、默认角色等）
- 页面内联 `loadXxx` / `getCurrentUserId` 与模板、提交逻辑耦合
- 需要从 opsdeck 迁入 `useLoading`，或列表/详情页要用全屏 `ElLoading.service`
- 首次进入要即时 loading，提交后刷新不要重复遮罩

## 何时不要使用

- 表格/卡片局部遮罩 → 页面 `v-loading`（见用户列表、租户表等惯例）
- request 拦截器 / `loading.store` 全局链路 → 本子 skill 不覆盖
- qiankun 主应用「点击菜单即 loading」→ microfb 导航侧另案（见 [`references/hook-data-flow.md`](references/hook-data-flow.md) 边界）

## RED：失败基线（先判定再改码）

1. **先读页面形态**：[`references/page-archetypes.md`](references/page-archetypes.md)（列表 B 可能只需页面内 `useLoading()`，不抽领域 hook）
2. 是否存在 `src/layouts/composables/useLoading.ts`
3. 目标页是否仍 inline `loadXxx` + `onMounted await`
4. 模板是否有误导性 fallback（非 `"-"` / 空串）
5. 提交是否重复 `getCurrentUserId()` 而非读 hook 内 `data.id`
6. `onMounted` 是否误调 `refreshXxx` 与 hook 首次 load 叠打
7. 是否误将 `useProfile` 命名照抄到非 profile 页（须按领域重命名）

对照样本：profile [`template/before`](template/before/src/views/profile/) vs [`template/after`](template/after/src/views/profile/)；泛化骨架 [`template/mvp/.../usePageData.skeleton.ts`](template/mvp/src/views/_shared/usePageData.skeleton.ts)

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **新建 hook** | 无 `layouts/composables/useLoading.ts` | [`feature-skills/新建-hook/SKILL.md`](feature-skills/新建-hook/SKILL.md) |
| **应用 hook** | `useLoading` 已有，目标页仍 inline 拉数 | [`feature-skills/应用-hook/SKILL.md`](feature-skills/应用-hook/SKILL.md) |
| **组合** | 新仓从零接入 | **先新建 → 再应用** |

判定口诀：**没有 useLoading 就先新建；有 useLoading 但页面还内联 load 就应用。**

## CHECKPOINT · STOP（路由后、改码前）

| 触发条件 | 必须动作 | 仍无法判定 |
|----------|----------|------------|
| 无法判断新建 vs 应用 | 问：是否已有 `useLoading.ts`？页面是否仍 `onMounted loadXxx`？ | 读 [`template/mvp`](template/mvp/) 与 [`template/before`](template/before/) |
| 需求仅为表格 v-loading | **停止**，不走本 skill | 参考列表页 `UserTable.vue` |
| 列表页只说「加 loading」未写明全屏或 v-loading | **STOP 澄清**：表格局部 → `v-loading`；查询全屏 → 形态 B `useLoading()` | 见 page-archetypes 形态 B |
| 需求含主应用导航即 loading | **停止**，记边界外 | 见 references 边界节 |
| 不确定 delay 用 0 还是 500 | 读 [`page-archetypes.md`](references/page-archetypes.md) + [`useLoading-api.md`](references/useLoading-api.md) | 路由详情 `0`，列表查询 `500` |
| 非 profile 页不知如何命名 hook | 读 page-archetypes 命名表 | 用 `useReportDetail` 等，禁止照搬 `useProfile` |

## 失败 fallback（路由/执行层）

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 首屏仍闪假数据 | 去模板假 fallback；接领域 hook + session seed | 对照 [`template/after`](template/after/) |
| loading 出现太晚 | 领域 hook 用 `useLoading(0)` + setup 同步 `startLoading` | 读 [`应用-hook`](feature-skills/应用-hook/SKILL.md) |
| 提交后又全屏遮罩 | 提交后只调 `refreshXxx`（`withLoading: false`） | 查 `loaded` 门控 |
| 进入页打了两次 detail | 删 `onMounted` 里 `refresh/load`；仅 hook `onBeforeMount` 首次拉 | [`anti-patterns.md`](references/anti-patterns.md) |
| 快请求完全无 loading | 路由页应用 `useLoading(0)` 而非默认 500 | [`useLoading-api.md`](references/useLoading-api.md) |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码，只委派子 skill。验收：

1. 冷进入无误导性假默认值
2. 首次进入有全屏 loading（路由页 `delay=0` 时即时显示）
3. 提交成功后静默 `refresh`，无二次全屏遮罩
4. 展示单源：模板只读 hook 的 `ref`，网关为真源
5. 无重复 detail 请求
6. linter 无新增错误

## 使用示例

```text
使用 $hook-loading：个人中心刷新闪 XXX，抽 composable 并加全屏 loading。
```

```text
apex 已有 useLoading，把 profile 页 inline loadUserProfile 改成 useProfile，对照 before|after。
```

```text
从 opsdeck 迁 useLoading 到 apex_dev layouts/composables。
```

## 延伸阅读

- 新建：[`feature-skills/新建-hook/SKILL.md`](feature-skills/新建-hook/SKILL.md)
- 应用：[`feature-skills/应用-hook/SKILL.md`](feature-skills/应用-hook/SKILL.md)
- API：[`references/useLoading-api.md`](references/useLoading-api.md)
- 数据流：[`references/hook-data-flow.md`](references/hook-data-flow.md)
- 反模式：[`references/anti-patterns.md`](references/anti-patterns.md)
- 形态选型：[`references/page-archetypes.md`](references/page-archetypes.md)
- Few-shot：[`profile-hook-replace.md`](assets/few-shot-example/profile-hook-replace.md)、[`detail-page-hook-replace.md`](assets/few-shot-example/detail-page-hook-replace.md)、[`list-page-inline-loading.md`](assets/few-shot-example/list-page-inline-loading.md)、[`security-config-hook-replace.md`](assets/few-shot-example/security-config-hook-replace.md)
- 列表范式：[`list-query-loading.fragment.ts`](template/mvp/src/views/_shared/list-query-loading.fragment.ts)
- 试跑：[`test-prompts.json`](test-prompts.json)、[`dry-run-expected.md`](evals/dry-run-expected.md)
