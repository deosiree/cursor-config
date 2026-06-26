---
name: 写pytest集成测试
description: >-
  按 seccenter 风格撰写 pytest + requests HTTP 黑盒集成测试。产物：test_*.py + conftest/utils。
  何时用：补 API 集成测试、新建 test_NN 模块文件、seccenter 风格 CRUD/权限/隔离。
  何时不用：Vitest 单元、CSV 手工用例、FastAPI mock TDD、Playwright UI。
  触发词：pytest集成测试、HTTP黑盒测试、seccenter测试风格、补API集成测试、assert_success、TEST_AUTO_清理。
---

# 写 pytest 集成测试（Agent）

## 目标

为 nebula 类后端（以 **seccenter/tests** 为黄金样本）生成可执行的 **HTTP 黑盒集成测试**：`pytest + requests` 打真实 Gateway，自造数据、显式清理，不 mock 业务层。

## 何时使用

- 新增或扩充 `tests/test_*.py` API 集成测试
- 需要 seccenter 风格：中文文件头策略、`Test*` 类分组、`assert_success` 断言链
- 需要 `conftest.py` / `utils.py` / `config.py` 基建或模块级 fixtures

## 何时不要使用

- 仅需 Vitest 单元测试
- 仅需 CSV 手工用例 → [[../输出csv的测试用例/SKILL.md]]
- FastAPI 进程内 mock（terminology-agent TDD）→ 项目内 `agent-testing.md` 或全局 TDD skill
- UI Playwright E2E → 未来独立 skill

## Agent 工作循环（逐步）

| 步 | 名称 | 输入 | 输出 |
|----|------|------|------|
| 1 | RED | 用户 prompt + 5 字段契约 | `missingFacts` 或进入 GREEN |
| 2 | GREEN | intention + feature | `test_*.py` / conftest / utils 补丁 |
| 3 | REFACTOR | 产出代码 | `qualityReport` |
| 4 | 交付 | `passed=true` | `pytestOutputPlan` + 运行命令 |

每轮输出字段见 §每轮输出模板。

### RED（先判）

必读 [[references/test-type-taxonomy.md]] 确认本次为 **HTTP 集成** 而非单元/进程内 API。

核对下表（缺一则记入 `missingFacts`，勿猜测）：

| 字段 | 用途 | 示例 |
|------|------|------|
| `targetRepo` | 目标仓库路径 | `nebula/seccenter` |
| `baseUrl` | Gateway 地址 | `http://127.0.0.1:8000` |
| `moduleName` | API 域/模块 | `tenant` / `api_permission` |
| `scenarioType` | 场景类型 | `CRUD` / `isolation` / `permission` / `e2e_flow` |
| `fileStrategy` | 文件策略 | `new_numbered_file` / `append_to_existing` |

环境前置见 [[references/env-prerequisites.md]]。

**🔴 CHECKPOINT · RED 结束**：`missingFacts` 非空时 **STOP**，只输出追问清单，**禁止**生成 `test_*.py`。

### 失败模式与兜底（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| Gateway 连不上 / 登录 401 | 核对 `baseUrl`、服务是否启动、`.env` 凭证 | 记入 `missingFacts`，输出 [[references/env-prerequisites.md]] 检查清单，**STOP** |
| `assert_success` 失败但 HTTP 200 | 读 `unwrap_response` 业务 code；查 camelCase 字段名 | 附 `resp.text[:500]` 到 violation，**不**改断言为裸 status_code |
| 创建成功但无 id | 用 `safe_get_id` + 双写 key 读取 | 检查响应是否嵌套 `tenant`/`data` 包装 |
| teardown delete 失败 | `safe_cleanup` 打 Warning，不抛异常 | 提示运行 `cleanup_test_tenants.py`（若有） |
| 误路由到 terminology-agent TDD | 重读 [[references/test-type-taxonomy.md]] | **STOP**，告知用户换 skill |
| 质量自检 G1–G5 任一项失败 | 按 [[feature-skills/质量-集成测试自检/SKILL.md]] 修 violations | `passed=false` 时 **禁止** 宣称完成 |

### GREEN（意图路由 — Single Dispatch）

**禁止**主 skill 自动链式 dispatch 多个 intention；每轮只选一个。

| 信号 | 路由 |
|------|------|
| 新 API 域，尚无 `test_NN_*.py` | [[intention-skills/策略-新建模块测试文件/SKILL.md]] |
| 已有测试文件，补 `Test*` / `test_*` | [[intention-skills/策略-补场景用例/SKILL.md]] |
| Swagger / 口述接口清单 → 骨架 | [[intention-skills/策略-迁移存量接口/SKILL.md]] |

意图选定后，按 `scenarioType` 选 feature（可组合，但一次主 feature）：

| scenarioType | feature |
|--------------|---------|
| 基建缺失 | [[feature-skills/撰写-conftest与fixtures/SKILL.md]] |
| 缺断言工具 | [[feature-skills/撰写-utils断言助手/SKILL.md]] |
| CRUD | [[feature-skills/撰写-CRUD类用例/SKILL.md]] |
| 权限 / 租户隔离 | [[feature-skills/撰写-权限隔离类用例/SKILL.md]] |
| 多步流程（如密码重置） | [[feature-skills/撰写-多步E2E流程/SKILL.md]] |

### REFACTOR（强制门禁）

1. 代码产出后 → [[feature-skills/质量-集成测试自检/SKILL.md]]
2. `qualityReport.passed=true` 后 → [[evals/evaluate-only-baseline.md]]

**🔴 CHECKPOINT · 交付前**：`qualityReport.passed=false` 时 **STOP**，只输出 violations，不得标记任务完成。

## 每轮输出模板（dim5 固定格式）

```text
currentUnderstanding: ...
missingFacts: [...]          # 非空则 STOP
selectedIntentionSkill: ...
selectedFeatureSkills: [...]
pytestOutputPlan:
  files: [{ path, action, classes?, tests? }]
  envRequired: [gateway, db, redis?]
qualityReport:               # REFACTOR 后必填
  passed: true|false
  violations: [...]
nextIterationAction: ...
```

## 输入契约

| 字段 | 必填 | 说明 |
|------|------|------|
| `targetRepo` | 是 | 含 `tests/` 的仓库根或 tests 目录 |
| `apiPrefix` | 否 | 默认 `/seccenter/v2` |
| `swaggerPath` | 否 | 契约参考，如 `docs/api/seccenter.swagger.json` |
| `nextFileNumber` | 否 | 新建文件时序号，如 `18` → `test_18_*.py` |

## 反模式黑名单（dim9 · 禁止）

### 代码层

- 在集成测试里 `unittest.mock` 业务 HTTP（失去黑盒意义）
- 硬编码 tenant/user id，不通过 API 创建
- 测试数据无 `TEST_AUTO_` 前缀、无 teardown
- 只断言 HTTP 200，不 `assert_success` + 业务字段
- 字段只读 snake_case，不兼容 camelCase
- 把 terminology-agent 进程内 mock 模式写进本 skill

### Agent 行为层（红灯动作）

| 红灯 | 后果 |
|------|------|
| `missingFacts` 非空仍生成代码 | **禁止** — 必须先追问 |
| 跳过 `质量-集成测试自检` | **禁止** — 不得交付 |
| 主 skill 一轮 dispatch 多个 intention | **禁止** — Single Dispatch |
| 未读 `test-type-taxonomy` 就写 mock 测试 | **禁止** — 误用 skill |
| 编造 swagger 不存在的 path | **禁止** — 须标注 backlog |

## 与 terminology-agent TDD 边界

见 [[references/test-type-taxonomy.md]] §对比表。

## 资源速查（dim6）

| 路径 | 用途 |
|------|------|
| [[references/test-type-taxonomy.md]] | 单元 / 集成 / E2E 判定 |
| [[references/seccenter-anatomy.md]] | 文件头、类、注释规范 |
| [[references/pytest-layout-conventions.md]] | 扁平编号 vs 共置目录 |
| [[references/env-prerequisites.md]] | Gateway / DB / Redis |
| [[assets/few-shot-example/租户CRUD最小样本/SKILL.md]] | 最小 CRUD 环 |
| [[assets/few-shot-example/API权限策略文档头/SKILL.md]] | 策略型文件头 |
| [[template/新模块骨架/after/SKILL.md]] | 空 tests/ 目标态 |
| [[evals/test-prompts.json]] | Darwin 试跑 prompt |
| [[README.md]] | 自然语言触发模板 |

## 使用示例

```text
为 seccenter 补租户暂停后 session 失效的集成测试，追加到 test_03_tenant.py 的新 Test* 类里。
```

```text
新建 test_18_api_whitelist.py，参考 test_08_api_permission.py 的文件头策略写法，覆盖 CRUD + VerifySession 白名单场景。
```

```text
tests/ 目录还没有 conftest，按 seccenter 黄金样本生成最小基建（session fixture + assert_success）。
```
