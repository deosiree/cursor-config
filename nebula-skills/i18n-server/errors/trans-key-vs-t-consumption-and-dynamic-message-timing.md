# `trans()` 返回 key 时的消费边界，以及动态拼接文案的双层翻译/错误翻译时机

## 现象

在 `microfb` 登录链路里，`src/utils/login-auth.ts` 和 `src/utils/login-mfa.ts` 中存在两类 i18n 返回值：

- 简单映射：返回单个国际化 key
- 动态拼接：返回由多个片段和变量拼出来的最终文案

如果把这两类返回值都按同一种方式消费，就会出现两类典型错误：

1. 双层翻译  
   先在工具函数里翻译，消费点再调用一次 `t()`
2. 错误翻译时机  
   工具函数先把多个片段拼成最终字符串，消费点再把整句字符串当成 key 去 `t()`

---

## `trans()` 的真实语义

在本项目里，`trans()` 的作用是：

- 让抽取脚本识别“这是一条国际化 key”
- 运行时原样返回字符串
- **不做翻译**

因此：

- `trans("短信验证码已发送")` 返回的是 key：`"短信验证码已发送"`
- 真正展示给用户时，消费点还需要显式调用 `t(...)`

适用于这种函数：

```ts
export function resolveOtpSendSuccessText(channel: OtpChannel): string {
  return channel === "phone" ? trans("短信验证码已发送") : trans("邮箱验证码已发送");
}
```

消费点应写成：

```ts
showNotification(t(resolveOtpSendSuccessText(otpChannel)));
```

相关定义与引用：

- 定义：[login-auth.ts](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-auth.ts:30)
- 引用：[Login.vue](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:575)

---

## 错误模式一：双层翻译

### 错误定义

工具函数内部已经返回“最终文案”，消费点又调用一次 `t(...)`。

### 错误示例

```ts
function resolveText() {
  return t("短信验证码已发送");
}

showNotification(t(resolveText()));
```

### 问题

- 第一次 `t(...)` 已经把 key 翻译成最终文本
- 第二次 `t(...)` 会把最终文本再当 key 查一次
- 如果词条表中没有“翻译后的文本”这个 key，就会查不到
- 即使碰巧查得到，语义也已经错了

### 本次链路里对应的易错点

以下函数如果未来被改成“直接返回最终文案”，那它们的消费点就**不能**再包 `t(...)`：

- [resolveOtpSendSuccessText](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-auth.ts:30)
- [normalizeMfaText](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-mfa.ts:45)
- [normalizeMfaPlaceholder](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-mfa.ts:101)
- [resolveMfaSendSuccessText](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-mfa.ts:121)

当前正确消费点：

- [Login.vue `mfaMethodText`](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:291)
- [Login.vue `mfaCodePlaceholder`](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:292)
- [Login.vue `showNotification(t(resolveMfaSendSuccessText(...)))`](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:524)
- [Login.vue `showNotification(t(resolveOtpSendSuccessText(...)))`](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:575)

---

## 错误模式二：动态拼接后的错误翻译时机

### 错误定义

工具函数内部先拼出最终字符串，消费点再整体调用 `t(...)`。

### 错误示例

```ts
function resolveHint(channel: string, masked: string) {
  return "验证码将发送到" + channel + "：" + masked;
}

const hint = t(resolveHint("短信", "138****0000"));
```

### 问题

最终传给 `t(...)` 的已经不是稳定 key，而是动态字符串，例如：

```text
验证码将发送到短信：138****0000
```

这会导致：

- 词条表里通常不存在这样的完整 key
- 即使中文环境看起来“能显示”，本质上只是 key 原样回显
- 一旦切英文或其他语言，动态串无法正确翻译

### 本次链路里的具体例子

动态文案函数：

- 定义：[resolveMfaHintText](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-mfa.ts:131)

它涉及：

- 前缀 key：`"验证码将发送到"`
- 渠道 key：`"短信"` / `"邮箱"`
- 标点 key：`"："` / `"。"`
- 动态变量：脱敏手机号 / 邮箱

如果让它直接返回拼好的字符串，再在 `Login.vue` 里写：

```ts
const mfaHintText = computed(() => t(resolveMfaHintText(...)));
```

就会把整句动态字符串错误地当成 key 去翻译。

### 正确做法

对动态拼接文案，**不要在外层整体 `t(...)`**。  
应当把 `t` 传进函数，在函数内部按片段翻译后，再拼接最终字符串：

```ts
resolveMfaHintText({
  t,
  requiresMfa,
  isMfaChallengeActive,
  channel,
  maskedPhone,
  maskedEmail,
});
```

当前正确实现与引用：

- 定义：[login-mfa.ts](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\utils\login-mfa.ts:131)
- 引用：[Login.vue `mfaHintText`](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:293)
- 展示：[Login.vue 模板](F:\Documents\Repertory\Sieyuan\nebula\microfb\src\views\login\components\Login.vue:123)

---

## 这类函数应该怎么分

### A. 返回 key，消费点调用 `t(...)`

适用于：

- 单个稳定词条
- 简单条件映射
- 不涉及动态变量拼接

本次对应：

- `resolveOtpSendSuccessText`
- `resolveOtpInputError`
- `normalizeMfaText`
- `getMfaChannelLabel`
- `normalizeMfaPlaceholder`
- `resolveMfaSendSuccessText`
- `normalizeMfaChannel`

### B. 返回最终文案，函数内部接收 `t`

适用于：

- 需要拼接多个 key
- 需要混合动态变量
- 不能把最终结果再当 key 去查

本次对应：

- `resolveMfaHintText`

---

## 检查清单

提交前可用这份清单快速判断：

- [ ] 这个函数返回的是单个稳定 key，还是最终文案？
- [ ] 如果返回的是 key，消费点是否显式 `t(...)`？
- [ ] 如果返回的是最终文案，消费点是否避免再整体 `t(...)`？
- [ ] 动态变量是否参与了字符串拼接？
- [ ] 是否误把“翻译后的整句文本”再次当作 key 去查？

---

## 结论

`trans()` 本身不会翻译，它只是标记 key。  
真正容易出错的不是 `trans()`，而是没有区分下面两类返回值：

- 返回 key：消费点 `t(...)`
- 返回最终动态文案：函数内部用传入的 `t` 逐片翻译并拼接

一旦把“动态拼接后的整句字符串”放到外层再 `t(...)`，就会出现典型的**双层翻译/错误翻译时机**问题。
