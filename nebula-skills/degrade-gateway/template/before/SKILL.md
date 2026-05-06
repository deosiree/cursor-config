---
name: 退化前状态示例
description: 展示网关退化前仍保留版本策略层、兼容壳、旧 API 与临时兜底的典型形态
---

# 退化前状态示例

## 代表性信号
1. `src/api/gateway/gateway-version-policy.ts` 仍存在。
2. `src/api/gateway/gateway-executor.ts` 仍存在。
3. `auth.gateway.ts` 仍通过 `executeWithVersionFallback` 调用新旧分支。
4. `user.store.ts` 或页面层仍调用 `loginV2`。
5. `src/api/auth.api.ts`、`src/api/role.api.ts` 仍保留在仓库中。
6. `src/temp/temp-v1-menu.ts` 仍作为历史临时兜底文件存在。

## 典型片段
```ts
import { executeWithVersionFallback } from "@/api/gateway/gateway-executor";

async login(data) {
  return executeWithVersionFallback({
    module: "auth",
    action: "login",
    implementations: {
      v2: () => AuthV2API.login(data),
      v1: () => AuthAPI.login(data),
    },
  });
}
```

```ts
async loginV2(payload) {
  const res = await AuthGateway.loginV2(payload);
  return res;
}
```
