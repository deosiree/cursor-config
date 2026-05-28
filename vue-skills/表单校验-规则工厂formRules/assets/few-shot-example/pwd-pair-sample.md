# pwdPair 密码对 — nebula 真实样本

> **策略 tips（双仓 UI）** 见 [`pwd-pair-tips-sample.md`](pwd-pair-tips-sample.md)。

来源：`microfb@da51cb3c`、`apex_dev@f8365ff7`（规则工厂：动态密码策略 + 密码对联动）。更早：`a6fa3ac` / `80da1ae`。

## 工厂（apex_dev 命名）

```ts
// §1 类型
export interface PwdCtx { getPassword; getConfirmPassword; getFormRef; confirmProp? }
export interface PwdPolicy { minLength; requireUppercase?; ... }
export interface PwdPairOpt { policy?: PwdPolicy; trigger? }

// §4 唯一出口
export function pwdPair(ctx, options?) {
  const plcy = options?.policy ?? { minLength: 6 };
  // pwdMinRules + 复杂度 validator + appendPwdSync + cfmPwdRules
  return { password, confirmPassword };
}
```

microfb 等价：`pwdConfirmPair` + `PwdConfirmCtx` + `createPasswordRules(minLen)`。

## 网关（apex_dev）

```ts
async getPwdPolicy(): Promise<PwdPolicy> {
  return handleGatewayError(async () => {
    const { config } = await ConfigV2API.detail({});
    return { minLength: Math.max(6, Number(config.passwordMinLength || 6)), ... };
  }, "加载密码策略失败");
}
```

## 页面 — UserFormFields

```vue
<el-form :validate-on-rule-change="false" ... />

<script setup>
const pwdPlcy = ref<Awaited<ReturnType<typeof ConfigGateway.getPwdPolicy>>>();
const rules = computed(() => {
  if (!showPasswordFields || readonlyMode || model?.id) return props.rules;
  return { ...props.rules, ...pwdPair(pwdCtx, { policy: pwdPlcy.value }) };
});
onMounted(() => void ConfigGateway.getPwdPolicy().then((p) => { pwdPlcy.value = p; }));
</script>
```

## 页面 — profile 改密（prop 映射）

```ts
const { password, confirmPassword } = pwdPair(pwdCtx, { policy: pwdPlcy.value });
return {
  oldPassword: [{ required: true, message: "请输入原密码", trigger: ["blur", "change"] }],
  newPassword: password,
  confirmPassword,
};
// 打开弹窗时拉 getPwdPolicy + nextTick(clearValidate)
```

## 反模式

- 父级 `rules` 仍写 `password`/`confirmPassword` 与 `pwdPair` 重复
- 页面 import `DEF_PWD_PLCY` 作 `pwdPlcy` 初值
- 动态 `computed` rules 不设 `validate-on-rule-change="false"`
- 网关 silent catch 回退默认策略（apex 管理端应 toast + throw）
