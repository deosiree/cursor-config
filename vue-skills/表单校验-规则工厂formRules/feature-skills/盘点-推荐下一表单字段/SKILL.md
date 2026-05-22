---
name: 盘点-推荐下一表单字段
description: 提供 repoRoot 或 repoRoot+moduleHint，扫描表单校验缺口并推荐最值得用 formRules skill 完善的一个表单项；输出覆盖度与可复制的 fields[]。只盘点不改码。
---

# 盘点-推荐下一表单字段

父级：[`../../SKILL.md`](../../SKILL.md)。用于**持续迭代**直至目标范围内表单项均达到合适规则（见 [`form-field-inventory-model.md`](../../references/form-field-inventory-model.md)）。

## 何时使用

- 用户给出 **`repoRoot`** 或 **`repoRoot` + `moduleHint`**，要求「最值得完善哪个表单元素 / 下一项改什么」
- 计划按轮次推进全仓表单校验，需要先**排队**再实施
- 父 skill 实施完成一轮后，用户说「继续下一项 / 再扫一遍」

## 何时不要使用

- 用户已明确 `componentPath` + `fields[]` → 直接走父 skill Step 4，**跳过本 feature**
- 用户要求改 locale / i18n → 非本套件职责
- 用户要求**立即改码**且已给出完整 fields → 父 skill 实施，本 feature 仅可选前置

## 输入契约

| 字段 | 必填 | 说明 |
|------|------|------|
| `repoRoot` | 是 | 仓库根目录（如 `apex_dev` 绝对或相对路径） |
| `moduleHint` | 否 | 模块关键词，如 `菜单`、`租户`、`设备`；用于缩小 `src/views` |
| `scopeGlob` | 否 | 默认 `src/views/**/*.vue`；用户可收窄 |
| `rulesModule` | 否 | 默认自动发现 `**/formRules.ts` |

不必提供 `targetRepo` 品牌名；解析得到 `resolvedRepoRoot` 即可。

## 前置

1. 按 [`project-discovery.md`](../../references/project-discovery.md) 解析仓库根、`rulesModule`、`messageStrategy`
2. 读取 [`rule-style-registry.md`](../../references/rule-style-registry.md) 与 [`form-field-inventory-model.md`](../../references/form-field-inventory-model.md)

## 执行步骤（只读）

| Step | 动作 | 产出 |
|------|------|------|
| **I1** | 确定扫描范围（全仓 views 或 moduleHint 过滤） | `scanScope` |
| **I2** | 枚举带 `prop` 的 `el-form-item`，定位所属 `componentPath`（**必须先跑下方扫描命令**） | 字段清单草稿 |
| **I3** | 对每个 prop 判定 `coverageStatus`、推断 `suggestedRuleStyle` | 分类表 |
| **I4** | 按模型计算 `recommendScore`，排序 | 排序列表 |
| **I5** | 输出推荐卡 + `formFieldCoverage` + 可复制 `fields[]` | 本轮交付 |

### I2 必跑扫描（在 `resolvedRepoRoot` 下执行）

按 `scanScope`（默认 `src/views`，有 `moduleHint` 时先收窄路径）依次搜索，**不得**凭记忆猜字段：

```bash
# 1) 表单组件候选（Dialog/Form 优先）
rg "el-form|ElForm" --glob "*.vue" <scanScope>

# 2) 带 prop 的表单项
rg "el-form-item[^>]*prop=" --glob "*.vue" <scanScope>

# 3) 已接入 rules 模块的页面
rg "formRules|create\\w+Rules|requiredRule" --glob "*.vue" <scanScope>

# 4) 内联 rules 定义落点
rg ":rules=|rules\\s*[:=]" --glob "*.vue" <scanScope>
```

| 结果量 | 动作 |
|--------|------|
| Form 组件 >5 且 moduleHint 模糊 | **暂停**，列出路径请用户收窄 |
| 单文件 prop >15 | 先记「高 prop 文件」，I3 优先打开已 import formRules 的文件 |
| 0 条 prop | 扩大 `scopeGlob` 或报告 scope 内已 `factoryWired` |

### I3 细则

- 打开候选组件 script，查看 `rules` / `formRules` 中**该 prop** 的定义
- 若组件已 import `createMenuNameRules` 等，但**另一 prop** 仍内联弱规则 → 同表单补齐加分（见模型 §4）
- 对照 `rulesModule` 已导出工厂，识别 `pageWireOnlyReady`

### I4 .tie-break

分数相同或差值 ≤3 时，优先：

1. 与已接入 formRules 的**同一 `componentPath`**
2. 已注册 `ruleStyle` 可复用（`pathLike` / `nameIdentifier`）
3. `inlineDuplicated`（重复实现弱路径校验）

仍无法区分 → 列出 2 项并请用户二选一（**暂停改码**）。

## 输出契约（强制）

每轮必须包含：

- `currentUnderstanding`：扫描范围与 rules 模块路径
- `topRecommendation`：一项，`componentPath` + `prop` + `recommendScore` + `why`（3–5 句）
- `alternatives`：2–3 项
- `formFieldCoverage`：五项指标（见模型 §5）
- `suggestedFieldsYaml`：可直接粘贴到父 skill 的 `fields:` 块
- `landingStatus`：`in_progress` | `module_done`（仅当 scope 内 `needsWork===0`）| `repo_done`
- `missingFacts`：推断不确定时列出

**禁止**在本 feature 交付中修改任何源码文件；若用户接着说「按推荐实施」，交回父 skill。

## 与父 skill 衔接

```text
用户: 扫 apex_dev，推荐下一项
  → 本 feature I1–I5
  → 用户确认
  → 父 skill: componentPath + suggestedFieldsYaml → Step 4 阶段 A/B

用户: 做完 apiUrl 了，再扫菜单模块
  → 本 feature（moduleHint: 菜单）→ 下一项 perm / ...
```

全仓 `coveragePercent === 100` 且抽检无 `inlineWeak` → 告知用户已达工程落地，后续仅维护性改动。

## 检查点

| 时机 | 动作 |
|------|------|
| 多仓库根 | 请用户确认 `repoRoot` |
| moduleHint 命中 >5 个 Form | 列出路径请用户收窄 hint |
| 0 个候选 | 扩大 scope 或报告「当前范围已 factoryWired」 |
| 用户同时要盘点+改码 | 先完成本 feature 输出，再问是否进入父 skill 实施 |
| 已给 `componentPath` + `fields[]` | **不进入 I1**；提示走父 skill Step 4（见 [`test-prompts.json`](test-prompts.json) #2） |

## 验收

- [ ] 未产生业务代码 diff（仅 skill 文档维护轮次除外）
- [ ] 推荐项含 `componentPath`、`prop`、`suggestedRuleStyle`、`recommendScore`
- [ ] 含 `formFieldCoverage` 与 `suggestedFieldsYaml`
- [ ] 评分依据可追溯到 `coverageStatus`（非主观臆测）

## 参考

- 评分与输出格式：[`form-field-inventory-model.md`](../../references/form-field-inventory-model.md)
- 样本输出：[`inventory-recommendation-sample.md`](../../assets/few-shot-example/inventory-recommendation-sample.md)
- Darwin 实测：[`test-prompts.json`](test-prompts.json)

## 使用示例

```text
使用 $表单校验-规则工厂formRules
盘点下一项：
repoRoot: F:/Documents/Repertory/Sieyuan/nebula/apex_dev
moduleHint: 菜单
只推荐，先不改代码。
```

```text
repoRoot: ./apex_dev
（无 moduleHint，全仓 views 扫描）
反馈最值得增加 formRules 的一个表单元素，并给覆盖度。
```
