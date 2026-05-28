---
name: 表单校验-规则工厂formRules
description: formRules、表单校验、routePath、apiUrl、pathLike、pwdPair、密码策略、同步 skill 样本、formRules 样本对齐、trimFieldOnBlur、createApiPathRules、标识符命名、ruleStyle、盘点下一项。Vue+Element Plus 集中式 rules 模块扩展与页面接入；componentPath 或 repoRoot+moduleHint；可先盘点；不含 i18n locale。
---

# 表单校验-规则工厂 formRules

在集中式 **rules 模块**（如 `formRules.ts`）扩展校验工厂，并在目标表单组件接入。跨项目通用；样本代码见 `template/sample-nebula/` 与 `assets/few-shot-example/`。

**TL;DR**：只盘点 → 盘点 feature；**apex 改了 formRules 要更新 skill** → [维护-从业务仓同步样本](feature-skills/维护-从业务仓同步样本/SKILL.md)；有 `fields[]` → Step1–5 + 阶段 A/B；**无 `rulesModule`** → 仅 unknown→Plan；改 skill 样本 → **只改** [`formRules.ts`](template/sample-nebula/after/formRules.ts) → [`sync-samples.js`](scripts/sync-samples.js)（`.cursor` 提交时 pre-commit 自动跑，见 [`scripts/README.md`](scripts/README.md)）。

## 何时使用

- 为表单字段新增或统一校验（名称、路径、邮箱、密码等）
- 需要 `normName` / `trimFieldOnBlur` / 分段 path 等可复用语义
- 不确定应用哪种 `ruleStyle`，需要 agent 路由
- 用户提到 **formRules**、**表单校验**、**路由路径校验**、**标识符命名**、**pwdPair**、**密码策略**、**密码对**
- 只给 **repoRoot**（或 **repoRoot + moduleHint**），要「最值得完善的表单元素 / 下一项 / 覆盖度」→ 先走盘点子 skill
- **apex_dev / microfb 的 `formRules.ts` 已落地，要对齐 skill 样本** → 走 [维护-从业务仓同步样本](feature-skills/维护-从业务仓同步样本/SKILL.md)

## 何时不要使用

- 补 `zh_CN.json` / 翻译 / 批量 `$t`（**非本 skill 职责**）
- 纯表格布局、OperationColumn、非表单逻辑
- 仅后端 API 契约设计且无前端表单

## 输入契约

### 定位（不必填仓库名）

| 方式 | 输入 |
|------|------|
| A（推荐） | `componentPath: src/views/.../XxxForm.vue` |
| B | `repoRoot` + `moduleHint: 菜单表单` → agent 搜索组件，多命中时确认 |

解析得到 `resolvedRepoRoot`，见 [`references/project-discovery.md`](references/project-discovery.md)。

### 字段

```text
fields:
  - prop: name
    fieldLabel: 菜单名
    ruleStyle: nameIdentifier
    ui.maxlength: 8
    validateMax: 128
    hooks: [blurTrim, submitNormalize]
  - prop: routePath
    fieldLabel: 路由路径
    ruleStyle: pathLike
    ui.maxlength: 64
    constraints.allowParamSuffix: true
    extra: [uniqueCheck]
```

| 字段 | 说明 |
|------|------|
| `prop` | `el-form-item` 的 prop |
| `fieldLabel` | 工厂 `label` 参数，**不**触发 i18n 任务 |
| `ruleStyle` | 见 [`rule-style-registry.md`](references/rule-style-registry.md) |
| `rulesModule` | 可选，默认自动发现 `**/formRules.ts` |

### 消息约定

- 新增/修改 messageKey 前必读 [`references/message-key-constraints.md`](references/message-key-constraints.md)（≤12 字、可读、语义复用）
- 校验器使用稳定 **messageKey** 或项目既有 `t(key)`；**禁止**把 locale 文件列入默认改动集

## 实施步骤（父级，必先按序）

### 分支：仅盘点推荐（不改码）

用户只要「扫仓库 / 扫模块 → 推荐下一表单项 / 覆盖度」，且**未**给出完整 `fields[]` 实施指令时：

1. 委派 [`feature-skills/盘点-推荐下一表单字段`](feature-skills/盘点-推荐下一表单字段/SKILL.md)
2. 交付推荐卡 + `formFieldCoverage` + 可复制 `fields[]`
3. 用户确认后再从下方 **Step 1** 进入实施；`landingStatus: repo_done` 前可反复盘点

### 分支：业务仓 → skill 样本同步（不改业务源码）

用户给出 **apex_dev**（必填）与可选 **microfb** 根路径，要求 skill `template/.../formRules.ts` 与 fragment 对齐落地态时：

1. 委派 [`feature-skills/维护-从业务仓同步样本`](feature-skills/维护-从业务仓同步样本/SKILL.md)
2. 默认 `dryRun` → 用户确认后再 `apply`
3. **不**进入 Step 1–5 页面接入

### 分支：已知字段直接实施

| Step | 动作 | 产出 |
|------|------|------|
| **1** | 解析 `componentPath` 或 `repoRoot`+`moduleHint` | `resolvedRepoRoot`、`componentPath` |
| **2** | 项目发现：rules 模块、Element Plus、`messageStrategy`；扩展 rules 前读 [`formRules-module-map.md`](references/formRules-module-map.md)；改 messageKey 前读 [`message-key-constraints.md`](references/message-key-constraints.md) | 见 [`project-discovery.md`](references/project-discovery.md) |
| **3** | 读取目标组件现有 `rules` / `@blur` / submit；核对每个 field 的 `ruleStyle` 与 maxlength 分离 | 字段清单 |
| **4** | **多字段编排**（下节）→ 按风格委派子 skill | rules 模块 + 页面改动计划 |
| **5** | 子 skill 完成后验收（单测、eslint、无 locale diff） | 可提交改动 |

**改 skill 样本时**（非业务 `apex_dev`）：动过 [`template/sample-nebula/after/formRules.ts`](template/sample-nebula/after/formRules.ts) 的 pathLike/name 后，在 skill 根目录执行 `node scripts/sync-samples.js`（维护说明 [`scripts/README.md`](scripts/README.md)）。

Step 3 中 `maxlength`（UI）与 `validateMax`（校验）不一致时，**先向用户确认**再进入 Step 4。

**绿场门禁**：若 Step 2 未找到 `rulesModule`（仓库内无 `formRules.ts`）→ Step 4 **仅**委派 `编排-未知规则MVP与落地`；**禁止**因「像 pattern/必填」直接走 `factoryGeneric` 跳过 Plan。

## 多字段编排（Step 4 核心）

对 `fields[]` **按 `ruleStyle` 去重**后，分 **两阶段** 执行，禁止「只改页面、不补工厂」或「工厂改完却漏接入」。

### 阶段 A：扩展 rules 模块（每种 style 至多委派一次）

按下列顺序，仅处理输入里**出现过**的 style：

| 顺序 | ruleStyle | 委派 |
|------|-----------|------|
| A1 | `factoryGeneric` | 新增-规则工厂与通用校验 |
| A2 | `nameIdentifier` | 配置-多语言标识符命名规则 |
| A3 | `pathLike` | 配置-路径类规则 |
| A4 | `pwdPair` | 配置-密码对规则 |
| A5 | `unknown` | 编排-未知规则MVP与落地（先 Plan） |

- 同一 style 多个 prop（如两个 `nameIdentifier` 字段）→ **只跑一次**对应子 skill，在工厂内用不同 `createXxxRules({ label, maxLength })` 区分。
- `unknown` 若评估为可复用的新风格 → 登记 [`rule-style-registry.md`](references/rule-style-registry.md)（见扩展文档）。

### 阶段 B：页面接入（`componentPath` 一次做完）

| 条件 | 动作 |
|------|------|
| 任一 field 需绑 rules / blur / submit | 委派 **接入-页面表单字段规则**，一次性处理阶段 A 涉及的全部 prop |
| 全部 field 均为 `pageWireOnly` 且工厂已存在 | **仅**阶段 B，跳过阶段 A |

阶段 B 包含：`import`、`formRules` 绑定、`@blur`、`submit` 规范化；业务 `extra`（如路径唯一性）在页面组合 validator，不写入 pathLike 工厂。

```text
示例：name=nameIdentifier + routePath=pathLike
  → A2 配置菜单名工厂 → A3 配置路径工厂 → B 接入 MenuFormDialog（name + routePath）
```

## 路由表（单字段 / 判定子 skill 时用）

| 判定 | 委派 |
|------|------|
| `factoryGeneric` / 邮箱手机密码验证码 | [`feature-skills/新增-规则工厂与通用校验`](feature-skills/新增-规则工厂与通用校验/SKILL.md) |
| `nameIdentifier` / 标识符命名 | [`feature-skills/配置-多语言标识符命名规则`](feature-skills/配置-多语言标识符命名规则/SKILL.md) |
| `pathLike` / 路由 path / 分段 path | [`feature-skills/配置-路径类规则`](feature-skills/配置-路径类规则/SKILL.md) |
| `pwdPair` / 密码+确认 / 密码策略 | [`feature-skills/配置-密码对规则`](feature-skills/配置-密码对规则/SKILL.md) |
| `pageWireOnly` / 仅绑定已有规则 | [`feature-skills/接入-页面表单字段规则`](feature-skills/接入-页面表单字段规则/SKILL.md) |
| 未命中 / 新语义 | [`feature-skills/编排-未知规则MVP与落地`](feature-skills/编排-未知规则MVP与落地/SKILL.md) |
| 仅 `repoRoot` / 要下一项推荐 / 覆盖度 | [`feature-skills/盘点-推荐下一表单字段`](feature-skills/盘点-推荐下一表单字段/SKILL.md) |
| apex/microfb `formRules` drift / 同步 skill 样本 | [`feature-skills/维护-从业务仓同步样本`](feature-skills/维护-从业务仓同步样本/SKILL.md) |

判定口诀：**先定 ruleStyle，再进子 skill；语义已有只接入，语义没有先配置/新增工厂。全仓推进时先盘点再实施。**

## 检查点（改码前暂停）

| 时机 | 条件 | 动作 |
|------|------|------|
| 定位歧义 | 搜索到多个 Form 组件 | 请用户确认 `componentPath` |
| 风格歧义 | 字段像 path 又像普通字符串 | 确认是否 `pathLike` |
| 拼参 | path 字段 | 确认是否允许 `/user?`、`/user#` |
| i18n | 用户未要求 | **不**改 locale |

## GREEN / REFACTOR（父级职责）

父级 **不**展开逐步改码；子 skill 完成后验收：

1. `rulesModule` 导出与单测通过
2. 目标 `componentPath` 已绑 `rules` / blur / submit
3. `eslint` 无报错
4. 默认 diff **无** `locales/*.json`
5. 新语义若可复用 → [`references/扩展-新规则风格.md`](references/扩展-新规则风格.md)
6. 若改了 skill 内 `formRules.ts` 样本 → `node scripts/sync-samples.js` 通过

## 使用示例

```text
使用 $表单校验-规则工厂formRules
componentPath: src/views/system/menu/components/MenuFormDialog.vue
fields:
  - prop: name, ruleStyle: nameIdentifier, fieldLabel: 菜单名, ui.maxlength: 8, validateMax: 128, hooks: blurTrim+submitNormalize
  - prop: routePath, ruleStyle: pathLike, ui.maxlength: 64, allowParamSuffix: true, extra: uniqueCheck
```

```text
repoRoot: ./my-app
moduleHint: 租户编辑表单 tenantName
fields:
  - prop: tenantName, ruleStyle: nameIdentifier, validateMax: 128
```

```text
componentPath: src/views/system/user/components/UserResetPasswordDialog.vue
fields:
  - prop: password, ruleStyle: pwdPair, fieldLabel: 新密码
  - prop: confirmPassword, ruleStyle: pwdPair, fieldLabel: 确认密码
→ 阶段 A4 配置-密码对规则 → 阶段 B 接入（validate-on-rule-change=false）
```

```text
盘点下一项（只读）：
repoRoot: ./my-app
moduleHint: 菜单
→ 输出推荐 prop + 覆盖度 + 建议 fields[]；确认后再实施
```

## 参考索引

| 文档 | 用途 |
|------|------|
| [`rule-style-registry.md`](references/rule-style-registry.md) | 风格登记 |
| [`name-identifier-model.md`](references/name-identifier-model.md) | 命名规则 |
| [`route-path-segment-model.md`](references/route-path-segment-model.md) | 路径规则 |
| [`password-pair-model.md`](references/password-pair-model.md) | 密码对 + 策略网关 + tips UI |
| [`assets/few-shot-example/pwd-pair-tips-sample.md`](assets/few-shot-example/pwd-pair-tips-sample.md) | 密码对 tips（apex tooltip / microfb 副标题） |
| [`known-issues.md`](references/known-issues.md) | 易错点 |
| [`form-field-inventory-model.md`](references/form-field-inventory-model.md) | 盘点评分与覆盖度 |
| [`formRules-module-map.md`](references/formRules-module-map.md) | 模块分区与原子编排 |
| [`message-key-constraints.md`](references/message-key-constraints.md) | 校验文案约束 |
| [`assets/skill-output-checklist.md`](assets/skill-output-checklist.md) | 交付勾选 |
| [`scripts/README.md`](scripts/README.md) | 样本维护：sync-samples / sync-from-repos / pre-commit |
| [`sample-source.config.example.json`](references/sample-source.config.example.json) | 业务仓路径配置模板 |

### Template 速查（skill 内自包含 — 合并到 rulesModule）

| 场景 | 打开 |
|------|------|
| **通读 / 绿场新建** | [`formRules.ts`](template/sample-nebula/after/formRules.ts)（完整成品） |
| pathLike 增量 | [`formRules.routePath.fragment.ts`](template/sample-nebula/after/formRules.routePath.fragment.ts) |
| nameIdentifier 增量 | [`formRules.name.fragment.ts`](template/sample-nebula/after/formRules.name.fragment.ts) |
| 单测矩阵 | [`formRules.routePath.test.fragment.ts`](template/sample-nebula/after/formRules.routePath.test.fragment.ts) |
| 阶段 B 接入 | [`MenuFormDialog.wire.fragment.vue`](template/sample-nebula/after/MenuFormDialog.wire.fragment.vue) |
| pwdPair 增量 | [`formRules.pwdPair.fragment.ts`](template/sample-nebula/after/formRules.pwdPair.fragment.ts) |
| pwdPair 单测 | [`formRules.pwdConfirm.test.fragment.ts`](template/sample-nebula/after/formRules.pwdConfirm.test.fragment.ts) |
| pwdPair 接入 | [`PwdPairForm.wire.fragment.vue`](template/sample-nebula/after/PwdPairForm.wire.fragment.vue) |
