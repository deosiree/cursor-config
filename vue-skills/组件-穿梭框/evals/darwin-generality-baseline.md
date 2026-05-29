# Darwin 质量与通用性评估记录

> **归档**：仅供质量评估历史，**不是** agent 执行依赖。执行以 `SKILL.md` + `template/` + `references/` 为准。

## 评估信息

| 项 | 值 |
|----|-----|
| skill | 组件-穿梭框 |
| 路径 | `.cursor/vue-skills/组件-穿梭框` |
| 版本 | v1.0.0（初版） |
| 评估模式 | **`dry_run`（6/6 test-prompts 双臂推演；未 spawn 子 agent）** |
| 业务验证 | apex_dev HEAD `4685587`；template/mvp + 双样本 before/after 已提取 |
| 评估日期 | 2026-05-28 |

## 分数总览

| 版本 | Darwin 8 维 | 通用性专项 | Runtime gate | 结论 |
|------|-------------|------------|--------------|------|
| **v1.0.0** | **85.8** | **84** | **通过（0 红灯）** | 结构完整、双样本清晰；跨 skill 链接与域耦合待修 |
| **v1.1.0** | **89.2** | **86** | **通过** | P1 断链修复 + transfer-page-ui + UI 四必选；apex format 修正 |
| **v1.2.0** | **93.5** | **90** | **通过** | ProjectDeviceConfig 湿跑回归沉淀：dom-class-map + regression few-shot + #8 |
| **v1.3.0** | **94.8** | **92** | **通过** | 第二波：flex order、transfer-container 命中、间距 human-verified、DevTools 门禁、#9 |

---

## v1.0.0 — 基线评估

### Runtime 适配性（gate）

```text
grep 红灯扫描 SKILL.md README.md → 0 命中
```

| 检查项 | 结果 |
|--------|------|
| Claude Code / Cursor 钉死措辞 | 无 |
| 单一 runtime 安装路径 | 无 |
| MCP / hook 硬编码 | 无 |

**runtime_warn=0，gate 通过。**

### 8 维 Rubric

| # | 维度 | 权重 | 得分 | 加权 | 简评 |
|---|------|------|------|------|------|
| 1 | Frontmatter | 8 | 8 | 6.4 | 中文 name/description；触发词覆盖穿梭框/gateway；缺英文 alias |
| 2 | 工作流清晰度 | 15 | 9 | 13.5 | RED§7 → 路由表 → 检查点 → 子 skill；与 OperationColumn 同构 |
| 3 | 边界条件 | 10 | 8.5 | 8.5 | 何时不用 + anti-patterns；跨 skill 链接部分断裂 |
| 4 | 检查点 | 7 | 8 | 5.6 | 路由歧义 / Dialog vs Tab / gateway / 样式四格 |
| 5 | 指令具体性 | 15 | 9 | 13.5 | virtual-scroll 分场景、commit 真相源、具体 API 名 |
| 6 | 资源整合 | 5 | 7 | 3.5 | template 44 文件齐全；`mySkills` 相对路径不可达 |
| 7 | 整体架构 | 15 | 9 | 13.5 | 父 agent + 新增/更新；mvp/before/after 分层清晰 |
| 8 | 实测表现 | 25 | 8.5 | 21.25 | dry_run 6/6 路由正确；#5 域外需人工抽象 |

**Darwin 总分：85.8 / 100**

### 通用性专项（5×20，满分 100）

| 维度 | 得分 | 说明 |
|------|------|------|
| 路由模式覆盖 | 18 | 新增/更新/组合 + layout/i18n/操作列负路由 |
| 反模式识别 | 18 | 999999、virtual-scroll 误用、空 deviceActivate、`.el-panel` 混用 |
| 样本多样性 | 16 | Dialog+gateway 与 Tab+el-table 两形态；缺第三通用页（如纯 el-transfer） |
| 组件可迁移 | 19 | `template/mvp` 完整可拷贝；依赖仅 virtual-scroll-list |
| 跨上下文迁移指引 | 13 | 强绑定 DeviceGateway/getBind/租户角色；域外需读 gateway 通则自行抽象 |

**通用性专项：84 / 100（B+）**

### test-prompts 干跑（6/6）

| id | 类型 | with_skill | matches_expected | 备注 |
|----|------|------------|------------------|------|
| 1 | 租户 gateway+Dialog | 9 | yes | 更新样本 A + after gateway |
| 2 | 无 transfer 新建 | 9 | yes | 新增 mvp → 委派更新 |
| 3 | DeviceTab el-table | 9 | yes | 更新样本 B + tab-embedded-layout |
| 4 | 布局裁切 | 10 | yes | 拒用 → layout skill |
| 5 | 空白新仓库 | 7.5 | partial | 组合路径对；设备域 API 不可直接复用 |
| 6 | 空提交调接口 | 9 | yes | HEAD BindDeviceDialog 增量 |

### 相对 OperationColumn（v1.3.1 93.5）差距

| 项 | OperationColumn | 组件-穿梭框 v1.0 |
|----|---------------|------------------|
| Darwin 总分 | 93.5 | 85.8 |
| 通用性 | 97 | 84 |
| 样本数 | 4 页 + fragment | 2 页 + gateway 片段 |
| test-prompts | 6 + 子 agent 抽检 | 6 dry_run only |
| darwin 归档 | 多轮迭代记录 | 初版 |

---

## 主要短板（P0–P2）

### P1 资源整合

- [`SKILL.md`](../SKILL.md) L21：`../../mySkills/shownotification/SKILL.md` — vue-skills 下**路径不存在**（实际在 `.cursor/nebula-skills/shownotification/`）
- [`README.md`](../README.md) L47：`../api-gateway-add/SKILL.md` — 同上，应在 nebula-skills
- [`references/gateway-full-fetch.md`](../references/gateway-full-fetch.md) L29：`../../../mySkills/api-gateway-add` — 不可达

**建议**：统一改为 `../../nebula-skills/shownotification/SKILL.md` 等，或纯文本 skill 名 + AGENTS 发现顺序说明。

### P2 通用性

- **域耦合**：样本 A/B 均依赖 `DeviceGateway`、`mapBindDevicesToTabItems`；非 nebula 仓库 agent 需额外抽象「全量分页 helper + Transfer 接入」
- **第三样本**：`el-transfer-migration.md` 标注为扩展、非主 before；若提升通用性可升为主 template 片段（456e761^）
- **缺 evals.json / darwin 历史**：初版正常，后续迭代可补

### P2 实测

- 未跑子 agent `full_test`；维度 8 置信度低于 OperationColumn
- 建议下轮对 #1、#3 spawn 双臂对比

---

## 优势（保持）

1. **双场景对照清晰**：Dialog 大数据（virtual-scroll true）vs Tab 小列表（false）
2. **真相源分拆明确**：BindDeviceDialog after=HEAD；gateway after=cdb58504
3. **Runtime 中立**：无 Claude/Cursor 钉死，可跨 skills-compatible agent 安装
4. **template 实体完整**：mvp 15+ 文件 + before/after 可拷贝，非空心模板
5. **与 nebula 生态一致**：RED/GREEN、父 agent 委派、few-shot/evals 齐全

---

## 优化优先级建议（若进入 Phase 2）

| 优先级 | 动作 | 预期 Δ |
|--------|------|--------|
| P1 | 修复 nebula-skills 交叉引用（3 处） | 资源整合 +6 → 总分 +0.3 |
| P2 | 父 SKILL 增「域外迁移」1 段：抽象 fetchAllPages + 任意 gateway | 通用性 +4 |
| P2 | 补 `evals/darwin-generality-baseline.md` 链接到 test-prompts | 资源整合 +1 |
| P3 | #1/#3 full_test 子 agent 验证 | 实测 +1～2 |
| P3 | 第三样本 el-transfer 升格为 optional before 片段 | 样本多样性 +3 |

---

## v1.1.0 — Phase 2（2026-05-28）

| 项 | 值 |
|----|-----|
| 评估模式 | dry_run（含 test-prompt #7） |
| 变更 | `transfer-page-ui.md`；更新子 skill UI 四必选；nebula-skills 链接；BindDeviceDialog/DeviceTab `transferFormat` 空格 |

### 8 维（v1.1.0）

| # | 维度 | 得分 | Δ | 说明 |
|---|------|------|---|------|
| 6 | 资源整合 | 9 | +2 | 断链修复 + transfer-page-ui |
| 5 | 指令具体性 | 9.5 | +0.5 | UI 四必选可执行清单 |
| 3 | 边界条件 | 9 | +0.5 | format 空串反模式、纵向滚动 |
| 8 | 实测表现 | 8.8 | +0.3 | #7 路由命中 transfer-page-ui |

**Darwin 总分：89.2**（+3.4）

### 通用性专项：86（+2）

- UI 接入从样本隐含提升为显式检查表
- format 机制与 use-check 对齐（空格非空串）

### test-prompt #7

| id | prompt | matches |
|----|--------|---------|
| 7 | 无纵向滚动 / 面板 0/100 | yes → 更新 + transfer-page-ui |

---

## v1.2.0 — ProjectDeviceConfig 回归沉淀后（2026-05-28）

| 项 | 值 |
|----|-----|
| 评估模式 | **dry_run（8/8 test-prompts；未 spawn 子 agent）** |
| 触发事件 | apex `ProjectDeviceConfigDialog` 湿跑失败 → 沉淀后再次评估 |
| 新增资产 | `dom-class-map.md`、`project-device-config-regression.md`；RED #9/#10；test-prompt #8 |

### Runtime gate

`grep` 红灯 → **0 命中**（`runtime_warn=0`）

### 8 维（v1.2.0）

| # | 维度 | 得分 | Δ(v1.1) | 说明 |
|---|------|------|---------|------|
| 1 | Frontmatter | 8 | 0 | 触发词仍够用；可补「ProjectDeviceConfig」别名 |
| 2 | 工作流 | 9.5 | +0.5 | 回归 few-shot 补全「失败→根因→GREEN」闭环 |
| 3 | 边界条件 | 9.5 | +0.5 | Vite 字符串 template、横纵滚动语义、`.el-panel` |
| 4 | 检查点 | 9 | +1 | `dom-class-map` 独立检查点 |
| 5 | 指令具体性 | 10 | +0.5 | dom 表 + 禁止横滚 + SFC 约束可执行 |
| 6 | 资源整合 | 10 | +0.5 | +2 references + regression few-shot；template/after BindDevice 已与 dom-class-map 对齐 |
| 7 | 架构 | 9.5 | +0.5 | 第三样本 C + 父级 RED 10 条 |
| 8 | 实测表现 | 9.2 | +0.4 | **#8 可阻断湿跑级回归**（见下表） |

**Darwin 总分：93.5**（+4.3）

### 通用性专项：90（+4）

| 维度 | Δ | 说明 |
|------|---|------|
| 反模式识别 | +3 | 真实失败案例进 anti-patterns / regression |
| 样本多样性 | +2 | 样本 C（props 注入、无 gateway） |
| 跨上下文 | -1 | 仍强绑定 Device 域；域外靠通则抽象 |

### test-prompt 干跑（8/8）

| id | matches | with_skill(估) | 无 skill baseline(估) | 沉淀价值 |
|----|---------|----------------|----------------------|----------|
| 1–6 | yes | 8.5–9 | 6–7 | 沿用 v1.1 |
| 7 | yes | 9 | 7 | transfer-page-ui |
| **8** | **yes** | **9.5** | **~5** | **若无 dom-class-map/regression，易复现：空 checkbox + 左挤 + 横滚** |

**#8 干跑路径（with_skill）**：路由更新 → `transfer-page-ui` + `dom-class-map` → `project-device-config-regression` → fork BindDevice `.transfer-container`/`.el-panel` → 禁止字符串 template 与 `overflow-x`。

### 相对湿跑失败案例的覆盖度

| 湿跑根因 | v1.1 是否防住 | v1.2 是否防住 |
|----------|---------------|---------------|
| `defineComponent` 字符串 template | 否 | **是**（RED #9、anti-patterns、regression） |
| `:deep(.el-transfer-panel)` 不命中 | 部分（仅 Tab 提及） | **是**（dom-class-map + #8） |
| 横滚 vs 纵滚混淆 | 否 | **是**（transfer-page-ui 术语表） |

### P2 收尾（2026-05-28，已完成）

| 项 | 状态 |
|----|------|
| template/after + apex `BindDeviceDialog` `.full-height-transfer` 改为 `.el-panel` + filter `order:2` + 列表 `> div` 纵滚 | **已完成** |
| SKILL.md RED #5 统一为 format **空格** `" "`（非 `''`） | **已完成**（v1.2） |
| `should-trigger-prompts` #12–#14（ProjectDeviceConfig / `.el-panel` / 字符串 template） | **已完成**（v1.2） |
| apex `ProjectDeviceConfigDialog` `transferFormat` 与 BindDevice 一致 | **已完成** |

### 仍可选（P3）

1. 维度 8 仍为 **dry_run**；可对 test-prompt **#8** spawn 一次 full_test 双臂对比。
2. 浏览器手工验收：租户创建 → 配置设备 Dialog（左右等宽、三列文案、纵滚、tooltip、无横滚）。

---

## v1.3.0 — 第二波间距/order 沉淀后（2026-05-28）

| 项 | 值 |
|----|-----|
| 评估模式 | **dry_run（9/9 test-prompts；未 spawn 子 agent）** |
| 触发事件 | ProjectDeviceConfig 湿跑**第二波**失败：搜索框置顶、CSS 无变化、间距与 BindDevice 不一致 |
| 新增资产 | `transfer-page-ui.md` §⑤；regression 第二波；RED #11–#13；test-prompt #9；should-trigger #15–#17 |

### 8 维（v1.3.0）

| # | 维度 | 得分 | Δ(v1.2) | 说明 |
|---|------|------|---------|------|
| 4 | 检查点 | 9.5 | +0.5 | DevTools 验收 + §⑤ 间距/order 独立检查点 |
| 5 | 指令具体性 | 10 | 0 | human-verified padding 片段可执行 |
| 8 | 实测表现 | 9.5 | +0.3 | **#9 可阻断「改 CSS 无变化」**；仍建议 #8/#9 full_test |

**Darwin 总分：94.8**（+1.3）

### 相对湿跑失败案例的覆盖度（累计）

| 湿跑根因 | v1.2 | v1.3 |
|----------|------|------|
| 字符串 template / `.el-panel` / 横纵滚 | 是 | 是 |
| filter 无 order → 搜索置顶 | 否 | **是** |
| 间距写在错误选择器 → 0 命中 | 否 | **是** |
| EP 四边 padding 误导 | 否 | **是**（BindDevice 视觉 > EP） |
| 未 DevTools 验收即完成 | 否 | **是** |

### 仍存短板（P2）

1. ~~template/after BindDeviceDialog 仍混 `.el-transfer-panel`~~ → v1.3 已同步 HEAD（`.el-panel` + order）；`TransferOverflowText` 为可选参考 SFC。
2. 维度 8 仍为 dry_run；建议对 #8、#9 各 spawn 一次 full_test 双臂对比。

---

## results.tsv 行（可复制）

```tsv
timestamp	commit	skill	old_score	new_score	status	dimension	note	eval_mode
2026-05-28T-baseline	-	组件-穿梭框	-	85.8	baseline	-	v1.0.0初版；runtime_warn=0；通用性84	dry_run
2026-05-28T-phase2	-	组件-穿梭框	85.8	89.2	keep	资源整合+UI四必选	P1+transfer-page-ui	dry_run
2026-05-28T-v1.2	-	组件-穿梭框	89.2	93.5	keep	边界+实测	ProjectDeviceConfig回归沉淀	dry_run
2026-05-28T-v1.3	-	组件-穿梭框	93.5	94.8	keep	间距+order+DevTools	第二波湿跑沉淀	dry_run
```
