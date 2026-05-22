# 表单字段盘点与推荐模型

供 **盘点-推荐下一表单字段** 使用。目标：在**不改代码**的前提下，找出当前最值得用本 skill 完善规则的一个表单项，并给出可继续迭代的覆盖度视图。

## 1. 扫描范围

在 `resolvedRepoRoot` 下（有 `moduleHint` 时先缩小目录）：

| 信号 | 用途 |
|------|------|
| `el-form` / `ElForm` + `:rules` / `rules` | 定位表单组件 |
| `el-form-item` + `prop="..."` | 定位可校验字段 |
| `from "@/utils/formRules"` 或探测到的 `rulesModule` | 已接入工厂 |
| 内联 `rules` / `computed(() => ({` / `reactive({` 中的 `prop` 键 | 规则定义落点 |

**默认排除**（除非用户点名）：`node_modules`、`**/__tests__/**`、`**/*.test.*`、纯展示 `disabled` 无 `prop` 的项。

### moduleHint 过滤

- 在 `src/views/**` 路径或文件名、表单项 `label` 文案中匹配 hint 关键词
- 多组件仍命中 → **暂停**，列出候选 `componentPath` 请用户确认

## 2. 字段分类（coverageStatus）

| 状态 | 判定 | 说明 |
|------|------|------|
| `factoryWired` | 该 prop 使用 `createXxxRules` / 工厂导出数组，且含语义校验（非仅 `requiredRule`） | 已工程化 |
| `factoryPartial` | 已 import formRules，但该 prop 仅 `requiredRule` 或仅必填 validator | 半接入 |
| `inlineWeak` | 内联 rules：仅 `required`、或单一 `pattern`、或「以 `/` 开头」等弱校验 | **高优先级候选** |
| `inlineDuplicated` | 内联规则与已有工厂语义重复（如路径只校验前缀） | **高优先级**，倾向 `pathLike` / `nameIdentifier` |
| `missingRules` | 有 `prop`、业务必填，但 rules 中无对应项或永远通过 | 中优先级 |
| `pageWireOnlyReady` | 工厂已存在（如 `createTenantNameRules`），页面未绑定 | 低改动，高 ROI |

## 3. ruleStyle 推断（推荐用，非改码）

| 字段信号 | 建议 ruleStyle |
|----------|----------------|
| 名/称/Name、租户/角色/菜单/权限/设备类型名 | `nameIdentifier` |
| 路径、routePath、redirect、apiUrl、以 `/` 开头占位 | `pathLike` |
| 邮箱、手机、密码、验证码 | `factoryGeneric` |
| 权限码 `sys:module:action`、`perm` 占位 | `factoryGeneric`（pattern）或 `unknown` |
| 描述、备注、textarea 无格式要求 | 通常**不优先**（仅 maxlength 即可） |
| 工厂函数已存在未绑定 | `pageWireOnly` |

推断不确定时，在推荐卡中标注 `ruleStyleConfidence: low` 并写清需用户确认的点。

## 4. 推荐评分（recommendScore 0–100）

对**每个候选字段**独立打分，取最高分为「下一项」。维度与权重：

| 维度 | 权重 | 高分条件 |
|------|------|----------|
| 规则缺口 | 30 | `inlineWeak` / `inlineDuplicated` > `factoryPartial` > `pageWireOnlyReady` |
| skill 契合 | 25 | 可复用已注册 `ruleStyle`（pathLike、nameIdentifier）> `pageWireOnly` > 需 `unknown` |
| 同表单补齐 | 15 | 同组件已有其它字段走 formRules（一次阶段 B 可顺带） |
| 业务敏感 | 15 | 菜单/权限/API/账号/租户/设备标识 > 描述类 |
| 落地成本 | 15 | 仅需阶段 B < 阶段 A+B < 需新风格 + 单测 |

**降权**：纯 `required` 的描述字段、已 `factoryWired`、用户未要求且 maxlength 已够用的可选字段。

## 5. 覆盖度指标（工程落地进度）

一轮盘点至少输出：

```text
formFieldCoverage:
  totalProps:        # 扫描范围内带 prop 的表单项数
  factoryWired:      # factoryWired 数量
  needsWork:         # 非 factoryWired 数量
  coveragePercent:   # factoryWired / totalProps（整数百分比）
```

`needsWork === 0` 且抽检无 `inlineWeak` → 可判定该范围 **已达工程落地**；否则给出「下一项」继续迭代。

## 6. 推荐卡输出格式（强制）

```text
## 推荐下一项（最高 recommendScore）

- componentPath: src/views/.../Xxx.vue
- prop: apiUrl
- fieldLabel: API地址
- coverageStatus: inlineDuplicated
- suggestedRuleStyle: pathLike
- recommendScore: 92
- why: 与同模块 routePath 同属路径语义，当前仅校验前缀，可复用 createRoutePathRules
- suggestedNextStep: |
    使用父 skill，fields 仅含本 prop；阶段 A3 pathLike → 阶段 B 接入 ApiConfigDialog

## 备选（2–3 项，分数递减）

...

## 覆盖度

formFieldCoverage: { ... }

## 建议本轮 fields[]（可直接复制到父 skill）

fields:
  - prop: apiUrl
    fieldLabel: API地址
    ruleStyle: pathLike
    ui.maxlength: 64
    constraints.allowParamSuffix: true
```

## 7. 扫描命令提示（agent 执行）

在 `resolvedRepoRoot` 内优先用搜索工具，而非通读全仓：

1. `rg "el-form-item.*prop=" --glob "*.vue"` 或等价 glob
2. `rg "formRules|create\\w+Rules|requiredRule" --glob "*.vue"`
3. `rg ":rules=|rules\\s*=" --glob "*Dialog*.vue" "*Form*.vue"`
4. 打开高分候选文件，核对 `rules[prop]` 定义与 `maxlength` / placeholder

**禁止**在本 feature 中直接改 `formRules.ts` 或页面；改码必须回到父 skill Step 4。
