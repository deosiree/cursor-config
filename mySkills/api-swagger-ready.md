---
name: api-swagger-ready
description: Extract migration-candidate APIs from Swagger/OpenAPI based on readiness tags and real code usage, then produce project-specific upgrade plans between arbitrary versions (source_version -> target_version), including API and mock impacts. Use when the user asks to map old APIs to new APIs, identify ready endpoints, or avoid upgrading unused interfaces.
---

# API Swagger Ready (Generic Version Migration)

## Scope
Use this skill for any API version migration, not only `v1 -> v2`.

Supported examples:
- `v1 -> v2`
- `legacy -> v3`
- `v2 -> v4`
- `gateway-a -> seccenter/v2` (cross-prefix migration)

## Required Inputs
1. `spec_path`: Swagger/OpenAPI file path (example: `seccenter.swagger.json`).
2. `project_paths`: one or more project roots (example: `apex_dev`, `microfb`).
3. `source_version`: source version/prefix label (example: `v1`, `gtw`, `legacy`).
4. `target_version`: target version/prefix label (example: `v2`, `seccenter/v2`).
5. `ready_rule` (optional): default is `summary` contains `[ready]`.

## Hard Rules
1. Include only endpoints that match `ready_rule`.
2. Include only endpoints with real usage evidence in code:
   - method-level call evidence (`XxxAPI.method(...)`) and/or URL-hit evidence.
3. Project isolation:
   - if endpoint A is used only in project X, add migration task only for project X.
4. Do not include APIs that merely exist in files but have no business references.
5. Separate three states explicitly:
   - `already on target_version`
   - `migratable now`
   - `not migratable now` (with reason)

## Workflow

### Step 1: Extract ready endpoints from spec
Output fields per endpoint:
- `method`
- `path`
- `operationId`
- `summary`
- `module` (derived from path segment)

### Step 2: Discover API surfaces per project
Per project:
1. Enumerate API files (`src/api/**` and equivalents).
2. Find imports and method invocations.
3. Record evidence as `file:line`.

### Step 3: Build source->target mapping
Match by URL semantics, not by name only.

Mapping record format:
- `source_endpoint`
- `target_endpoint`
- `match_confidence` (`high|medium|low`)
- `reason`

Only keep records where target endpoint is `ready`.

### Step 4: Validate mock compatibility
Check mock files for target URLs.

For each migratable item, classify:
- `mock_reusable`
- `mock_add_required`
- `mock_can_be_removed_later`

### Step 5: Generate project-specific plan
For each project output:
1. `P0` core-path migrations
2. `P1` secondary-path migrations
3. `Not in scope now` with explicit reason

## Output Contract

Use this structure:

```md
# <topic> Migration Plan (source_version -> target_version)

## Filters Applied
- ready rule: ...
- usage rule: ...

## Ready Endpoint Summary
- module A: n
- module B: n

## Project: <name>
### P0
1. <source> -> <target>
   - evidence: <file:line>
   - api files touched: ...
   - mock impact: ...

### P1
...

### Already on target_version
...

### Not in scope now
- <endpoint>: <reason>

## Execution Order
1. ...
2. ...

## Acceptance
1. functional
2. network (old URLs disappear on migrated paths)
3. mock/dev-mode
```

## Quality Gates
1. Every migration item must have at least one code evidence.
2. Every migration item must specify impacted files (API + caller + mock).
3. Every excluded item must have one explicit reason:
   - `not ready`
   - `no mapping`
   - `not referenced`
   - `already migrated`
4. Avoid speculative recommendations without evidence.

## Common Pitfalls
1. Treating proposal endpoints as ready endpoints.
2. Inferring usage from API file presence only.
3. Ignoring feature flags that decide which version is active.
4. Mixing endpoint readiness with business readiness.

## Done Definition
1. Project-separated migration plan is generated.
2. Each item includes source, target, evidence, impact, and priority.
3. Plan is directly executable by engineering teams.

## Similar Skill Patterns (Web Notes)
No direct public skill found for “Swagger ready + referenced-only migration”, but these patterns are useful:
1. Strong trigger description in frontmatter (from OpenAI skills style).
2. Strict output contract + quality gates.
3. Progressive, evidence-first workflow.

References:
- OpenAI skills repo: https://github.com/openai/skills
- Curated skill example (`openai-docs`): https://github.com/openai/skills/blob/main/.curated/openai-docs/SKILL.md

## 中文输出模板（团队文档版）

当用户偏好中文或项目文档以中文为主时，优先使用下列模板输出。

```md
# <主题> 接口迁移清单（<source_version> -> <target_version>）

## 一、筛选规则
1. Ready 规则：<写明规则，例如 summary 含 [ready]>
2. 引用规则：仅保留有调用证据的接口
3. 项目隔离：只在被引用项目中给出升级项

## 二、Ready 接口概览
- 模块 A：n 个
- 模块 B：n 个

## 三、项目升级清单

### 项目：<project_name>

#### P0（核心链路）
1. <source_endpoint> -> <target_endpoint>
   - 调用证据：`<abs_path>:<line>`
   - 涉及文件：API / 调用方 / mock
   - 改造说明：<一句话>
   - 风险点：<一句话>

#### P1（次级链路）
1. ...

#### 已在目标版本（无需改造）
1. ...

#### 暂不纳入
1. <endpoint>
   - 原因：`not ready | no mapping | not referenced | already migrated`

## 四、Mock 影响分析
1. 可复用：...
2. 需新增：...
3. 可后续下线：...

## 五、执行顺序建议
1. ...
2. ...
3. ...

## 六、验收标准
1. 功能：核心页面/流程可用
2. 网络：迁移链路不再命中旧版本 URL
3. Mock：本地 mock 模式可走通
4. 回归：鉴权/异常处理行为不退化
```

## 中文输出约束
1. 每条迁移项必须有证据路径（`绝对路径:行号`）。
2. 每条迁移项必须写明 mock 处理结论（复用/新增/下线）。
3. 结论先给“项目差异”，再给“全局建议”。
4. 禁止只给泛化建议，必须落到文件与接口级别。
