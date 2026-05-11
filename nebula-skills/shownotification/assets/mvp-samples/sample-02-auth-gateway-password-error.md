# MVP Sample 02

## 标题
错误通知边界上收至 auth gateway，密码加密失败直接提示并抛错

## 适用场景
- helper / gateway / 页面都可能处理同一认证错误
- 希望把错误提示收口到更靠近业务语义的一层
- 需要避免后端错误或加密错误的重复弹窗

## 历史版本
- before: `c06a8b5893ab6dace9407501969e5c6138eb06f2^`
- after: `c06a8b5893ab6dace9407501969e5c6138eb06f2`

## 说明
以下片段直接摘自 `microfb` 历史提交，只做了最小裁剪。
原 commit 里仍带有 `t(...)`，本文保留真实历史，再单独给出本 skill 的降噪写法。

如果你不是在做“历史回填”，而是在给新项目第一次接入 `showNotificationError`，
请先看 `[[../examples/bootstrap-showNotificationError.md]]`，再回来看这个样本。

## 先看这个
按本 skill 的职责收口，先消费这组不包 `t()` 的推荐写法，再决定是否下钻真实历史：

```ts
showNotificationError(err, "密码加密失败");
showNotificationError(err, "登录失败");
showNotificationError(err, "密码重置失败");
```

只有当你需要回答“这条链路在真实项目里是怎么迁移的”时，
再继续看下面的历史真实片段。

## 只关注的最小片段
- `src/gateway/auth.gateway.ts`
  `resolvePasswordForTransit(...)` 内部提示并继续抛错
- `src/utils/notification.ts`
  `showNotificationError` 优先读取 `err.message`
- `src/views/login/components/LoginForgotPassword.vue`
  页面不再自己翻译后端错误结构

## 历史真实片段：before

### `src/gateway/auth.gateway.ts`

```ts
const passwordResult = resolvePasswordForTransit(form.password, loginCfg);
if (!passwordResult.ok) {
  showNotification(passwordResult.code, { type: "error" });
  throw new Error(passwordResult.code);
}

const wireReq: AuthLoginReq = {
  ...form,
  password: passwordResult.password,
};
```

### `src/utils/notification.ts`

```ts
export function showNotificationError(err: any, message?: string) {
  const msg = err?.error?.message ?? message;
  const code = err?.error.code ? `[${err?.error.code}]` : "";
  showNotification(code + msg, { type: "error" });
}
```

### `src/views/login/components/LoginForgotPassword.vue`

```ts
async function resolvePasswordForReset(plainPassword: string): Promise<string> {
  const latestSetting = await loginSecurityStore.ensureLoginCfg();
  const result = resolvePasswordForTransit(plainPassword, latestSetting);
  if (!result.ok) {
    throw new Error(result.code);
  }
  return result.password;
}

try {
  const newPassword = await resolvePasswordForReset(form.password);
  ...
} catch (err: any) {
  showNotificationError(err, t("密码重置失败"));
}
```

## 历史真实片段：after

### 历史真实片段

### `src/gateway/auth.gateway.ts`

```ts
export function resolvePasswordForTransit(
  plainPassword: string,
  setting?: PasswordTransitSetting | null
): string {
  if (!setting?.encryptPasswordInTransit) {
    return plainPassword;
  }

  try {
    const publicKey = String(setting.encryptPasswordPubKey || "").trim();
    if (!publicKey) {
      throw new Error("密码加密公钥缺失");
    }

    const encrypted = encryptPassword(plainPassword, publicKey);
    if (!encrypted) {
      throw new Error("密码加密失败");
    }
    return encrypted;
  } catch (err: any) {
    showNotificationError(err, "密码加密失败");
    throw err;
  }
}
```

```ts
async loginByPassword(
  form: PasswordLoginForm,
  loginCfg: PasswordLoginOptions["loginCfg"]
): Promise<LoginDecisionResult> {
  const password = resolvePasswordForTransit(form.password, loginCfg);

  try {
    const wireReq: AuthLoginReq = {
      ...form,
      identifier: form.identifier.trim(),
      password,
      loginType: "pwd",
      captchaKey: form.captchaKey.trim(),
      captchaCode: form.captchaCode.trim(),
    };
    const res = await this.login(wireReq);
    return resolveLoginDecision(res, loginCfg);
  } catch (err: any) {
    showNotificationError(err, t("登录失败"));
    throw err;
  }
}
```

### `src/utils/notification.ts`

```ts
export function showNotificationError(err: any, message?: string) {
  const msg = err?.error?.message ?? err?.message ?? message ?? "操作失败";
  const code = err?.error.code ? `[${err?.error.code}]` : "";
  showNotification(code + msg, { type: "error" });
}
```

### `src/views/login/components/LoginForgotPassword.vue`

```ts
async function resolvePasswordForReset(plainPassword: string): Promise<string> {
  const latestSetting = await loginSecurityStore.ensureLoginCfg();
  return resolvePasswordForTransit(plainPassword, latestSetting);
}

const newPassword = await resolvePasswordForReset(form.password);

try {
  const result = await PasswordResetAPI.reset({
    identifier: form.account.trim(),
    code: form.code.trim(),
    newPassword,
  });
  ...
} catch (err: any) {
  showNotificationError(err, t("密码重置失败"));
}
```

## 为什么这里仍保留 `t(...)`
上面的 `after` 片段是历史真实代码；本 skill 自己的推荐写法，以上面的“先看这个”为准。

## 修改要点
- 去掉前端自造的 `{ ok, code }` 结果协议
- 让密码加密失败在更靠近语义的 gateway/helper 层直接通知并抛错
- `showNotificationError` 兼容普通 `Error.message`
- 页面层从“解释错误结构”退化成“消费稳定异常链路”

## 这个样本证明什么
- 谁最了解错误语义，谁负责提示
- 提示后继续抛错是允许的，但上层不应重复提示
- 页面层应该消费收口后的异常链路，而不是重复手写错误通知

## 样本降噪规则
- 若原 commit 中出现 `t(...)`，在本 skill 样本里统一视为普通字符串 fallback
- 本样本只讨论通知职责，不讨论国际化
