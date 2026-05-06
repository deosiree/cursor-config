---
name: Cookie-Session 租户隔离链路
description: 用于解释、审计或排查 microfb 的 Cookie-Session 租户隔离链路，覆盖登录、Set-Cookie、withCredentials、路由守卫 verifySession 与后端会话判定边界。
---

# 目标
快速说清并验证：前端如何配合浏览器携带 `session_id`，让后端基于会话完成用户与租户识别。

## 核心原则
1. 前端不会把权限数据写入 Cookie。
2. 前端负责“请求链路正确配置 + 本地展示态缓存”。
3. 后端负责“会话真相与租户隔离判定”。

## 执行步骤
1. 对照 `docs/认证与访问控制方案设计.md` 确认架构基线。
2. 检查登录链路：
   - `POST /seccenter/v2/auth/login`
   - 响应是否包含 `Set-Cookie: session_id=...`
3. 检查请求拦截器：
   - v2/internal 请求是否统一 `withCredentials=true`
   - 是否移除 `Authorization`，避免 JWT 混用
4. 检查导航会话预检：
   - 路由守卫是否调用 `seccenter/internal/auth/verify`
   - verify 返回是否包含 `tenantId/userId/roleId`
5. 区分“展示缓存”与“判定真相”：
   - `userInfo/menuList` 仅用于前端渲染
   - 鉴权与租户隔离以后端返回为准
6. 产出结论与排障清单。

## 证据文件
1. `microfb/src/utils/request.ts`
2. `microfb/src/api/seccenter/auth.v2.api.ts`
3. `microfb/src/api/seccenter/internal-auth.v2.api.ts`
4. `microfb/src/plugins/permission.ts`
5. `microfb/src/store/modules/user.store.ts`
6. `docs/认证与访问控制方案设计.md`

## 输出模板
1. 一句话结论：前端做什么，后端做什么。
2. 前端职责（逐条附代码路径）。
3. 后端职责（逐条附接口/设计依据）。
4. 常见误区（至少 3 条）。
5. 排障清单：
   - Set-Cookie 是否存在
   - withCredentials 是否生效
   - CORS 凭证策略是否正确
   - Cookie 属性（Domain/Path/SameSite/Secure）是否匹配
   - verifySession 是否返回 tenantId
   - 401 是否触发本地状态清理

## 约束
1. 禁止表述“前端把权限写进 Cookie”。
2. 必须显式区分“本地缓存”与“鉴权真相”。
3. 讨论安全时必须提及 `HttpOnly/SameSite/Secure`。
