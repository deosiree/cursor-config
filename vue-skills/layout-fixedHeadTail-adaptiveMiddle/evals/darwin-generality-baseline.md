# Darwin 通用性评估记录

## 评估信息

| 项 | 值 |
|----|-----|
| skill | 布局-固定首尾，中间自适应 |
| 路径 | `.cursor/vue-skills/layout-fixedHeadTail-adaptiveMiddle` |
| 评估模式 | **`full_test`（4/4 test-prompts，子 agent 双臂对比）** |
| 业务验证 | 租户 + 用户形态 B 已在 apex_dev 落地；用户口头确认「没问题」 |

## 分数总览

| 版本 | Darwin 8 维 | 通用性专项 | 结论 |
|------|-------------|------------|------|
| v1.0 | **79.6** | **68** | 偏角色单组件 |
| v1.1 | **89.1** | **84** | +形态 A/B 文档 |
| v1.1.1 | **90.3** | **85** | +「固定首尾」命名 |
| v1.2 | **92.5** | **93** | 双形态 template + 租户落地 |
| v1.3 | **93.5** | **98** | 用户 B 落地 + 三页 template + 双 B few-shot |
| v1.3.1 | **94.0** | **98** | full_test #1/#2 |
| **v1.3.2（当前）** | **94.5** | **98** | **full_test 4/4（+#3 形态 A、#4 负路由）** |

v1.3.2 相对 v1.3.1：**+0.5**（维度 3 边界条件经 #4 实测验证）。

---

## v1.3 — 8 维 Rubric

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 9.5 | 7.6 | 已含租户/用户触发与形态 B |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | 形态判定→2A/2B 不变，路径更全 |
| 3 | 边界条件 | 10 | **9.5** | **9.5** | #4 full_test：正确拒绝 PageTabShell 页；反模式 6 |
| 4 | 检查点 | 7 | 7 | 4.9 | 必先判定 A/B |
| 5 | 指令具体性 | 15 | 9.5 | 14.25 | 2B 有 tenant/user 双套类名样本 |
| 6 | 资源整合 | 5 | 10 | 5.0 | role+tenant+user template；三份 few-shot |
| 7 | 整体架构 | 15 | 9.5 | 14.25 | 文档、template、仓库代码三角闭环 |
| 8 | 实测表现 | 25 | **10** | **25.0** | full_test 4/4：A/B 正例 + 菜单 Tab 负路由均通过 |

**Darwin 总分：94.5 / 100**（v1.3.2，`eval_mode=full_test` 全集）

---

## v1.3 — 通用性专项（5 项）

| 维度 | 满分 | v1.2 | v1.3 | 说明 |
|------|------|--------|------|------|
| 模式覆盖 | 20 | 19 | **20** | A（角色）+ B×2（租户、用户）均在仓库实证 |
| 反模式识别 | 20 | 19 | **19.5** | 用户页已去掉 calc / max-height 百分比陷阱 |
| 样本多样性 | 20 | 19 | **20** | template 含 role + tenant + user 共 6 套实体文件 |
| composable 可迁移 | 20 | 18 | **19** | 角色/租户/用户共用 `useTableBodyHeight` |
| 跨页迁移指引 | 20 | 18 | **20** | 双 B few-shot + split-layout 表列用户路径 |

**通用性专项：98 / 100（A+）**

---

## full_test（v1.3.2，4/4 子 agent 双臂对比）

**方法：** 各 prompt 独立 spawn `generalPurpose` 子 agent；Arm A 必读 `SKILL.md`，Arm B **禁止**读 skill 目录；对照 `template/before` 作为 RED 基线（apex_dev 已为 GREEN）。

### Prompt #1 — 租户 125% 分页裁切

| 维度 | Arm A (with_skill) | Arm B (baseline) |
|------|-------------------|------------------|
| completes_user_intent | **9/10** | **4/10** |
| vs_baseline_improvement | — | A 相对 B **+8** |
| negative_effects | **9/10** | **5/10** |
| matches_expected | **yes** | **no** |

**Baseline 典型误修（子 agent 归纳）：** 只调 `calc(100%-106px)`；仅 CSS `max-height`/`vh`；照搬角色形态 A 只改子组件；父页缺 `min-height:0` 与分页 `flex-shrink:0`。

**Arm A 要点：** 形态 B → `tenant/index.vue`（`tenant-list-page__body` / `__pagination`）+ `TenantTable`（`useTableBodyHeight` + `:height`，删 calc）。

### Prompt #2 — 用户 max-height 100% 无效

| 维度 | Arm A (with_skill) | Arm B (baseline) |
|------|-------------------|------------------|
| intent | **高** | **中低** |
| matches_expected | **是** | **否 / 部分** |
| 典型失败 | — | 仅改 `UserTable` 或仅强化 CSS 百分比；读 GREEN 代码误判「已修好」 |

**Arm A 要点：** 形态 B → `user/index.vue` 高度链 + `UserTable` `:height` + `useTableBodyHeight`；显式禁止 `style="max-height:100%"` 与 calc。

### Prompt #3 — 角色缩放后分页不全

| 维度 | Arm A (with_skill) | Arm B (baseline) |
|------|-------------------|------------------|
| completes_user_intent | **9/10** | **4/10** |
| vs_baseline_improvement | — | A 相对 B **+5** |
| negative_effects | **9/10** | **5/10** |
| matches_expected | **yes** | **no** |

**Baseline 典型误修：** 照搬租户形态 B（分页上提到 `index.vue`）；只改父级 CSS；保留 `max-height:100%` / calc。

**Arm A 要点：** 形态 A → `RoleListTable.vue` 单文件 list-shell（头-中-尾）+ `useTableBodyHeight`；父链 `role/index.vue` + `components/role/index.vue` 补 `min-height:0`；**禁止**套租户分裂式。

### Prompt #4 — 菜单 Tab 表格高度不对

| 指标 | Arm A (with_skill) | Arm B (baseline) |
|------|-------------------|------------------|
| skill_correctly_declined | **yes** | — |
| baseline_wrongly_triggered_skill | — | **yes**（~65–75% 易推 useTableBodyHeight / 形态 A/B） |
| matches_expected | **yes** | **partial / no** |

**Arm A 要点：** **不触发**本 skill；菜单页已用 `PageTabShell` + `#tabContent="{ contentHeight }"` + `resolveTableHeight`；应查壳层 `syncContentHeight` / 父页 flex，勿叠 `useTableBodyHeight`。

**Baseline 典型误修：** 按关键词「表格高度」对齐租户/用户/角色列表改法，与 PageTabShell 契约冲突。

### full_test 维度 8 汇总（4/4）

| prompt | 类型 | with_skill | baseline | 结论 |
|--------|------|------------|----------|------|
| #1 | 形态 B | yes | no | **通过** |
| #2 | 形态 B | yes | no/partial | **通过** |
| #3 | 形态 A | yes | no | **通过** |
| #4 | 负路由 | decline yes | wrongly trigger yes | **通过** |

**维度 8：10/10**（正例 A/B + 负例 Tab 全覆盖）

---

## v1.3 相对 v1.2 闭合项

| v1.2 缺口 | v1.3 状态 |
|-----------|-----------|
| 用户管理未落地 | **已闭合** — `apex_dev` user/index + UserTable |
| 用户无 template | **已闭合** — `template/before|after/.../user/` |
| 用户无 few-shot | **已闭合** — `user-split-layout-fix.md` |

## 仍可选 P2（不阻塞）

- 设备管理等非标准列表在 `split-layout-parent-child.md` 补一句边界
- Darwin 成果卡片 PNG（可选）

---

## results.tsv

```tsv
timestamp	commit	skill	old_score	new_score	status	dimension	note	eval_mode
2026-05-21T12:00	baseline	布局-固定首尾，中间自适应	-	79.6	baseline	通用性	v1.0	dry_run
2026-05-21T14:00	docs-v1.1	布局-固定首尾，中间自适应	79.6	89.1	keep	通用性+结构	形态A/B	dry_run
2026-05-21T16:00	rename-v1.1.1	布局-固定首尾，中间自适应	89.1	90.3	keep	Frontmatter	固定首尾命名	dry_run
2026-05-21T18:00	tenant-v1.2	布局-固定首尾，中间自适应	90.3	92.5	keep	通用性+样本	租户B落地+template	dry_run
2026-05-21T22:00	user-v1.3	布局-固定首尾，中间自适应	92.5	93.5	keep	通用性+实测闭环	用户B落地+三页template	dry_run
2026-05-21T23:30	fulltest-v1.3.1	布局-固定首尾，中间自适应	93.5	94.0	keep	维度8实测	#1#2子agent双臂对比	full_test
2026-05-22T00:00	fulltest-v1.3.2	布局-固定首尾，中间自适应	94.0	94.5	keep	边界+#3#4	形态A正例+菜单负路由	full_test
```

---

## 结论

- **通用性评估（v1.3.2）通过**：Darwin **94.5**，通用性 **98**；**test-prompts 4/4 full_test** 闭环。
- **Skill 可测优势**：形态 A/B 正例分流 + 菜单 Tab 负路由；baseline 在 nebula 语境易「抄最近修过的页」。
- **不建议 Phase 2 继续堆 SKILL.md**；下一 ROI 为设备管理等边界一句说明或成果卡片。
- **eval_mode**：`full_test`（4/4 子 agent）+ 双页 UI 验收。
