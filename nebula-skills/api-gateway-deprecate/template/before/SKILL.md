---
name: 退化前状态示例
description: 展示网关退化前仍保留版本策略层、兼容壳、旧 API、临时兜底，以及需要按契约判边的典型形态
---

# 退化前状态示例

## 代表性信号
1. `src/gateway/gateway-version-policy.ts` 仍存在。
2. `src/gateway/gateway-executor.ts` 仍存在。
3. `auth.gateway.ts` 或 `menu.gateway.ts` 仍通过 `executeWithVersionFallback` 调用新旧分支。
4. `user.store.ts`、页面层或 composable 仍调用 `loginV2` 这类历史入口。
5. `src/api/auth.api.ts`、`src/api/role.api.ts`、`src/api/menu.v1.api.ts` 仍保留在仓库中。
6. `src/temp/temp-v1-menu.ts` 仍作为历史临时兜底文件存在。
7. 部分旧命名在 Swagger 中仍有现行对应项，不能只按“名字旧”直接删。

## 典型片段
```ts
import { executeWithVersionFallback } from "@/gateway/gateway-executor";

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

## 契约判边提醒
- 若 `UpdateMenuRequest`、`AuthLoginReq` 等名字在当前契约仍存在，只是仓内命名未收口，优先重命名而不是删除。
- 若某个旧类型只服务已下线版本能力，且契约中已无对应项，才进入删除候选。
