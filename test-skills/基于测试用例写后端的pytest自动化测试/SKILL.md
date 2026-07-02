---
name: 基于测试用例写后端的pytest自动化测试
description: >-
  从 CSV 自测单驱动 hytests/ pytest：csv_case、cases_registry、gen_readme、
  case_report 可观测性、中文终端、automation_doc。implemented 强制 G6。
  何时用：CSV 映射 pytest、批量补 hytests、生成自测手册。
  何时不用：纯 UI CSV、无 CSV 的官方 tests/。
  触发词：CSV自测单自动化、hytests、csv_case、case_report、latest.log、gen_readme。
---

# 基于测试用例写后端 pytest 自动化测试（Agent）

## 目标

将 **CSV 自测单** 中的用例 ID 映射为可执行的 **hytests/** pytest 套件，并自动生成 **Obsidian 可读** 的自测手册（含相对路径、行号、pytest node）。

黄金样本：`nebula/seccenter/hytests`（`test_mvp_menu_9909_9913.py`、`cases_registry.yaml`、`scripts/gen_readme.py`）。

## 何时使用

- 从 `docs/自测单/*.csv` 为后端 API 写 **CSV ID 对齐** 的 pytest
- 维护 `hytests/cases_registry.yaml` 与 `@pytest.mark.csv_case("{id}")`
- 生成或修复 **450+ 条** 级 `hytests/README.md`（H4–H6 层级、实现位置表格）
- 跑覆盖率：`python scripts/csv_coverage.py`

## 何时不要使用

- 仅需 Vitest / UI 交互 CSV → [[../输出csv的测试用例/SKILL.md]]
- 无 CSV 映射，只写 `tests/test_NN_*.py` 官方集成测试 → [[../写pytest集成测试/SKILL.md]]
- FastAPI 进程内 mock TDD → 项目内 agent-testing / TDD skill
- Playwright UI E2E → 独立 skill

## Agent 工作循环（逐步）

| 步 | 名称 | 输入 | 输出 |
|----|------|------|------|
| 1 | RED | 用户 prompt + 5 字段契约 | `missingFacts` 或进入 GREEN |
| 2 | GREEN | intention + feature | `test_*.py` / registry / gen_readme 补丁 |
| 3 | REFACTOR | 产出代码与文档 | `qualityReport` + Darwin 评分 |
| 4 | 交付 | `qualityReport.passed=true` | 运行命令 + 覆盖率摘要 |

### RED（先判）

必读 [[references/csv-hytests-workflow.md]] 与 [[references/hytests-vs-official-tests.md]]。

核对下表（缺一则记入 `missingFacts`，勿猜测）：

| 字段 | 用途 | 示例 |
|------|------|------|
| `targetRepo` | 目标仓库 | `nebula/seccenter` |
| `csvPath` | CSV 自测单路径 | `docs/自测单/用例导出_*.csv` |
| `hytestsDir` | hytests 目录 | `{repo}/hytests` |
| `caseIds` | 目标用例 ID | `9909-9913` / `155,156` |
| `deliverables` | 交付物 | `pytest` / `registry` / `readme` / `all` |

**🔴 CHECKPOINT · RED 结束**：`csvPath` 不存在或 `caseIds` 在 CSV 中无匹配 → **STOP**，只输出追问清单，**禁止**生成 `test_*.py` 或改 README。

路由现状分析 → [[intention-skills/分析-CSV自动化现状/SKILL.md]]（可选，复杂任务先跑）。

### 失败模式与兜底（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| CSV 路径不存在 / 用例 ID 无匹配 | 核对 `csvPath`、glob 最新导出文件 | 记入 `missingFacts`，**STOP** |
| Gateway 401 / 连不上 | 核对 `.env.local`、Gateway 非 SPA | 输出 [[references/hytests-vs-official-tests.md]] 环境表，**STOP** |
| `pytest` node 收集失败 | 核对 registry `pytest` 与类名/函数名 | 修 registry 或 test 文件，重跑 `--collect-only` |
| README JSON 不渲染 | 查是否有 `<details>` 或缩进 code block | 修 `gen_readme.py`，见 [[references/readme-format-rules.md]] |
| `csv_coverage` marker 重复 | 同一 case_id 出现在多个 test 文件 | 合并 marker 到单文件 |
| `DB=[]` 但 export 有数据 | 用 `menu/tree` 验隔离项目 | 改 `menu/list`，见 [[references/hytests-api-pitfalls.md]] |
| 只有测试摘要无 YAML | Cursor 折叠 PASSED 的 stdout | 打开 `hytests/.test-reports/latest.log` |
| implemented 无 case_report | 未接 G6 可观测性 | → [[feature-skills/接入-用例验证摘要与中文终端/SKILL.md]] |
| 误路由到 `写pytest集成测试` | 用户要 CSV ID 对齐 hytests | **STOP**，告知用本 skill |
| 误路由到 `输出csv的测试用例` | 用户要 hytests 自动化非 UI CSV | **STOP**，切换 skill |
| 质量自检 G1–G5 任一项失败 | 按 [[feature-skills/质量-覆盖率自检/SKILL.md]] 修 | `passed=false` 时 **禁止** 宣称完成 |

### GREEN（Single Dispatch）

**禁止**主 skill 一轮 dispatch 多个 intention。

| 信号 | 路由 |
|------|------|
| 尚无 hytests 或首批 MVP（如 9909–9913） | [[intention-skills/策略-从CSV写MVP用例/SKILL.md]] |
| 已有 hytests，批量补 case_id | [[intention-skills/策略-批量补自动化/SKILL.md]] |
| 只改 README / gen_readme 格式 | [[intention-skills/策略-仅生成README/SKILL.md]] |

Feature 组合（一次主 feature，可串联 REFACTOR）：

| 任务 | feature |
|------|---------|
| 写 test_*.py + marker | [[feature-skills/撰写-csv_case标记测试/SKILL.md]] |
| 接入 case_report + 中文终端 | [[feature-skills/接入-用例验证摘要与中文终端/SKILL.md]] |
| 写 registry 条目 | [[feature-skills/撰写-cases_registry条目/SKILL.md]] |
| 生成 README | [[feature-skills/生成-README手册/SKILL.md]] |
| 覆盖率门禁 | [[feature-skills/质量-覆盖率自检/SKILL.md]] |

**🔴 CHECKPOINT · GREEN 结束**：未选定唯一 intention 或同时改 pytest+gen_readme 却无 `deliverables: all` → **STOP**，让用户确认交付范围。

### REFACTOR（强制门禁）

1. [[feature-skills/质量-覆盖率自检/SKILL.md]]（含 **G6 可观测性**）
2. [[feature-skills/darwin质量评估与迭代/SKILL.md]]（100 分制 rubric，见 [[evals/evaluate-only-baseline.md]]）
3. `qualityReport.passed=false` → **STOP**，不得宣称完成

**G6 强制：** 所有 `status: implemented` 用例必须接入 `case_report` 并产出 `latest.log`。

**🔴 CHECKPOINT · 交付前**：`qualityReport.passed=false` 或 Darwin 总分 <85 且无 HL-4 触顶记录 → 只输出 violations，不得标记任务完成。

## 每轮输出模板（dim5 固定格式）

```text
currentUnderstanding: ...
missingFacts: [...]          # 非空则 STOP
selectedIntentionSkill: ...
selectedFeatureSkills: [...]
csvHytestsOutputPlan:
  caseIds: [...]
  files: [{ path, action, markers?, pytestNodes? }]
  registryUpdates: [{ case_id, status, pytest, refs?, note? }]
  readmeAction: regenerate|skip|format-fix
  observability:
    caseReport: true|false          # implemented 必须 true
    automationDoc: docs/automation/{id}.md|null
    logPath: hytests/.test-reports/latest.log
  commands: ["pytest -k {id} -v", "python scripts/csv_coverage.py", "python scripts/gen_readme.py"]
qualityReport:
  passed: true|false
  violations: [{ rule, case_id?, file?, fix }]
darwinIntegrationMode: full
nextIterationAction: ...
```

## 输入契约

| 字段 | 必填 | 说明 |
|------|------|------|
| `targetRepo` | 是 | 含 `hytests/` 的仓库根 |
| `csvPath` | 是 | CSV 自测单路径 |
| `hytestsDir` | 否 | 默认 `{repo}/hytests` |
| `caseIds` | 否 | 目标用例 ID 范围 |
| `deliverables` | 是 | `pytest` / `registry` / `readme` / `all` |

## 反模式黑名单（dim9 · 禁止）

### 代码层

- README 用 `<details>` / `<summary>` 包裹 fenced code（Obsidian 不渲染）
- 测试步骤整块放进 ` ```text `（Markdown 结构失效）
- 只写 `tests/` 官方套件、无 `@pytest.mark.csv_case`（CSV 覆盖率无法对齐）
- hytests 里 `unittest.mock` 业务 HTTP（失去黑盒意义）
- **implemented 用例无 `case_report` fixture**（违反 G6）
- 用 `menu/tree` 断言隔离项目菜单树（见 pitfalls）
- JSON/bash 代码块缩进在列表项内（Obsidian 渲染不稳定）

### Agent 行为层（红灯动作）

| 红灯 | 后果 |
|------|------|
| `missingFacts` 非空仍生成代码 | **禁止** — 必须先追问 |
| 跳过 `质量-覆盖率自检` | **禁止** — 不得交付 |
| 主 skill 一轮 dispatch 多个 intention | **禁止** — Single Dispatch |
| 用户要 test_NN 官方套件却写 hytests | **禁止** — 路由 `写pytest集成测试` |
| 无 marker 仍宣称 CSV 已自动化 | **禁止** — 须补 csv_case |
| implemented 无 case_report | **禁止** — 须接 G6 |
| 手工改 600KB README 不跑 gen_readme | **禁止** — 下次生成覆盖丢失 |

## 资源速查

| 路径 | 用途 |
|------|------|
| [[references/csv-hytests-workflow.md]] | 全链路 |
| [[references/case-report-terminal-spec.md]] | case_report + 中文终端 + 日志 |
| [[references/hytests-api-pitfalls.md]] | menu/list、清空菜单等陷阱 |
| [[references/readme-format-rules.md]] | Obsidian Markdown 规范 |
| [[references/implementation-location-spec.md]] | 实现位置表格 |
| [[references/cases-registry-schema.md]] | registry 字段 |
| [[references/csv-case-marker-conventions.md]] | csv_case 命名 |
| [[references/hytests-vs-official-tests.md]] | hytests vs tests |
| [[assets/few-shot-example/seccenter菜单9909-9913/SKILL.md]] | before/after 样本 |
| [[template/hytests-MVP骨架/after/SKILL.md]] | MVP 目标态 |
| [[evals/test-prompts.json]] | Darwin 试跑 prompt |
| [[evals/evaluate-only-baseline.md]] | Darwin 100 分制 + 产物 14 分制 |
| [[evals/results/final-report.md]] | Darwin 终局报告 |
| [[README.md]] | 自然语言模板 |

## 使用示例

```text
使用 $基于测试用例写后端的pytest自动化测试：
- targetRepo: nebula/seccenter
- csvPath: docs/自测单/用例导出_云平台_安全平台___内测人：惠岩_20260702_131438.csv
- caseIds: 9909-9913
- deliverables: all
- 需求: 写菜单导入导出 MVP pytest，更新 registry，重生成 README；implemented 须 case_report + automation_doc
```

```text
CSV 155-160 菜单创建用例批量补 hytests 自动化，append 到 test_csv_menu.py，最后跑 csv_coverage。
```

```text
只修复 README：去掉 details 包裹，重跑 gen_readme.py，不改 pytest。
```
