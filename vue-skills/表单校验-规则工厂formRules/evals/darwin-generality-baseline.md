# Darwin 质量与通用性评估记录

> **归档**：仅供质量评估历史，**不是** agent 执行依赖。执行以 `SKILL.md` + `feature-skills/` + `references/` 为准。

## 评估信息

| 项 | 值 |
|----|-----|
| skill | 表单校验-规则工厂formRules |
| 路径 | `.cursor/vue-skills/表单校验-规则工厂formRules` |
| 版本 | **v1.0.3（当前）** |
| 评估模式 | **`full_test`**（4/4 test-prompts，双臂推演 + explore 子 agent 复核） |
| 明细 | [`full-test-results.md`](full-test-results.md) |
| 对照样本 | 同级 `组件-操作列折叠` v1.2.1（Darwin 90.6，full_test） |

## 分数总览

| 版本 | Darwin 8 维 | 通用性专项 | 结论 |
|------|-------------|------------|------|
| v1.0.0 | **79.5** | **86** | dry_run；编排与 frontmatter 弱 |
| v1.0.1 | **~82** | **~88** | P1：触发词 + 阶段 A/B + Step 1–5 |
| v1.0.2 | **~85** | **~90** | P2：完整 template 片段 |
| **v1.0.3** | **88.1** | **92** | P3：full_test 4/4 Pass，维度 8 → 8.5 |

---

## v1.0.3 — 8 维 Rubric（P1+P2+P3 后）

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 9 | 7.2 | 含 formRules、表单校验、路由路径、ruleStyle 等触发词 |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | Step 1–5 + 阶段 A/B；full_test #1 验证两阶段 |
| 3 | 边界条件 | 10 | 9 | 9.0 | #4 拒 i18n Pass；unknown 走 MVP |
| 4 | 检查点 | 7 | 8 | 5.6 | 定位/拼参/i18n；#3 Plan 门禁依赖执行 |
| 5 | 指令具体性 | 15 | 9 | 13.5 | 完整 path/name template + 单测片段 |
| 6 | 资源整合 | 5 | 9 | 4.5 | test-prompts + full-test-results + results.tsv |
| 7 | 整体架构 | 15 | 9 | 13.5 | 5 feature + 风格登记 + 跨项目发现 |
| 8 | 实测表现 | 25 | **8.5** | **21.25** | full_test 4/4 Pass，见 [`full-test-results.md`](full-test-results.md) |

**Darwin 总分：88.1 / 100**（`eval_mode=full_test`）

---

## full_test 实测（维度 8）

| ID | 带 skill | vs baseline | 得分 |
|----|----------|-------------|------|
| 1 | A2+A3→B；template；无 locale；页面唯一性 | 易改 locale、漏 path 分段 | 8.5 |
| 2 | pageWireOnly 仅阶段 B | 重复造工厂 | 9.0 |
| 3 | unknown→MVP→Plan | 硬编码、跳过 Plan | 7.5 |
| 4 | 拒单 i18n | 误改 zh_CN | 9.5 |

**均分 8.6 → rubric 8.5**（#3 绿场无 formRules 时仍有 factoryGeneric 歧义，扣 0.5）

---

## 通用性专项（v1.0.3）

| 维度 | 得分 | 说明 |
|------|------|------|
| 跨仓库定位 | 18/20 | #2 repoRoot+moduleHint Pass |
| 职责边界 | **20/20** | #4 负例 Pass |
| 规则风格可扩展 | 17/20 | #3 提示登记 numericRange |
| 样本可迁移 | **19/20** | P2 完整 fragment 可拷贝 |
| 子 skill 可独立执行 | 18/20 | #1 验证 A→B 串行 |

**通用性：92 / 100**

---

## 剩余短板（非 P3 范围）

| 项 | 说明 |
|----|------|
| #3 绿场仓库 | 父 skill 可补一句：「无 formRules 文件时仍先 unknown→Plan，勿默认 factoryGeneric」 |
| 湿跑改码 | full_test 为推演，未在真实会话中改 MenuFormDialog 验证 |
| vs 操作列折叠 | 88.1 vs 90.6，差在缺少 before/after 全文件湿跑样本 |

---

## 结论

**v1.0.3 达到「推荐默认使用」水准（≥85）**，full_test 4/4 通过。可与 `组件-操作列折叠` 同级用于 nebula 表单校验类需求。

P1–P3 已完成；后续可选：补 #3 绿场澄清一句、或真实会话湿跑归档为 v1.0.4。
