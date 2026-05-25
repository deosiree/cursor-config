# Darwin 质量与通用性评估记录

> **归档**：仅供质量评估历史，**不是** agent 执行依赖。执行以 `SKILL.md` + `template/` + `references/` 为准。

## 评估信息

| 项 | 值 |
|----|-----|
| skill | 组件-操作列折叠 |
| 路径 | `.cursor/vue-skills/组件-操作列折叠` |
| 版本 | v1.0.0（初版） |
| 评估模式 | **`full_test`（4/4 test-prompts，子 agent 双臂模拟对比）** |
| 业务验证 | apex_dev commit **`5cc2e143`**：`calcOpStrip` 槽位语义、短符号名、`mkWidthCoord`；skill template/mvp 与 after 与 HEAD 对齐 |

## 分数总览

| 版本 | Darwin 8 维 | 通用性专项 | 结论 |
|------|-------------|------------|------|
| v1.0.0 | **87.7** | **84** | 结构扎实；实测 4/4；仅租户样本 |
| v1.1.0 | **88.5** | **92** | +用户表跨表样本；i18n 可选边界 |
| v1.2.0 | **89.2** | **93** | +菜单 few-shot/fragment/test#6；单轨 mvp |
| v1.2.1 | **90.6** | **93** | Phase2-r1：父 SKILL 检查点 + 样本速查 |
| **v1.3.0** | **91.0** | **94** | 对齐 5cc2e143：槽位语义、mvp 全量替换、role fragment、test-prompts 试跑 |
| **v1.3.0-re（当前）** | **92.7** | **96** | 2026-05-25 再评估：6/6 dry_run + #1/#5 子 agent；apex 单测 35 pass |
| **v1.3.1** | **93.5** | **97** | Phase2-r1：更新子 skill 补 tblProbeFp/status 链；#5 matches yes |

---

## v1.3.0-re — 再评估（2026-05-25）

| 项 | 值 |
|----|-----|
| 评估模式 | **dry_run 6/6** + 子 agent 抽检 **#1、#5**（`eval_mode=mixed`） |
| 真相源 | apex_dev `5cc2e143`；`template/mvp` 无旧 API；`operationWidth.test.ts` **35 passed \| 1 skipped** |
| 对比基线 | v1.2.1 **90.6** → v1.3.0-re **92.7**（**+2.1**） |

### 8 维 Rubric

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 9 | 7.2 | 中文 description；inject + 先路由 |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | RED§7 槽位误配 → 路由表 → 四格门禁 → 子 skill |
| 3 | 边界条件 | 10 | 9.5 | 9.5 | 何时不用 + 禁止探针表 + i18n 越权 + slot 误配表 |
| 4 | 检查点 | 7 | 8.5 | 5.95 | 槽位取值检查点 + 5 行样本速查（含角色 **3**） |
| 5 | 指令具体性 | 15 | 9.5 | 14.25 | `slot-semantics` 公式 + 2/6/3/4 与 after 一一对应 |
| 6 | 资源整合 | 5 | 10 | 5.0 | mvp+`__tests__` + 4 页 after + 4 few-shot + role + 5 references |
| 7 | 整体架构 | 15 | 9.5 | 14.25 | 父 agent + 新增/更新；租户/用户/菜单/角色四形态 |
| 8 | 实测表现 | 25 | 9.2 | 23.0 | 6/6 路由达标；#5 partial（tblProbeFp 在 probe 文非更新 SKILL） |

**Darwin 总分：92.7 / 100**

### 通用性专项（5×20）

| 维度 | 得分 | 说明 |
|------|------|------|
| 路由模式覆盖 | 19 | 新增/更新/组合 + layout 负路由稳定 |
| 反模式识别 | 20 | `anti-patterns` §13 槽位；禁止 `probe-data-rows` / 旧 width inject |
| 样本多样性 | 20 | 租户/用户全表 + 菜单/角色 fragment；P2「角色样本」已闭合 |
| 组件可迁移 | 20 | `template/mvp` 与 apex HEAD 同轨；grep 无旧符号 |
| 跨表迁移指引 | 17 | 四 few-shot + 更新 skill 五行表；**扣分**：status/`tblProbeFp` 仍主要在 `column-width-probe.md` |

**通用性专项：96 / 100（A）**

### test-prompts 干跑（6/6）

| id | 类型 | with_skill | matches_expected | 备注 |
|----|------|------------|------------------|------|
| 1 | 租户 6 槽全行内 | **9** | yes | 子 agent：更新 + `inline-visible-count=6` |
| 2 | 无 OpItem 新建 | **9** | yes | 新增 + mvp/`calcOpStrip`，无 `OPERATION_COLUMN_WIDTH_KEY` |
| 3 | 空白前端组合 | **9** | yes | 先新增 → 再更新 |
| 4 | 布局裁切 | **10** | yes | 拒用 → layout skill |
| 5 | 用户 1 行内+更多 | **8** | partial | 子 agent：`count=2` 正确；`tblProbeFp` 需读 probe 参考 |
| 6 | 菜单 3/4 槽 | **9.5** | yes | fragment + 禁止手写探针表 |

### 相对 v1.2.1 的主要增益

1. **`slot-semantics.md`**：消除「count=1 当 1 行内+更多」高频误配（#1/#5 baseline 典型翻车点）。
2. **`template/mvp` 全量对齐**：agent 拷贝即得 `calcOpStrip` / `mkWidthCoord`，非 legacy 路径。
3. **角色表样本 C**：通用性「样本多样性」从 19→20。

### 仍可选 P2（不必为冲分改父 SKILL）

| 优先级 | 缺口 | 建议 |
|--------|------|------|
| ~~P2~~ | ~~#5 tblProbeFp 未写入更新子 skill~~ | **v1.3.1 已闭合** |
| P3 | 维度 8 全量 full_test | 对 #5/#6 跑子 agent 双臂湿改（可选） |
| P3 | Darwin 成果卡片 PNG | 可选 |

---

## v1.3.1 — Phase 2 Round 1（2026-05-25）

| 项 | 值 |
|----|-----|
| 改动 | `feature-skills/更新-页面接入OperationColumn/SKILL.md`：GREEN §2 + 验收 #3 补 `tblProbeFp`/status 链 |
| 评估 | 子 agent 复跑 test-prompt **#5**：`matches_expected` **partial → yes**（9/10） |
| 棘轮 | 92.7 → **93.5**（**+0.8**），`status=keep` |

| # | 维度 | 变化 | 说明 |
|---|------|------|------|
| 5 | 指令具体性 | 9.5→**9.6** | 用户表 status 刷新可执行，直链 probe 文 |
| 8 | 实测表现 | 9.2→**9.5** | #5 达标；6/6 全 yes |
| — | 通用性·跨表 | 17→**18** | tblProbeFp 在更新路径可见 |

**Darwin 总分：93.5 / 100** | **通用性：97 / 100**

---

## v1.0.0 — 8 维 Rubric

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 9 | 7.2 | 中文 name/description；含触发场景与「先路由」 |
| 2 | 工作流清晰度 | 15 | 8 | 12.0 | 父级 RED→路由→验收清晰；GREEN 下沉子 skill，父级无逐步编号 |
| 3 | 边界条件 | 10 | 9 | 9.0 | 「何时不要使用」+ evals 负例；#4 拒用 layout 场景通过 |
| 4 | 检查点 | 7 | 6 | 4.2 | 有「必先执行」路由表；缺关键步骤用户确认门禁 |
| 5 | 指令具体性 | 15 | 9 | 13.5 | `inline-visible-count`、`perm`、`list-data-length`、template 路径具体 |
| 6 | 资源整合 | 5 | 10 | 5.0 | mvp/before/after + 3 references + 2 few-shot + 2 feature-skills |
| 7 | 整体架构 | 15 | 9.5 | 14.25 | 父 agent + 新增/更新子 skill + 55a0293 样本三角闭环 |
| 8 | 实测表现 | 25 | 9 | 22.5 | full_test 4/4：正例 #1–#3 + 负路由 #4 均达标 |

**Darwin 总分：87.7 / 100**（`eval_mode=full_test`，维度 8 为子 agent 模拟双臂，非湿改代码）

---

## v1.1.0 — 通用性专项（5 项 × 20）

| 维度 | v1.0 | v1.1 | 说明 |
|------|------|------|------|
| 路由模式覆盖 | 18 | **18** | 不变 |
| 反模式识别 | 17 | **19** | +职责越权（借操作列做 i18n）、optional-i18n |
| 样本多样性 | 16 | **19** | +用户表 before/after；A/B 双表 |
| 组件可迁移 | 18 | **19** | i18n 从必拷改为可选检查链 |
| 跨表迁移指引 | 15 | **17** | 双 few-shot + 更新 skill 样本表 |

**通用性专项：92 / 100（A-）**（v1.1.0）

## v1.1.0 — 结构微调（相对 v1.0）

| 维度 | 变化 | 说明 |
|------|------|------|
| 边界条件 | +0.5 | `optional-i18n.md` 明确不负责 i18n 迁移 |
| 指令具体性 | +0.3 | 双表样本 +「勿改 i18n」可执行 |
| 资源整合 | +0.5 | 4 references + 3 few-shot + 4 套 page template |

**Darwin 总分：88.5 / 100**（v1.1.0，结构复评；维度 8 仍沿用 v1.0 full_test 4/4）

---

## test-prompts.json（v1.0.0）

| id | 类型 | prompt 摘要 | expected |
|----|------|-------------|----------|
| 1 | 正例·更新 | TenantTable width=200 + 6 el-button，组件已有 | 更新子 skill、OpItem、去 width |
| 2 | 正例·新增 | 无 OpItem，新建溢出套件 | mvp 五件套、checkHasPerm、不改表 |
| 3 | 正例·组合 | 空白前端新列表 + 多按钮折叠 | 先新增 → 再更新 |
| 4 | 负路由 | 125% 缩放分页裁切、表格内部滚动 | **不触发** → layout skill |

---

## full_test（4/4 子 agent 双臂模拟）

### Prompt #1 — 租户表接入（更新）

| 维度 | Arm A (with_skill) | Arm B (baseline) |
|------|-------------------|------------------|
| completes_user_intent | **9/10** | **4/10** |
| vs_baseline | — | A **+8** |
| negative_effects | **2/10**（低=好） | **6/10** |
| matches_expected | **yes** | **no** |

**Arm B 典型误修：** 只调 width；保留 el-button；漏 `list-data-length`；把 `inline-visible-count=1` 当「1 行内+更多」（应为 **2**）；slot 内仍 el-button。

### Prompt #2 — 新建套件（新增）

| 维度 | Arm A | Arm B |
|------|-------|-------|
| completes_user_intent | **9/10** | **4/10** |
| matches_expected | **yes** | **no** |

**Arm B 典型误修：** 先改 TenantTable；五件套不全；保留 legacy v-auto-width；漏 checkHasPerm / i18n「更多」。

### Prompt #3 — 空白前端组合

| 维度 | Arm A | Arm B |
|------|-------|-------|
| 组合路由+顺序 | **28/30** | **5/30** |
| matches_expected | **yes** | **no** |

**Arm B 典型误修：** 直接写表 + width + el-button；自造 el-dropdown；跳过套件步骤。

### Prompt #4 — 布局高度（负路由）

| 指标 | Arm A | Arm B（competent） |
|------|-------|-------------------|
| skill_correctly_declined | **yes** | N/A |
| baseline_wrongly_triggered_skill | — | **no** |
| matches_expected | **yes** | **yes** |

**Arm A 要点：** 拒用本 skill → `layout-fixedHeadTail-adaptiveMiddle`；不出现 OperationColumn。

### full_test 维度 8 汇总

| prompt | 类型 | with_skill | baseline | 结论 |
|--------|------|------------|----------|------|
| #1 | 更新 | yes | no | **通过** |
| #2 | 新增 | yes | no | **通过** |
| #3 | 组合 | yes | no | **通过** |
| #4 | 负路由 | decline yes | no wrongly trigger | **通过** |

**维度 8 综合：9/10**（4/4 通过；扣 1 分：未做真实仓库湿改验证）

---

## 强项

1. **路由清晰**：「无 OpItem → 新增；有套件表仍 el-button → 更新」口诀可执行
2. **样本真实**：`template/mvp` + `legacy` + TenantTable before/after 均来自 `55a0293`
3. **负路由稳定**：与 layout skill 边界在 SKILL + evals 双层声明
4. **子 skill 可独立落地**：新增/更新各自含 RED/GREEN/验收，反空心化达标

## v1.1 已闭合

| v1.0 缺口 | v1.1 状态 |
|-----------|-----------|
| 仅 TenantTable before/after | **已闭合** — 用户表 B + `user-table-replace.md` |
| i18n 写进必拷流程 | **已闭合** — `optional-i18n.md`，顺带补键非主责 |

## v1.2 菜单样本（2026-05-22）

| 项 | 状态 |
|----|------|
| `menu-table-replace.md` + `test-prompts.json` #6 | **已闭合** |
| `template/after/.../menu/*.fragment.vue` | **已闭合**（主表 + 弹窗片段） |
| 功能化单轨 `template/mvp`（无 commit/legacy 执行路径） | 与 v1.1 收敛一致 |

**实测（dry_run）**：Darwin **89.2 / 100**；通用性专项 **93 / 100**（见下表）。

### v1.2 — 8 维 Rubric（2026-05-22）

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 9 | 7.2 | 中文 name/description；inject + list-data-length |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | RED→路由→子 skill→验收；父级不越权改码 |
| 3 | 边界条件 | 10 | 9 | 9.0 | 何时不用 + 禁止探针表 + optional-i18n |
| 4 | 检查点 | 7 | 8 | 5.6 | 改码前四格门禁 + 租户/用户/菜单样本速查 |
| 5 | 指令具体性 | 15 | 9 | 13.5 | template/mvp、before\|after、fragment 路径具体 |
| 6 | 资源整合 | 5 | 10 | 5.0 | mvp + 3 页样本 + 4 few-shot + 4 references |
| 7 | 整体架构 | 15 | 9 | 13.5 | 父 agent + 新增/更新；租户/用户/菜单三角 |
| 8 | 实测表现 | 25 | 9 | 22.5 | dry_run 6/6（含菜单 #6）；未跑子 agent 双臂 |

**Darwin 总分：89.2 / 100**（`eval_mode=dry_run`）

### v1.2.1 — Phase 2 Round 1（2026-05-22，commit `901a96b`）

| # | 维度 | 变化 | 说明 |
|---|------|------|------|
| 4 | 检查点 | 6→**8** | 父 `SKILL.md` 新增「改码前暂停」四格门禁 + 页面样本速查表 |
| 其余 | — | 不变 | 单轮只改检查点维度 |

**Darwin 总分：90.6 / 100**（+1.4，`eval_mode=dry_run`）

### v1.2 — 通用性专项（5×20）

| 维度 | 得分 | 说明 |
|------|------|------|
| 路由模式覆盖 | 18 | 新增/更新/组合 + 负路由 layout |
| 反模式识别 | 20 | PROBE_ROWS、probe-data-rows、i18n 越权 |
| 样本多样性 | 19 | 租户/用户全表 + 菜单 fragment；无菜单 before |
| 组件可迁移 | 19 | 单轨 template/mvp，与 apex_dev 对齐 |
| 跨表迁移指引 | 17 | 三 few-shot + 更新 skill 三行样本表 |

**通用性专项：93 / 100（A）**

## 仍可选 P2

| 优先级 | 缺口 | 建议 |
|--------|------|------|
| P2 | 角色表第三套样本 | `RoleListTable` 可作样本 C（权限较少）；菜单 before 全页可选 |
| P2 | test-prompt #5 未 full_test | 对用户表 prompt 跑子 agent 双臂 |
| P3 | Darwin 成果卡片 PNG | 可选 |

---

## results.tsv

```tsv
timestamp	commit	skill	old_score	new_score	status	dimension	note	eval_mode
2026-05-22T12:00	baseline	组件-操作列折叠	-	87.7	baseline	8维+通用性	v1.0.0初评	full_test
```

---

## 结论

- **质量评估（Darwin）**：**93.5 / 100（v1.3.1）**，Phase2-r1 **keep**；较 v1.3.0-re **+0.8**。
- **通用性评估**：**97 / 100（A）**；#5 tblProbeFp 链路已闭合。
- **职责边界**：操作列格式为主；i18n 仅 optional-i18n 检查链，禁止顺带业务 i18n 迁移。
- **下一 ROI**：可选 full_test 湿改或成果卡片；父 SKILL 无需再堆叠。

---
