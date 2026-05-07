---
name: 退化 API 网关旧兼容层 few-shot
description: 给 agent 一个“如何结合契约退化旧 API/gateway 兼容层”的最小成品示例。
---

# 示例输入
使用 $api-gateway-deprecate 清理 microfb 中已经下线的 v1 兼容层：
1. 删除 `gateway-version-policy.ts` / `gateway-executor.ts`
2. 把业务层 `loginV2` 收口到 `login`
3. 先根据 Swagger 判断哪些旧 API 真能删，哪些只是命名不一致
4. 顺手删除无引用旧 `auth.api.ts`、`role.api.ts` 和临时兜底

# 示例输出骨架
1. 兼容层落点
- `src/api/gateway/gateway-version-policy.ts`
- `src/api/gateway/gateway-executor.ts`
- `auth.gateway.ts` 中 `loginV2`
- `src/temp/temp-v1-menu.ts`

2. 契约判边
- `AuthLoginReq`、`UpdateMenuRequest` 仍在现行契约中，建议重命名引用而不是删除
- `MenuV1Response`、旧 fallback 执行器只服务旧版本能力，可删除

3. 删除/保留/重命名决策
- 删除：`gateway-version-policy.ts`
- 删除：`gateway-executor.ts`
- 删除：只验证 fallback 的测试
- 重命名收口：仍对应现行契约的旧命名
- 保留：仍承担 DTO -> stable 映射职责的主方法

4. 业务调用收口
- `views/login/use-login.ts`：`loginV2` -> `login`

5. 分阶段执行建议
- 第一阶段：删策略层与兼容壳，收口业务调用
- 第二阶段：删旧 API、旧测试、临时兜底
- 第三阶段：清理命名、注释与残留
