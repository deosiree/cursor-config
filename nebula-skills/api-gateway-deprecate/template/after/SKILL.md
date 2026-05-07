---
name: 退化后状态示例
description: 展示网关退化后只保留现行入口、删除旧 API 和临时兜底文件，并完成契约命名收口的目标形态
---

# 退化后状态示例

## 代表性结果
1. `gateway-version-policy.ts` 与 `gateway-executor.ts` 已删除。
2. `auth/role/device/menu` gateway 直接调用现行 API。
3. 业务层统一从 `loginV2`、`xxxV1` 收口到现行入口。
4. 无引用旧 `auth.api.ts` / `role.api.ts` / `menu.v1.api.ts` 已删除。
5. `src/temp/temp-v1-menu.ts` 已删除。
6. fallback 测试已删除或改写为直接调用现行 API 的断言。
7. 仍对应现行契约的旧命名已完成重命名收口，而不是误删。

## 典型片段
```ts
async login(data: AuthLoginReq): Promise<AuthLoginRes> {
  return mapLoginResponseEnumFields(await AuthV2API.login(normalizeLoginRequest(data)));
}
```

```ts
async function login(payload: AuthLoginReq) {
  const res = await AuthGateway.login(payload);
  return res;
}
```
