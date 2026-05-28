# pwdPair 密码对 — 策略 tips（双仓 UI）

来源：**microfb `da51cb3c`**、**apex_dev `f8365ff7`**（规则工厂 + 密码策略 tips）。

规则对 / 网关 / `validate-on-rule-change` 见同目录 [`pwd-pair-sample.md`](pwd-pair-sample.md)。本文只讲 **tips 文案与 UI 接入**。

## 原则

- **同一 `policy` ref** 同时喂给 `pwdPair`/`pwdConfirmPair` 与 `PwdPolicyTip`；禁止页面手写与 rules 不一致的说明。
- `policy` 未就绪：`PwdPolicyTip` 不展示（`v-if="policy && tip"`）；rules 仍用 `options?.policy ?? { minLength: 6 }`。
- **不** export / 不使用 `DEF_PWD_PLCY`、`DEFAULT_PWD_POLICY` 作 `pwdPlcy` 初值。

## 工厂（两仓同名）

```ts
/** 与 pwdPair 同源策略对象生成说明文案 */
export function pwdPlcyTip(plcy?: PwdPolicy): string {
  const p = plcy ?? { minLength: 6 };
  // 拼接「至少 N 位」+ 可选「包括数字、大小写字母…」
  return t("密码为必填项，至少{minLength}位{extra}", { minLength: p.minLength, extra });
}
```

- apex：`PwdPolicy` + `pwdPair`
- microfb：`PwdConfirmPolicy` + `pwdConfirmPair`
- 片段：[`formRules.pwdPair.fragment.ts`](../../template/sample-nebula/after/formRules.pwdPair.fragment.ts)（含 `pwdPlcyTip`）

## apex_dev — label 旁 icon tooltip

组件：[`components/form/PwdPolicyTip.vue`](../../../../apex_dev/src/components/form/PwdPolicyTip.vue)

```vue
<el-form-item prop="password">
  <template #label>
    <div class="inline-flex items-center gap-1">
      <span>{{ $t("密码") }}</span>
      <PwdPolicyTip :policy="pwdPlcy" />
    </div>
  </template>
  <el-input v-model="model.password" type="password" show-password />
</el-form-item>
```

```vue
<script setup lang="ts">
import PwdPolicyTip from "@/components/form/PwdPolicyTip.vue";
import ConfigGateway from "@/gateway/system/config.gateway";
import { pwdPair, type PwdCtx, type PwdPolicy } from "@/utils/formRules";

const pwdPlcy = ref<PwdPolicy>();
const rules = computed(() => ({
  ...props.rules,
  ...pwdPair(pwdCtx, { policy: pwdPlcy.value }),
}));

onMounted(() => {
  void ConfigGateway.getPwdPolicy().then((p) => {
    pwdPlcy.value = p;
  });
});
</script>
```

样板：[`PwdPolicyTip.apex.wire.fragment.vue`](../../template/sample-nebula/after/PwdPolicyTip.apex.wire.fragment.vue)

## microfb — 标题下副标题

组件：[`components/auth/PwdPolicyTip.vue`](../../../../microfb/src/components/auth/PwdPolicyTip.vue)（`variant="subtitle"` 默认）

壳层：[`ForgotStepPanel.vue`](../../../../microfb/src/views/login/components/ForgotStepPanel.vue) 在标题下渲染 `<PwdPolicyTip :policy="passwordPolicy" />`。

```vue
<ForgotResetStep
  :password-policy="pwdPolicy"
  :base-rules="resetRules"
  ...
/>
```

```ts
// LoginForgotPassword.vue — 验证步预拉 + 进重置步前 await，保证 tips 就绪
const pwdPolicy = ref<PwdConfirmPolicy>();

async function getPwdPolicy() {
  if (pwdPolicy.value) return pwdPolicy.value;
  try {
    pwdPolicy.value = await SecurityConfigGateway.getPasswordPolicy();
  } catch { /* gateway 已 toast */ }
  return pwdPolicy.value;
}

onMounted(() => void getPwdPolicy());

async function goToResetStep() {
  // validate + requestPasswordResetCode ...
  await getPwdPolicy();
  step.value = "reset";
}
```

样板：[`PwdPolicyTip.microfb.wire.fragment.vue`](../../template/sample-nebula/after/PwdPolicyTip.microfb.wire.fragment.vue)、[`ForgotPwdWithTips.wire.fragment.vue`](../../template/sample-nebula/after/ForgotPwdWithTips.wire.fragment.vue)

## 反模式

- 在模板写死「密码至少 8 位」而 rules 仍用默认 6
- tips 用一套 policy、rules 用另一套（或未拉网关就展示 tips）
- 重复在父级 `rules` 写 password/confirm 同时又 `pwdPair` spread

## 历史对照（更早落地）

- microfb `a6fa3ac`、apex_dev `80da1ae` — 与本次 commit 同模式，命名与路径以 `da51cb3` / `f8365ff` 为准。
