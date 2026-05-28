# 表单校验-规则工厂 formRules

跨项目可复用的 **Vue + Element Plus 表单校验** agent 套件：在集中式 `formRules`（或等价模块）中扩展规则工厂，并在目标表单组件上接入。

## 解决什么问题

- 校验逻辑散落在各页面，重复 `required` / `pattern` / 自定义 validator
- 名称、路径等字段需要统一语义（trim、提交规范化、分段 path）
- 新字段不知道应扩展现有工厂还是新建一种「规则风格」

## 职责边界

| 包含 | 不包含 |
|------|--------|
| `formRules.ts` 工厂与 validator | `zh_CN.json` / `en_US.json` 维护 |
| 页面 `:rules` / `@blur` / submit 规范化 | 批量 `$t` / i18n-server 迁移 |
| 单测矩阵 | 非表单业务逻辑 |

## Agent 结构

```text
SKILL.md（父级：定位 + 风格路由 + 验收）
├── feature-skills/盘点-推荐下一表单字段      ← 只读扫描，推进全仓覆盖
├── feature-skills/新增-规则工厂与通用校验
├── feature-skills/配置-多语言标识符命名规则
├── feature-skills/配置-路径类规则
├── feature-skills/配置-密码对规则          ← pwdPair + getPwdPolicy + 动态 rules
├── feature-skills/接入-页面表单字段规则
├── feature-skills/编排-未知规则MVP与落地
└── feature-skills/维护-从业务仓同步样本  ← apex 真源 → skill 模板 + sync-samples
```

**持续落地闭环**：`repoRoot`（+ 可选 `moduleHint`）→ 盘点推荐下一项 → 父 skill 实施 → 再盘点，直至 `formFieldCoverage.needsWork === 0`。

## 使用方式（复制即用）

在对话开头带上 **`$表单校验-规则工厂formRules`**（或说明「用 formRules 表单校验 skill」），再粘贴下面对应子场景的整段话。父 skill 会按意图路由到 feature-skill；**不必**手写子 skill 目录名。

### 子 skill 与自然语言对照

| 子 skill | 你怎么说（关键词） | 典型场景 |
|----------|-------------------|----------|
| **维护-从业务仓同步样本** | 同步 skill 样本、formRules 样本对齐、apex 改了 formRules、业务仓 drift | apex 落地后对齐 skill 模板，不改业务仓 |
| **盘点-推荐下一表单字段** | 盘点、下一项、覆盖度、最值得完善哪个字段、先不要改代码 | 只读扫描，输出 `fields[]` 建议 |
| **配置-路径类规则** | 路由 path、apiUrl、pathLike、拼参 `/user?`、分段 path | 扩展 `createRoutePathRules` / `createApiPathRules` |
| **配置-多语言标识符命名规则** | 标识符、菜单名/租户名、nameIdentifier、normName、trim | `createXxxNameRules` + 失焦 trim |
| **配置-密码对规则** | pwdPair、密码+确认、密码策略、**给密码对配 tips**、PwdPolicyTip、getPwdPolicy、改密全红 | `pwdPair` + `pwdPlcyTip` + 动态 policy |
| **新增-规则工厂与通用校验** | 邮箱/手机/验证码、required、pattern、factoryGeneric | 通用工厂，非 path/name/pwd |
| **接入-页面表单字段规则** | 只接入、已有工厂、pageWireOnly、绑 rules/blur | 工厂已有，只改页面 |
| **编排-未知规则MVP与落地** | 新字段语义、端口号、还没有 formRules、未命中风格 | 调研 → Plan → mvp，无 formRules 时禁止跳过 Plan |

**不要触发本套件**：补 `zh_CN.json` / 批量翻译、OperationColumn、纯后端 API 无表单。

---

### 维护-从业务仓同步样本（固定编排，推荐整段复制）

真源：**仅 apex_dev** 覆盖 skill 成品；microfb 只做差异报告，不写入 skill。默认先 **dry-run**，确认后再 **apply**。

**① 仅检查是否 drift（不改文件）**

```text
使用 $表单校验-规则工厂formRules
维护-从业务仓同步样本，mode: dryRun
apexDevRoot: F:/Documents/Repertory/Sieyuan/nebula/apex_dev
microfbRoot: F:/Documents/Repertory/Sieyuan/nebula/microfb
请执行 sync-from-repos --dry-run，汇报 apex 与 skill 样本是否一致，以及 microfb 与 apex 的命名差异摘要。不要改业务仓源码，不要改 locale。
```

**② 确认 drift 后写入 skill（需你先回复「可以 apply」）**

```text
使用 $表单校验-规则工厂formRules
维护-从业务仓同步样本，mode: apply
apexDevRoot: F:/Documents/Repertory/Sieyuan/nebula/apex_dev
microfbRoot: F:/Documents/Repertory/Sieyuan/nebula/microfb
已确认 apply：请把 apex_dev/src/utils/formRules.ts 同步到 skill template，跑 sync-samples，贴 verify 结果与变更文件列表。不要改 apex_dev/microfb 业务源码，不要改 locale。
```

**③ 一句话版（路径已在 `references/sample-source.config.json` 时）**

```text
使用 $表单校验-规则工厂formRules
apex 刚改了 formRules.ts，请把 formRules skill 样本对齐，先 dry-run，有 drift 再问我是否 apply。
```

本地等价命令见 [`scripts/README.md`](scripts/README.md)（`sync-from-repos.js` / `npm run formrules:sync-from-repos`）。

---

### 其他常见场景（复制即用）

**盘点下一项（只读）**

```text
使用 $表单校验-规则工厂formRules
repoRoot: F:/Documents/Repertory/Sieyuan/nebula/apex_dev
moduleHint: 菜单
先盘点：推荐最值得用 formRules 完善的一个表单项，输出覆盖度和可复制 fields[]，不要改代码。
```

**菜单名 + 路由 path（实施）**

```text
使用 $表单校验-规则工厂formRules
componentPath: src/views/system/menu/components/MenuFormDialog.vue
fields:
  - prop: name, ruleStyle: nameIdentifier, fieldLabel: 菜单名, ui.maxlength: 8, validateMax: 128, hooks: blurTrim+submitNormalize
  - prop: routePath, ruleStyle: pathLike, ui.maxlength: 64, allowParamSuffix: true, extra: uniqueCheck
```

**改密 pwdPair**

```text
使用 $表单校验-规则工厂formRules
componentPath: src/views/system/user/components/UserResetPasswordDialog.vue
fields:
  - prop: password, ruleStyle: pwdPair, fieldLabel: 新密码
  - prop: confirmPassword, ruleStyle: pwdPair, fieldLabel: 确认密码
改密弹窗打开不要全红：validate-on-rule-change=false，策略用 getPwdPolicy。
```

**密码对 + 策略 tips（apex 用户表单）**

```text
使用 $表单校验-规则工厂formRules
componentPath: src/views/system/user/components/UserFormFields.vue
给新建用户的密码对配 tips：label 旁 PwdPolicyTip，policy 与 pwdPair 同源，onMounted 拉 ConfigGateway.getPwdPolicy。不要改 locale。
```

**密码对 + 策略 tips（microfb 忘记密码）**

```text
使用 $表单校验-规则工厂formRules
componentPath: src/views/login/components/LoginForgotPassword.vue
忘记密码重置步要在标题下展示密码策略副标题：ForgotStepPanel 传 password-policy，与 pwdConfirmPair 共用 policy；验证步预拉、进重置步 await getPasswordPolicy。参考 da51cb3c。
```

**工厂已有，只接页面**

```text
使用 $表单校验-规则工厂formRules
repoRoot: F:/Documents/Repertory/Sieyuan/nebula/apex_dev
moduleHint: 租户表单 tenantName
createTenantNameRules 已有，只要 pageWireOnly：接上 blur trim 和提交 normName，不要重复造工厂。
```

更多触发句见 [`evals/should-trigger-prompts.md`](evals/should-trigger-prompts.md)；父级完整契约见 [`SKILL.md`](SKILL.md)。

## 输入方式（无需填写仓库名）

- **推荐**：`componentPath: src/views/.../XxxForm.vue`
- **或**：`repoRoot` + `moduleHint`（由 agent 搜索组件，多命中时确认）

## 样本说明

`template/sample-nebula/after/formRules.ts` 为**唯一编辑入口**；改完后执行 **`node scripts/sync-samples.js`**。业务仓落地后用 **`node scripts/sync-from-repos.js`**（真源 apex）。`.cursor` 仓库提交样本时 **pre-commit 自动 sync**。详见 [`scripts/README.md`](scripts/README.md)。

## 推荐顺序

不确定改哪一项时：先 **盘点-推荐下一表单字段** → 再读父级 `SKILL.md`（Step 1–5）→ **多字段**：按 `ruleStyle` 去重，阶段 A 扩展 rules 模块 → 阶段 B 页面接入 → 对照 few-shot / template → `vitest` + `eslint`。
