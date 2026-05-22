# full_test 实测记录（test-prompts.json）

| 项 | 值 |
|----|-----|
| 版本 | v1.0.3 |
| 模式 | `full_test`（4/4 双臂推演；独立 explore 子 agent 复核） |
| 套件版本 | v1.0.2（含 P1 编排 + P2 完整 template） |

## 汇总

| ID | 带 skill | 无 skill 典型失误 | 符合 expected | 得分 |
|----|----------|-------------------|---------------|------|
| 1 | Step1–5；A2 name + A3 path；B 接入；唯一性在页面；无 locale；path 单测 | 改 locale、内联 validator、唯一性进工厂 | Pass | 8.5 |
| 2 | 仅阶段 B pageWireOnly → TenantFormFields | 重复造 createTenantNameRules | Pass | 9.0 |
| 3 | unknown → MVP → Plan → mvp 骨架 → 单测 | 硬编码 vue、跳过 Plan、改 i18n | Pass* | 7.5 |
| 4 | 「何时不要使用」拒单 | 直接改 zh_CN.json | Pass | 9.5 |

\* #3 若 agent 跳过 Plan 或误走 factoryGeneric 则降为 Fail；skill 已写 Plan 门禁，风险在执行层。

**维度 8 均分：8.6 → rubric 8.5**

## Prompt 1 明细（带 skill 路径）

1. `project-discovery` → `MenuFormDialog.vue` + `formRules.ts`
2. 确认 maxlength 8 / validateMax 128
3. 阶段 A2：`配置-多语言标识符命名` + `formRules.name.fragment.ts`
4. 阶段 A3：`配置-路径类规则` + `formRules.routePath.fragment.ts`（`allowParamSuffix`）
5. 阶段 B：`MenuFormDialog.wire.fragment.vue` + 页面组合 `ensureRoutePathUnique`
6. 单测：`formRules.routePath.test.fragment.ts`（含 `/user:id#` 拒绝）

## Prompt 4 明细（负例）

- 命中 `何时不要使用` + `evals/should-not-trigger-prompts.md`
- 不进入 Step 1–5，不改 `formRules.ts` / locale
