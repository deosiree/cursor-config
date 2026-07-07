---
name: 设计mock服务进行异常测试
description: >-
  从已筛选 CSV 驱动 apex_dev vite mock + hytests 手工自测：csv-error mock、
  error-scenario、8081 直连 + Console 注入权限、per-case README。
  何时用：CSV 异常 UI、mock 端点、前端 toast/空态自测。
  何时不用：后端 pytest hytests、Playwright E2E、改 vite 配置。
  触发词：mock异常、csv-error、8081注入、error-scenario、异常UI自测。
---

# 设计 mock 服务进行异常测试（Agent）

## 目标

将 **用户已筛选的 CSV 自测单** 映射为 **vite mock 端点** + **hytests 手工自测文档**，验证前端异常 UI（toast、不白屏、弹窗不关等）。

黄金样本：`nebula/apex_dev`（`mock/csv-error.mvp.mock.ts`、`hytests/`、3545/3570/3571）。

## 何时使用

- 传入已筛选 `csvPath`，为 **每一行** 写 mock + 用例 README
- 维护 `mock/csv-error*.mock.ts`、`.mock-shared/error-scenario.json`
- 方案 A：**8081 直连 + Console 注入权限**（见 [[references/手工自测流程-8081注入权限.md]]）

## 何时不要使用

- 后端 API pytest → [[../基于测试用例写后端的pytest自动化测试/SKILL.md]]
- 仅输出 CSV、不写 mock → [[../输出csv的测试用例/SKILL.md]]
- Playwright / Vitest E2E
- 修改 `vite.config.ts` 注册新 mock 插件

## Agent 工作循环

| 步 | 名称 | 输入 | 输出 |
|----|------|------|------|
| 1 | RED | 用户 prompt + 输入契约 | `missingFacts` 或进入 GREEN |
| 2 | GREEN | intention + feature | mock + registry + automation README |
| 3 | REFACTOR | 产出文件 | `qualityReport` + Darwin 评分 |
| 4 | 交付 | `qualityReport.passed=true` | curl 命令 + 文档路径清单 |

### RED（先判）

必读 [[references/csv-input-columns.md]]、[[references/target-repo-profiles.md]]、[[references/apex-mock架构与路径约定.md]]。

核对下表（缺一则记入 `missingFacts`，勿猜测）：

| 字段 | 必填 | 用途 | 示例 |
|------|------|------|------|
| `targetRepoProfile` | 否 | 落盘 profile | `apex_dev`（默认） |
| `csvPath` | 是 | **已筛选** CSV | `docs/自测单/异常_已筛选.csv` |
| `caseIds` | 否 | CSV 子集 | `3545,3570` |
| `deliverables` | 是 | 交付范围 | `mock` / `registry` / `readme` / `all` |
| `allowDarwin` | 否 | 质量试跑 | `true` |

**禁止二次筛选 CSV 行**。用户传入即全量处理（除非指定 `caseIds`）。

**🔴 CHECKPOINT · RED 结束**：`csvPath` 不存在或 `caseIds` 在 CSV 中无匹配 → **STOP**，只输出追问清单，**禁止**生成 mock 或改 registry。

路由分析 → [[intention-skills/分析-CSV异常用例/SKILL.md]]（复杂批次先跑）。

### 失败模式与兜底（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| CSV 路径不存在 / case_id 无匹配 | 核对 `csvPath`、glob 最新导出 | 记入 `missingFacts`，**STOP** |
| 8080 访问全真实数据、`code:0` | 改 **8081** 直连 | 输出 [[references/手工自测流程-8081注入权限.md]] 第 1 节 |
| mock 未命中 | 查 `forward/` 路径、`.env.development.local` | 见 [[references/apex-mock架构与路径约定.md]] Windows 正斜杠 |
| 「暂无页面访问权限」 | workflow 第 4 节 Console 注入 | `perm_status: pending_human`，浏览器步骤 **blocked** |
| 权限码无法从源码推断 | **AskQuestion** 请人类确认 | 不猜 `permissions`；mock/curl 可先交付 |
| 场景未切换 | 保存 `error-scenario.json` 后刷新 | 确认 mock `activeScenario()` 读文件 |
| curl 有 mock、页面没有 | 确认非 8080；清缓存 | 对照 Network URL 是否含 `/dev-api/forward/` |
| 误写 pytest / 改 vite | **STOP** | 路由 [[../基于测试用例写后端的pytest自动化测试/SKILL.md]] |
| 手工门禁 G1–G4 任一项失败 | 按 [[feature-skills/质量-手工自测门禁/SKILL.md]] 修 | `passed=false` 时 **禁止** 宣称完成 |
| mock README 膨胀 >40 行 | 步骤下沉 workflow / automation | 只保留索引表 |

### GREEN（Single Dispatch）

**禁止**主 skill 一轮 dispatch 多个 intention。

| 信号 | 路由 |
|------|------|
| 新 CSV 批次写 mock | [[intention-skills/策略-新增异常Mock用例/SKILL.md]] |

Feature 组合（一次主 intention，feature 可串联）：

| 任务 | feature |
|------|---------|
| mock 端点 | [[feature-skills/撰写-mock端点/SKILL.md]] |
| 用例 README | [[feature-skills/撰写-用例README/SKILL.md]] |
| registry | [[feature-skills/撰写-cases_registry条目/SKILL.md]] |
| 场景 JSON | [[feature-skills/维护-error-scenario/SKILL.md]] |
| 门禁 | [[feature-skills/质量-手工自测门禁/SKILL.md]] |
| Darwin | [[feature-skills/darwin质量评估与迭代/SKILL.md]] |

**🔴 CHECKPOINT · GREEN 结束**：未选定唯一 intention，或 `deliverables` 与实际操作不一致（如只写 readme 却改 mock）→ **STOP**，让用户确认交付范围。

### REFACTOR（强制门禁）

1. [[feature-skills/质量-手工自测门禁/SKILL.md]]（G1 环境 → G4 浏览器 / G4-blocked）
2. [[feature-skills/darwin质量评估与迭代/SKILL.md]]（`allowDarwin` 时；见 [[evals/evaluate-only-baseline.md]]）
3. `qualityReport.passed=false` → **STOP**，不得宣称完成

**🔴 CHECKPOINT · 交付前**：`qualityReport.passed=false` 或 Darwin 总分 <85 且无 HL-4 触顶记录 → 只输出 violations，不得标记任务完成。

## 文档分层（防 README 膨胀）

| 文档 | 位置 | 行数上限 |
|------|------|----------|
| 完整流程 | 技能 `references/手工自测流程-8081注入权限.md` + 仓库 `hytests/docs/workflow.md` | ~120 |
| Mock 瘦索引 | `mock/README.md` | ≤40 |
| 单用例 | `hytests/docs/automation/{id}.md` | 25–40 |
| 门户 | `hytests/README.md` | ≤40 |

用例 README **禁止**重复粘贴 Console 注入全文（链 workflow 第 4 节）。

## 每轮输出模板

```text
currentUnderstanding: ...
missingFacts: [...]          # 非空则 STOP
selectedIntentionSkill: 策略-新增异常Mock用例
selectedFeatureSkills: [...]
mockOutputPlan:
  profile: apex_dev
  caseIds: [...]
  files:
    - { path: mock/csv-error.mvp.mock.ts, action: append-scenario }
    - { path: hytests/docs/automation/3545.md, action: create }
  scenarioUpdates: [{ active, case_id }]
  registryUpdates: [{ case_id, mock_endpoint, perm_status }]
  readmeActions: [mock-index-row, skip-workflow-bloat]
  commands:
    - curl POST .../forward/seccenter/v2/user/list  # active=3545
qualityReport:
  passed: true|false
  curlChecks: [{ case_id, ok }]
  browserChecks: [{ case_id, ok|blocked|skipped }]
  violations: [{ rule, case_id?, file?, fix }]
darwinIntegrationMode: evaluate-after-delivery|skip
nextIterationAction: ...
```

## 输入契约

| 字段 | 必填 | 说明 |
|------|------|------|
| `targetRepoProfile` | 否 | 默认 `apex_dev`；见 [[references/target-repo-profiles.md]] |
| `csvPath` | 是 | 已筛选 CSV；**逐行全量**处理 |
| `caseIds` | 否 | 子集；未指定则 CSV 全量 |
| `deliverables` | 是 | `mock` / `registry` / `readme` / `workflow` / `all` |
| `allowDarwin` | 否 | 默认 `true` |

## 反模式黑名单（dim9 · 禁止）

### 代码 / 文档层

- mock `url` 不含 `forward/`（apex_dev 匹配失败）
- Windows 使用 `mock/base.ts` 的 `path.join` 拼 URL（应用正斜杠 defineMock）
- 用 HTTP 状态码判断 mock 命中（应为 JSON `code`）
- 在 **未启用 microfb mock** 的 8080 基座测子应用用例（请求走 syncloud）
- 单文件 `mock/README.csv-error-*.md` 堆全部用例步骤（应拆 workflow + automation）
- 用例 README 超 50 行且重复 workflow 全文
- 修改 **apex_dev** `vite.config.ts` / `env.d.ts` 注册 mock（用 `.env.development.local` 开关）；**microfb 首次 Phase 2 接线除外**
- 猜测 `permissions` 并标 `perm_status: ok`

### Agent 行为层（红灯动作）

| 红灯 | 后果 |
|------|------|
| `missingFacts` 非空仍生成 mock | **禁止** — 必须先追问 |
| 二次筛选 / 丢弃 CSV 行 | **禁止** — 用户已筛选 |
| 跳过 `质量-手工自测门禁` | **禁止** — 不得交付 |
| 主 skill 一轮 dispatch 多个 intention | **禁止** — Single Dispatch |
| 用户要 pytest 却写 csv-error mock | **禁止** — 路由后端 skill |
| 仅润色文案却改 mock 文件 | **禁止** — 不触发本 skill |
| `perm_status: pending_human` 却宣称浏览器通过 | **禁止** |
| Darwin <85 且无 HL-4 记录却宣称 skill 完成 | **禁止** |

## 资源速查

| 路径 | 用途 |
|------|------|
| [[references/apex-mock架构与路径约定.md]] | forward 路径、Windows 坑、8080/8081 |
| [[references/手工自测流程-8081注入权限.md]] | 7 节完整流程 + 权限人工门禁 |
| [[references/手工自测流程-8080基座mock.md]] | Phase 2 基座用例（3699）双进程流程 |
| [[references/csv-input-columns.md]] | CSV 列映射（非筛选） |
| [[references/cases-registry-schema.md]] | registry 字段 |
| [[references/用例README模板.md]] | automation 模板 |
| [[references/gitignore与本地产物约定.md]] | gitignore 条目 |
| [[references/target-repo-profiles.md]] | 多仓库落盘 |
| [[assets/few-shot-example/3545-3570-3571-mvp/SKILL.md]] | before/after 黄金样本 |
| [[template/mock-case-skeleton.mock.ts.snippet]] | mock 片段模板 |
| [[evals/test-prompts.json]] | Darwin 试跑 prompt |
| [[evals/evaluate-only-baseline.md]] | 100 分制 + 产物 12 分制 |
| [[evals/results/dry-run-evaluation.md]] | dim8 推演记录 |
| [[README.md]] | 自然语言模板 |

## 使用示例

```text
使用 $设计mock服务进行异常测试：
- targetRepoProfile: apex_dev
- csvPath: docs/自测单/异常处理_已筛选.csv
- deliverables: all
- 需求: CSV 全量写 mock、registry、automation README；workflow 放 hytests/docs/workflow.md；8081+注入权限
```

```text
caseIds: 3570,3571，deliverables: mock+readme，追加 role/create 与 role/list 场景分支。
```

```text
deliverables: readme — 只更新 automation/3545.md，不改 mock 文件。
```

```text
case 3465 权限码不确定：mock+curl 先交付，perm_status=pending_human，浏览器 blocked。
```
