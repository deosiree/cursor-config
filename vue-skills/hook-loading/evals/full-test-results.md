# full_test 结果（Round 3）

> eval_mode=full_test · 子 agent 盲测 · 2026-06-11

## Prompt 4：报表详情改 composable

| 组别 | 自评 | 路由 | 形态 | hook 命名 | delay | 关键差异 |
|------|------|------|------|-----------|-------|----------|
| **with_skill** | **9** | apply-hook | A | `useReportDetail` | 0 | skeleton 拷贝、禁止 useProfile、refresh 静默 |
| baseline | 6 | — | — | `useReportDetail` | 0（若 grep 到） | 易 double loading、漏 onUnmounted、半抽 hook |

**skill 增益**：+3（泛化命名表 + detail few-shot 防止照抄 useProfile）

## Prompt 5：告警列表 loading，不抽 composable

| 组别 | 自评 | 形态 | 建 hook? | delay | 关键差异 |
|------|------|------|----------|-------|----------|
| **with_skill** | **9** | B | **否** | 500 | list-fragment 范式、明确边界 |
| baseline | 8 | — | 否 | 500 | 能找对写法，但依赖仓库 grep；发现 alarmInfo `.then()` bug |

**skill 增益**：+1（形态 B 决策树更明确；baseline 无 skill 也能做对但路径更长）

## dim8 复评（基于 full_test）

| 锚点 | 结果 |
|------|------|
| prompt 4 输出 useProfile | ❌ 未发生 |
| prompt 5 创建 useAlarmList | ❌ 未发生 |
| with_skill 均值 | 9.0 |
| baseline 均值 | 7.0 |
| **dim8 得分** | **8.8 / 10**（加权 20.2） |

## shouldNotTrigger（边界验证）

| id | prompt | shouldTrigger | with_skill 判定 | 边界清晰度 |
|----|--------|---------------|-----------------|------------|
| 6 | 用户表格查询加 v-loading | false | 停止，走 el-table v-loading | 8/10（「列表+loading」未写全屏时易误判形态 B） |
| 7 | axios 拦截器全局 loading | false | 停止，走 request + loading.store | 9/10 |

## 从 baseline 沉淀的新反模式

opsdeck `alarmInfo/index.vue`：`startLoading()` + `.then()` 未 await + `finally stopLoading()` → 遮罩立即关闭。见 anti-patterns §10。

## Round 3 总分复评

| 项 | Round 2 (dry_run) | Round 3 (full_test) |
|----|-------------------|---------------------|
| dim8 | 8.2 → 18.9 | **8.8 → 20.2** |
| 其它维 | 不变 | 不变 |
| **总分** | 85.6 | **87.0** |
| Δ | +1.4 | +1.4 |

连续 Round 2、Round 3 的 Δ 均 < 2 → **HL-4 触顶信号**（与 85+ 双达标）。

---

## Round 4 · Prompt 8：安全配置闪默认值（实仓 before/after）

| 组别 | 自评 | 形态 | 命名 | 关键差异 |
|------|------|------|------|----------|
| **with_skill** | **9** | E | `configLoaded` + 保留 `useSecurityConfigPage` | 已有 composable 内接 loading；删 onMounted 叠打 |
| baseline | 7 | — | 可能仍用 useProfile 模式 | 能猜对方向，但易漏无权限 stopLoading、时序 |

**skill 增益**：+2（形态 E few-shot + 实仓 template 对照）

**实仓改造**：`apex_dev/src/views/system/securityConfig/`（useSecurityConfigPage + index.vue）

**baseline 反哺**：无权限 `!canSave` 早退须 `stopLoading()` — 已修入 after 样本。

## Round 4 总分复评

| 项 | Round 3 | Round 4 |
|----|---------|---------|
| dim6/dim8 | 资源整合+实测 | +形态 E 真代码 template |
| dim8 | 8.8 | **9.0**（prompt 8 验证通过） |
| **总分** | 87.0 | **88.2** |
| Δ | +1.4 | +1.2（HL-4 持续） |
