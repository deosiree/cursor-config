# Darwin 基线评估：盘点-推荐下一表单字段

> **evaluate-only**（未进入优化循环）。评估对象：`feature-skills/盘点-推荐下一表单字段/SKILL.md` + 支撑 `references/form-field-inventory-model.md` + `assets/few-shot-example/inventory-recommendation-sample.md`。

## 评估信息

| 项 | 值 |
|----|-----|
| skill 节点 | 盘点-推荐下一表单字段（formRules 套件子 feature） |
| 套件版本 | v1.0.3 + 盘点 feature（新增） |
| 评估模式 | **`full_test`**（test-prompt #5 + 负例推演；#5 在 apex_dev 菜单域做仓库扫描复核） |
| 对照 | 父套件 Darwin **88.1**（v1.0.3） |

---

## 8 维 Rubric

| # | 维度 | 权重 | 得分(1-10) | 加权 | 简评 |
|---|------|------|------------|------|------|
| 1 | Frontmatter 质量 | 8 | **9** | 7.2 | `name` 中文功能名；description 含 repoRoot、覆盖度、只读盘点、触发语义 |
| 2 | 工作流清晰度 | 15 | **9** | 13.5 | I1–I5 表格式步骤，每步有产出；与父 skill 分支衔接明确 |
| 3 | 边界条件 | 10 | **9** | 9.0 | 「何时不要使用」3 条；禁止改码；0 候选 / >5 Form / 盘点+改码 分叉 |
| 4 | 检查点设计 | 7 | **8** | 5.6 | tie-break、二选一暂停；缺「componentPath 已给则跳过」的**负例 test-prompt** |
| 5 | 指令具体性 | 15 | **8** | 12.0 | 输出契约 7 字段强制；评分权重在 reference；**feature 正文未内嵌 §7 rg 命令**（依赖跳读） |
| 6 | 资源整合 | 5 | **9** | 4.5 | 链到 inventory-model、few-shot、project-discovery；路径可达 |
| 7 | 整体架构 | 15 | **9** | 13.5 | 与父路由、rule-style-registry「全仓推进」行一致；landingStatus 闭环清晰 |
| 8 | 实测表现 | 25 | **8** | 20.0 | 见下节；#5 湿扫 apex_dev 与 few-shot 一致 |

**Darwin 总分：85.3 / 100**（`eval_mode=full_test`）

---

## 维度 8：实测（test-prompt #5）

**Prompt**：检查仓库 apex_dev（或菜单模块），反馈最值得完善的一个表单元素，先不改代码。

### 带 skill 预期路径

1. 父 skill → 委派「盘点-推荐下一表单字段」
2. `project-discovery` → `resolvedRepoRoot=apex_dev`，`rulesModule=src/utils/formRules.ts`
3. `moduleHint=菜单` → 扫描 `src/views/system/menu/**/*.vue`
4. I3 分类 → `ApiConfigDialog.apiUrl` = `inlineDuplicated`（仅 required + 以 `/` 开头）
5. I4 评分 → pathLike 可复用、`MenuFormDialog` 已接 pathLike → 高分
6. I5 输出 → `recommendScore`、`formFieldCoverage`、`suggestedFieldsYaml`，**无源码 diff**

### apex_dev 扫描复核（2026-05-22）

| 证据 | 结论 |
|------|------|
| `MenuFormDialog` / `PermissionConfigDialog` 已 import formRules | 同模块半接入 |
| `ApiConfigDialog.vue` `apiUrl` 内联 validator「必须以 / 开头」，未 import formRules | **inlineDuplicated**，与 few-shot 一致 |
| `perm` 两处以 required only | 备选 ~85 分 |
| 菜单 views 内 4 个 Form 组件、约 17 个 prop 量级 | 覆盖度可量化 |

**vs baseline（无 skill）**：易直接改码、无 `recommendScore` 依据、无 `formFieldCoverage`、可能推荐描述类低价值字段。

| 判定 | 得分 |
|------|------|
| 完成用户意图（只推荐） | 9 |
| 明显优于 baseline | 8 |
| 无负面（未误改 locale/代码） | 9 |

**维度 8 均分 → rubric 8.0**（大仓全量扫描时 agent 可能漏扫，扣 0.5）

### 负例推演（未写入 test-prompts.json）

| 场景 | 带 skill | 得分 |
|------|----------|------|
| 已给 `componentPath` + `fields[]` | 应跳过盘点 → 父 Step 4 | 9 |
| 「补菜单 i18n」 | 非套件职责，不进入 I1 | 9 |

---

## 通用性（子 feature 专项，满分 100）

| 维度 | 得分 | 说明 |
|------|------|------|
| 跨仓库 | 17/20 | 仅需 repoRoot；大仓扫描一致性依赖执行纪律 |
| 职责边界 | 20/20 | 只读 vs 父 skill 实施分离明确 |
| 可迭代闭环 | 19/20 | `landingStatus` + `needsWork` 支持多轮 |
| 样本可迁移 | 18/20 | few-shot 形态完整；缺 feature 级 `test-prompts.json` |
| 与父套件协同 | 18/20 | `suggestedFieldsYaml` 可复制；父路由已登记 |

**通用性：92 / 100**

---

## 短板与 P1 优化建议（未执行）

| 优先级 | 项 | 建议 |
|--------|-----|------|
| P1 | 无 feature 级 `test-prompts.json` | 在 `feature-skills/盘点-推荐下一表单字段/` 增 2–3 条（#5 + 跳过盘点负例 + moduleHint 歧义） |
| P1 | §7 扫描命令仅在 reference | 在 feature SKILL 的 I2 增一行「必须执行」rg 清单 |
| P2 | 大仓性能 | reference 增「>80 候选时先按 moduleHint 或 top-N 弱规则过滤」 |
| P2 | 与父套件分数 | 父 88.1 + 子 feature 85.3；合并宣传可用「盘点能力 ≥85，推荐默认使用」 |

---

## 结论

| 指标 | 值 |
|------|-----|
| 子 feature Darwin | **85.3** |
| 是否达「推荐默认使用」（≥85） | **是（边际通过）** |
| 是否进入优化循环 | **否**（evaluate-only；P1 可选后再评） |
| 与父套件关系 | 补强全仓落地闭环，不拉低父级 full_test #1–#4 |

**下一步（若用户确认优化）**：P1 补 feature 级 test-prompts + I2 内嵌扫描命令 → 目标维度 5/8 各 +0.5，总分 **~86.5**。

---

## Phase 2 Round 1（P1，2026-05-22）

| 项 | 值 |
|----|-----|
| 改进维度 | 5 指令具体性 + 4 检查点 + 8 实测（同批 P1） |
| 改动 | I2 必跑 `rg` 四步 + 结果量门禁；`test-prompts.json` #1–#3；检查点 #2 跳过盘点 |
| old → new | **85.3 → 87.2** |
| status | **keep** |
| eval_mode | `dry_run`（#1–#3 推演复评） |

### Round 1 复评（8 维变化）

| # | 维度 | 前 | 后 | Δ |
|---|------|----|----|---|
| 4 | 检查点 | 8 | **9** | +1 |
| 5 | 指令具体性 | 8 | **9** | +1 |
| 8 | 实测表现 | 8 | **8.5** | +0.5 |
| 其余 | — | — | 不变 | — |

**Round 1 后总分：87.2**（仍低于父套件 88.1，但子 feature 已脱离「边际通过」）
