---
name: 配置-密码对规则
description: 在 rules 模块落地 pwdPair/pwdConfirmPair、策略类型与网关 getPwdPolicy；页面 spread 接入，含 validate-on-rule-change 与 profile 字段映射。
---

# 配置-密码对规则

父级：[`../../SKILL.md`](../../SKILL.md)。`ruleStyle=pwdPair`。

模型：[`../../references/password-pair-model.md`](../../references/password-pair-model.md)。

## 何时使用

- 表单含 **password + confirmPassword**（或 newPassword + confirmPassword）
- 需按租户 **passwordMinLength / 复杂度 flags** 动态校验
- 需 password 改后 confirm **联动** `validateField`
- 用户提到 **pwdPair**、**密码策略**、**密码对规则工厂**

## 何时不要使用

- 仅单个密码框、无确认密码 → `factoryGeneric` 的 `createPasswordRules` 或内联 min
- 仅改密「原密码」字段 → 页面必填即可，不走 pwdPair
- 补 i18n locale → 不在本 skill

## RED

1. 读 [`password-pair-model.md`](../../references/password-pair-model.md) 确认仓库命名（microfb vs apex_dev）
2. grep 页面是否仍在三行拼装或父级重复 `password` rules
3. 确认策略网关落点（microfb `SecurityConfigGateway` / apex `ConfigGateway.getPwdPolicy`）

## GREEN

### 1. rules 模块（§1 + §4）

| 项 | 要求 |
|----|------|
| 类型 | `PwdCtx` / `PwdPolicy` / `PwdPairOpt` 放 §1 |
| 出口 | **仅** export `pwdPair`（或 `pwdConfirmPair`） |
| 默认 | `options?.policy ?? { minLength: 6 }` 内联，**不** export 常量 |
| 文案 | ``密码不能少于 ${minLen} 位`` |
| 私有 | `appendPwdSync` / 复杂度 validator 内聚，不 export FromPolicy 薄包装 |
| trigger | 密码段内联 `["blur", "change"]`，不新增 `RULE_TRIGGER` 模块常量 |

模板：[`formRules.pwdPair.fragment.ts`](../../template/sample-nebula/after/formRules.pwdPair.fragment.ts)

### 2. 策略网关

- wire 字段**内联**映射，不经 stable mapper 再转 policy
- apex 管理端：`handleGatewayError`，失败 toast + throw
- microfb 未鉴权页：按项目约定（可 throw，不 silent 假装策略已生效）

### 3. 页面接入

| 场景 | 要点 |
|------|------|
| 子组件 spread | 父级 rules **去掉** password/confirm |
| 仅密码对弹窗 | `computed(() => ({ ...pwdPair(ctx, { policy: pwdPlcy.value }) }))` |
| profile 改密 | `newPassword: password` 映射；原密码仅必填 |
| 动态 rules | `:validate-on-rule-change="false"` |
| 打开弹窗 | 拉 policy + `nextTick(clearValidate)`；关闭清 `pwdPlcy` |

样板：[`PwdPairForm.wire.fragment.vue`](../../template/sample-nebula/after/PwdPairForm.wire.fragment.vue)

### 3.5 密码对 tips（`pwdPlcyTip` + `PwdPolicyTip`）

| 项 | 要求 |
|----|------|
| 工厂 | export `pwdPlcyTip(plcy)`，与 `pwdPair` **同一** `policy` 对象；内联默认 `{ minLength: 6 }` |
| 组件 | 只传 `:policy="pwdPlcy"`，**禁止**在 Vue 里手写与 rules 不一致的说明句 |
| apex | `#label` 插槽内 `<PwdPolicyTip />`（tooltip 图标） |
| microfb | `ForgotStepPanel` `:password-policy` → 标题下副标题 |
| 拉取时机 | 打开表单/进重置步前拉网关；microfb 可验证步预拉 + 重置步 `await` 双保险 |

样板：[`PwdPolicyTip.apex.wire.fragment.vue`](../../template/sample-nebula/after/PwdPolicyTip.apex.wire.fragment.vue)、[`PwdPolicyTip.microfb.wire.fragment.vue`](../../template/sample-nebula/after/PwdPolicyTip.microfb.wire.fragment.vue)、[`ForgotPwdWithTips.wire.fragment.vue`](../../template/sample-nebula/after/ForgotPwdWithTips.wire.fragment.vue)

few-shot：[`pwd-pair-tips-sample.md`](../../assets/few-shot-example/pwd-pair-tips-sample.md)

### 4. 单测

[`formRules.pwdConfirm.test.fragment.ts`](../../template/sample-nebula/after/formRules.pwdConfirm.test.fragment.ts)

## 参考

- few-shot：[`pwd-pair-sample.md`](../../assets/few-shot-example/pwd-pair-sample.md)、[`pwd-pair-tips-sample.md`](../../assets/few-shot-example/pwd-pair-tips-sample.md)
- 历史 commit：microfb `da51cb3c`、apex_dev `f8365ff7`

## 验收

- [ ] 无 `DEFAULT_PWD_POLICY` / `DEF_PWD_PLCY` export；无 FromPolicy 薄包装
- [ ] 策略 minLength 7 → UI 提示「密码不能少于 7 位」
- [ ] 打开弹窗无全红；提交仍 `validate()` 拦截
- [ ] `pwdPlcyTip` 与 `pwdPair` 同 policy；复杂度 flags 变化时 tips 与校验一致
- [ ] pwdConfirm 单测通过
- [ ] 未改 locale
