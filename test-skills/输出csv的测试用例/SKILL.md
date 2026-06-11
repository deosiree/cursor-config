---
name: 输出csv的测试用例
description: >-
  将 Vitest test.ts、模块 JSON 配置或 UI 交互用例沉淀为可导入测试系统的 CSV。
  通用脚本 generate_test_csv.py + append_ui_cases_to_csv.py；v2 功能集合路径用 generate_feature_csv.py。
  支持 legacy export 迁移重组、从参考 CSV 或自然语言生成 config。
  触发词：输出csv测试用例、test.ts转CSV、测试系统导入、边开发输出用例、UI交互、追加问题单CSV、沉淀模块配置、功能集合重组、testcases_export迁移。
---

# 输出 CSV 测试用例（Agent）

## 目标

把单元测试 / 模块默认值收敛为 **测试系统可导入 CSV**，并通过 **config + cases + 通用脚本** 支持多模块复用。

## 何时使用

- 需要把 `*.test.ts` 整理为手工可执行用例并录入测试系统
- 边开发边录入 **页面/弹窗 UI 交互** 用例到 `docs/问题单/{MMDD}/`
- **功能集合 v2**：按 `alarm_.csv` 风格输出带功能集合、`用例结果` 的 CSV（`generate_feature_csv.py`）
- 从 `testcases_export.csv` 按创建人员筛选旧用例，迁移重组到新功能集合体系
- 新模块只需换 `*.config.json` / `*.cases.json`，不重写 `generate_*_csv.py`
- 从参考 CSV 或口述固定默认值，生成模块 config

## 何时不要使用

- 仅运行 Vitest 自动化（无需 CSV）
- 纯后端 API 契约用例已由 Swagger/Postman 覆盖且不需要前端步骤

## Agent 工作循环

每轮输出：

- `currentUnderstanding`
- `selectedIntentionSkill` / `selectedFeatureSkills`
- `csvOutputPlan` / `missingFacts` / `nextIterationAction`

### RED（先判）

1. 输入类型：`test.ts` 路径 / 仅要 config / 仅口述默认值 / 已有 cases 只要生成 CSV / **legacy export 迁移** / **功能集合 v2**
2. `repoRoot`（默认 nebula 根）
3. CSV 模板路径（默认 `docs/问题单/模板/menu.csv` 表头）
4. 模块名、子系统、创建人员等是否覆盖 `fieldDefaults`
5. 交付物：config / cases / CSV / README
6. **自然语言输入**：打开 `README.md` §「自然语言怎么用（必读）」，按该节补齐字段；缺项记入 `missingFacts`，勿猜测默认值

### 自然语言与新模块（必读）

完整触发词、可复制示例、字段对照见 **`README.md` §「自然语言怎么用（必读）」** 与 §「使用示例」。

RED 阶段若用户用口语描述，须先核对下表最少 5 项（缺一则追问）：

| 字段 | 用途 | 示例 |
|------|------|------|
| `moduleId` | `configs/{moduleId}.*` 文件名 | `tenant-unit` |
| `outputPath` | 最终 CSV（相对 nebula 根） | `docs/问题单/0529/tenant-unit.csv` |
| 模块名 | `fieldDefaults.模块名` | `租户管理` |
| 子系统 | `fieldDefaults.子系统` | `8` |
| 创建人员 | `fieldDefaults.创建人员` | `惠岩` |

常见补充见 README 与 `references/csv-field-convention.md`。

### 检查点门禁（G1–G5）

标准化 5 级门禁，全部子 skill 统一执行：

| 门禁 | 位置 | 触发 | 行为 |
|------|------|------|------|
| **G1 RED 追问** | RED 结束 | 缺失 moduleId/模块名/子系统/domain | 追问，不猜测，记入 missingFacts |
| **G2 Cases 预览** | cases 产出后 | cases 数组就绪 | 展示 2 条样例 + 总条数，等用户确认 |
| **G3 CSV 覆盖确认** | CSV 生成前 | 目标 CSV 已存在 | 展示「已有 N 行 + 新增 M 行」，等确认；`--force` 跳过 |
| **G4 质量自检** | cases 确认后 | cases 确认通过 | 自动运行 `用例质量自检`（`ui` 或 `ui-v2`），报告问题。v1 UI 触发 K；v2 另检功能集合必填、用例结果必填、**用例类型与 direction**（`case-type-map.md`） |
| **G5 Darwin 路由** | CSV 产出后 | 每轮强制 | → `darwin拓展发现` 扫描能力缺口 |

用户说「全部跳过确认」一次执行时，须在 `currentUnderstanding` 注明跳过原因。

### GREEN（意图路由）

| 信号 | 路由 |
|------|------|
| 有 `*.test.ts` 或 glob | `[[intention-skills/基于test.ts生成/SKILL.md]]` |
| 要新建/更新模块 config（参考 CSV 或自然语言） | `[[intention-skills/沉淀模块配置/SKILL.md]]` |
| 已有 config + cases，仅生成 CSV（API/网关自动测试场景） | 直接执行 `scripts/generate_test_csv.py` → 产出模块独立 CSV |
| 已有 cases.json，想追加到领域 CSV（v1，功能集合留空） | 直接执行 `scripts/append_ui_cases_to_csv.py` — 需指定 --domain + --date |
| 边开发边写 UI 交互用例、追加问题单 CSV（v1） | `[[intention-skills/边开发边输出UI用例/SKILL.md]]` |
| 无 test.ts、仅口述业务场景（v1 追加） | **G1 追问** → `[[intention-skills/基于源码+口述生成/SKILL.md]]` 路径 A/B |
| **testcases_export 迁移 + 功能集合 v2 重组** | `[[intention-skills/legacy-export迁移重组/SKILL.md]]` → `generate_feature_csv.py` |
| 已有 v2 cases，生成带功能集合的单文件 CSV | 直接执行 `scripts/generate_feature_csv.py` — `--cases` + `--template` + `--output` |
| 无 test.ts、口述 + 源码补充（v2 整文件） | `基于源码+口述生成` **路径 C** → `generate_feature_csv.py` |

### REFACTOR（强制）

每轮 CSV / config 产出或路由结束后 → `[[feature-skills/darwin拓展发现/SKILL.md]]`

## 脚本速查

在 skill 根目录执行：

```bash
# 1. 从 legacy 或手写 cases 已有后，生成 CSV
python scripts/generate_test_csv.py --config configs/menu-unit-gateway.config.json

# 2. 参考 CSV → config 骨架
python scripts/csv_to_test_config.py \
  --reference-csv ../../../docs/问题单/模板/menu.csv \
  --module-id tenant-unit \
  --output-config configs/tenant-unit.config.json \
  --overrides-json "{\"模块名\":\"租户管理\",\"创建人员\":\"惠岩\"}"

# 3. 一次性：从 docs/0529/generate_menu_unit_csv.py 提取 cases
python scripts/bootstrap_menu_cases.py

# 4. UI 交互用例：首次复制模板 + 追加（不覆盖已有行）
python scripts/append_ui_cases_to_csv.py \
  --domain role \
  --date 0601 \
  --cases configs/role-ui-tab.cases.json

# 5. 菜单 index 简化回归 OpenCLI 冒烟（bind 模式）
node scripts/run-menu-index-smoke.node.js --bind-only

# 6. v2：功能集合 + 用例结果（alarm_.csv 风格，整文件覆盖）
python scripts/generate_feature_csv.py \
  --cases configs/tenant.cases.json \
  --template ../../../docs/问题单/模板/tenant.csv \
  --output ../../../docs/问题单/0610/tenant.csv \
  --force
```

> v1 `append_ui_cases_to_csv.py` **强制清空功能集合**，与 v2 冲突；功能集合重组必须走脚本 6。

脚本失败、路径错误、PowerShell 转义等 → `references/config-json-schema.md` §执行异常与回退。

### OpenCLI / menu-perm E2E 阻塞规则

编排或验证流程若需跑 `gen-perms-apis/菜单管理功能项依赖链验证` 的 `node run-all.node.js`（或 `configs/menu-perm-e2e.*`）：

- 脚本 `SyntaxError` / `node --check` 失败 → **blocker**，向用户汇报；**禁止** StrReplace 修补 `nebula-skills/gen-perms-apis/**/scripts/*.js`
- 恢复方式：由用户或专人从 git 基线整文件 checkout（干净版见该 feature skill §脚本维护禁令）
- 业务 FAIL（脚本能启动）→ 按 `菜单管理功能项依赖链验证` 单场景 rerun / debug，与本套件 CSV 产出可并行

## 子 skill 地图

| 节点 | 职责 |
|------|------|
| `intention-skills/基于test.ts生成` | 扫描 test.ts → 撰写 cases.json → 路由 api/gateway feature |
| `intention-skills/沉淀模块配置` | 参考 CSV / 自然语言 → config.json |
| `intention-skills/边开发边输出UI用例` | UI 交互 cases → 追加 `docs/问题单/{MMDD}/*.csv`（v1） |
| `intention-skills/legacy-export迁移重组` | testcases_export 筛选 → 功能集合 v2 → 单文件 CSV |
| `feature-skills/撰写UI交互cases` | 开发结论 → cases.json 字段（v1 / v2） |
| `feature-skills/api-基于test.ts生成` | `src/api/**/__tests__/**` 用例撰写 |
| `feature-skills/gateway-基于test.ts生成` | `src/gateway/**/__tests__/**` 用例撰写 |
| `feature-skills/darwin拓展发现` | 能力缺口 → 新子 skill 沉淀方案 |

## 参考

- `test-prompts.json`（与 `evals/test-prompts.json` 同步）
- `[[references/csv-field-convention.md]]` · `[[references/csv-format-v2-feature-set.md]]` · `[[references/case-type-map.md]]`
- `[[references/test-case-writing-rules.md]]` · `[[references/ui-interaction-test-case-rules.md]]` · `[[references/config-json-schema.md]]` · `[[references/skill-expansion-roadmap.md]]`
- 菜单样本：`configs/menu-unit-gateway.*`、`[[assets/few-shot-example/menu-gateway-session.md]]`
- UI 样本（v1）：`[[assets/few-shot-example/role-ui-tab-validation-csv.md]]`
- 功能集合 v2 样本：`[[assets/few-shot-example/tenant-feature-set-reorg.md]]` · `configs/tenant.cases.json` · `evals/tenant-reorg-0610.md`

## 使用示例

```text
整理 apex_dev 菜单 gateway/api 的 test.ts，生成可导入测试系统的 CSV，
模块名菜单管理，创建人员惠岩。
```

```text
租户管理模块，参考 docs/问题单/模板/tenant.csv，口述：子系统 8、创建人员惠岩，
生成 tenant-unit.config.json。
```

```text
角色新增 Tab 校验失败要录入测试系统：domain role，date 0601，
4 条 UI 用例见 configs/role-ui-tab.cases.json，直接追加到问题单 CSV。
```

```text
从 testcases_export 迁移惠岩的租户管理 5 条，按功能集合重组，
对照源码补充，子系统从 tenant 模板取，输出 docs/问题单/0610/tenant.csv。
```
