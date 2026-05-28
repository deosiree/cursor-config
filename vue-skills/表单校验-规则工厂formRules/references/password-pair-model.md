# pwdPair 密码对风格模型

## 语义

「新密码 + 确认密码」成对校验：**租户密码策略**（最短长度 + 复杂度）+ **password→confirm 联动** + 统一文案。页面**禁止**三行拼装 `createPasswordRules` + `createConfirmPasswordRules`。

历史样本（当前对齐）：

- **microfb** `da51cb3c`：`pwdConfirmPair` + `pwdPlcyTip` + `SecurityConfigGateway.getPasswordPolicy`
- **apex_dev** `f8365ff7`：`pwdPair` + `pwdPlcyTip` + `ConfigGateway.getPwdPolicy`

更早：`microfb a6fa3ac` / `apex_dev 80da1ae` — 同模式，命名以 `da51cb3` / `f8365ff` 为准。

## 命名对照（nebula 双仓）

| 能力 | microfb | apex_dev |
|------|---------|----------|
| 规则对出口 | `pwdConfirmPair` | `pwdPair` |
| 上下文 | `PwdConfirmCtx` | `PwdCtx` |
| 策略类型 | `PwdConfirmPolicy` | `PwdPolicy` |
| 可选参数 | `PwdConfirmPairOptions` | `PwdPairOpt` |
| 最短长度规则 | `createPasswordRules(minLen)` | `pwdMinRules(minLen)` |
| 确认规则 | `createConfirmPasswordRules` | `cfmPwdRules` |
| 联动私有函数 | `appendPasswordConfirmSync` | `appendPwdSync` |
| 策略网关 | `SecurityConfigGateway.getPasswordPolicy` | `ConfigGateway.getPwdPolicy` |
| **tips 文案** | `pwdPlcyTip`（`PwdConfirmPolicy`） | `pwdPlcyTip`（`PwdPolicy`） |

**默认策略**：`options?.policy ?? { minLength: 6 }` 内联于 `pwdPair`/`pwdConfirmPair`；**不 export** `DEFAULT_PWD_POLICY` / `DEF_PWD_PLCY`。

**最短长度文案**（两仓统一）：`` t(`密码不能少于 ${minLen} 位`) ``。

## formRules.ts 分区

```text
§1 常量与类型 → PwdCtx / PwdPolicy / PwdPairOpt；export pwdPlcyTip（与 policy 同源文案）
§4 预定义规则集 · 密码对 → 仅 export pwdPair（或 pwdConfirmPair）；appendPwdSync 私有
```

## UI：策略 tips 放置（双仓）

| 仓库 | 组件路径 | 展示形态 | `policy` 传入 |
|------|----------|----------|---------------|
| apex_dev | `components/form/PwdPolicyTip.vue` | label 旁 `el-tooltip` + Warning 图标 | `<PwdPolicyTip :policy="pwdPlcy" />` 在 `#label` 插槽 |
| microfb | `components/auth/PwdPolicyTip.vue` | 标题下副标题 `variant="subtitle"` | `ForgotStepPanel` prop `password-policy` → 内嵌 `PwdPolicyTip` |

**同一 ref** 同时用于 `pwdPair(..., { policy })` 与 `PwdPolicyTip`；`policy` 未加载时不展示 tips（组件内 `pwdPlcyTip` 仅在 `policy` 存在时计算）。

microfb 忘记密码：验证步 `onMounted` 预拉 + 进重置步 `await getPwdPolicy()`（见 `LoginForgotPassword.vue` @ `da51cb3c`）。

few-shot：[`assets/few-shot-example/pwd-pair-tips-sample.md`](../assets/few-shot-example/pwd-pair-tips-sample.md)

薄包装**删除/禁止**：`createPasswordRulesFromPolicy`、`createConfirmPasswordRulesFromPolicy`、`createPasswordWithMin6Rules`；页面只用 `pwdPair` spread。

## 策略网关

| 仓库 | 方法 | 行为 |
|------|------|------|
| microfb | `SecurityConfigGateway.getPasswordPolicy` | 内联 wire→policy；失败 toast + throw（未鉴权页） |
| apex_dev | `ConfigGateway.getPwdPolicy` | 内联 wire→policy；`handleGatewayError`，失败 toast + throw |

映射字段（两仓一致，不经 `mapWire2Stable*`）：

```ts
minLength: Math.max(6, Number(config.passwordMinLength || 6)),
requireUppercase: Boolean(config.passwordRequireUppercase),
// ... lowercase / digit / special
```

## 页面接入模式

### 1. 仅密码对（重置密码 / 激活）

```ts
const pwdPlcy = ref<Awaited<ReturnType<typeof ConfigGateway.getPwdPolicy>>>();

const pwdCtx: PwdCtx = {
  getPassword: () => model.password ?? "",
  getConfirmPassword: () => model.confirmPassword ?? "",
  getFormRef: () => formRef.value,
};

const rules = computed(() => ({ ...pwdPair(pwdCtx, { policy: pwdPlcy.value }) }));
```

打开弹窗或 `onMounted` 拉策略；**不** import 默认 policy 常量；**不**给 `pwdPlcy` 初值。

### 2. 密码对 + 其它字段（用户新建 / UserFormFields）

```ts
const rules = computed(() => {
  if (!showPasswordFields || readonlyMode || model?.id) return props.rules;
  return { ...props.rules, ...pwdPair(pwdCtx, { policy: pwdPlcy.value }) };
});
```

父级 `rules` **去掉** `password` / `confirmPassword`（由子组件 spread 覆盖）。

### 3. 改密三字段（profile：原密码 + 新/确认）

prop 为 `newPassword` / `confirmPassword` 时，映射 `pwdPair` 返回的 `password` key：

```ts
const passwordChangeRules = computed(() => {
  const { password, confirmPassword } = pwdPair(pwdCtx, { policy: pwdPlcy.value });
  return {
    oldPassword: [{ required: true, message: "请输入原密码", trigger: ["blur", "change"] }],
    newPassword: password,
    confirmPassword,
  };
});
```

**原密码**仅必填，不套新口令 `minLength`/复杂度。

## 动态 rules 与 Element Plus

`rules` 为 `computed` 且异步注入 `policy` 时，`rules` 引用会变 → 默认 `validate-on-rule-change: true` 会对**空表**全量校验 → 弹窗一打开全红。

**必做**（与 `UserFormFields` 一致）：

```vue
<el-form :validate-on-rule-change="false" ... />
```

打开改密弹窗时：`nextTick(() => formRef?.clearValidate())`；关闭时 `pwdPlcy = undefined`。

提交仍 `await formRef.validate()`；blur/change 仍按 rule `trigger` 工作。

## 单测

`formRules.pwdConfirm.test.ts` 矩阵：

- `pwdPair` 两 key
- `policy.minLength: 7` → 「密码不能少于 7 位」
- password 变更 + confirm 有值 → `nextTick` 后 `validateField('confirmPassword')`
- `cfmPwdRules(..., 8)` 长度不足先于不一致

## 相关文档

- 接入清单：[`feature-skills/配置-密码对规则/SKILL.md`](../feature-skills/配置-密码对规则/SKILL.md)
- few-shot：[`pwd-pair-sample.md`](../assets/few-shot-example/pwd-pair-sample.md)、[`pwd-pair-tips-sample.md`](../assets/few-shot-example/pwd-pair-tips-sample.md)
- 模块地图：[`formRules-module-map.md`](formRules-module-map.md)
