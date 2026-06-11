# hook-loading

Vue 页面 **全屏 loading（useLoading）** 与 **领域 composable（如 useProfile）** 抽离 skill。

## 解决什么问题

- 路由进入后首屏闪误导性占位（假用户名/邮箱/角色）
- 页面内联 `loadXxx` + `onMounted` 与 UI 耦合，难以区分首次加载与提交后刷新
- 需要 opsdeck 同款 `ElLoading.service` 全屏遮罩，而非表格 `v-loading`

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/新建-hook   → template/mvp（useLoading）
└── feature-skills/应用-hook   → template/before|after（个人中心）
```

## 真相源（维护）

与 **apex_dev** 对齐：

| 类型 | 来源 | commit |
|------|------|--------|
| useLoading MVP | `layouts/composables/useLoading.ts` | `3a98909` |
| profile before | `views/profile/index.vue` | `3a98909^` |
| profile after | `index.vue` + `composables/useProfile.ts` | `3a98909` |

| 变更类型 | 同步目标 |
|----------|----------|
| useLoading | [`template/mvp/`](template/mvp/) |
| 个人中心 before/after | [`template/before/`](template/before/)、[`template/after/`](template/after/) |

## 目录说明

```text
hook-loading/
├── SKILL.md
├── feature-skills/新建-hook/
├── feature-skills/应用-hook/
├── template/mvp|before|after/
├── references/
├── assets/few-shot-example/
└── evals/
```

## 触发词

全屏 loading、useLoading、composable 抽离、首屏占位闪烁、loadUserProfile 内联、refreshProfile、profileLoaded、inline fetch 改 hook、页面形态选型

## 质量状态

- Darwin 总分：**88.2**（Round 4 · 形态 E 实仓 + prompt 8 full_test）
- 详见 [`evals/darwin-results.tsv`](evals/darwin-results.tsv)、[`evals/full-test-results.md`](evals/full-test-results.md)

## 泛化材料

- [`references/page-archetypes.md`](references/page-archetypes.md) — 列表/详情/弹窗选型与命名表
- [`template/mvp/.../usePageData.skeleton.ts`](template/mvp/src/views/_shared/usePageData.skeleton.ts) — 非 profile 拷贝起点
- [`detail-page-hook-replace.md`](assets/few-shot-example/detail-page-hook-replace.md) — 详情页 few-shot
