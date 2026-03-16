# 网关版本主路由与降级链收束 - 对话摘要

## 1. 任务目标
将 `microfb` 与 `apex_dev` 从“业务层直连 v1/v2 API + 布尔开关分支”收敛到“gateway 统一入口 + 主版本/降级链策略（primary/fallback）”，并可演进到 `v3 -> v2 -> v1`。

当前状态：
1. 方案已确认并固化为项目级 skill。
2. 批次A（策略底座）已在双项目完成。
3. 批次B（gateway 收口 + 业务层关键直连清理）已在双项目完成。
4. 双项目 type-check 通过；microfb gateway 单测通过。

## 2. 关键实现逻辑
1. 策略中心：`gateway-version-policy.ts`
- 统一解析 `VITE_GATEWAY_<MODULE>_PRIMARY/FALLBACK`。
- 未配置新变量时兼容旧 `VITE_USE_SECCENTER_V2_*`。
- 输出 `getModulePolicy()` 与 `getExecutionOrder()`。

2. 统一执行器：`gateway-executor.ts`
- 按执行顺序逐版本调用。
- 当前版本失败时自动降级到下一跳。
- 所有实现失败才抛错。

3. 兼容层：`gateway-flags.ts`
- 保留 `isV2Enabled()` 供旧代码过渡使用。
- 内部不再直接读 env，而是基于 `getExecutionOrder()` 判断 v2 是否优先于 v1。

4. 业务层收口原则
- `views/store/utils/plugins` 不允许出现：
  - 直连 `*.v2.api/*.v3.api`
  - 直读 `VITE_USE_SECCENTER*`。
- 统一通过 `src/api/gateway/*` 调用。

## 3. 关键决策
1. 版本策略采用“主版本 + 失败降级链”统一模型。
2. 当前默认链路：`v2 -> v1`（auth/menu/user/role/device/tenant/securityConfig）。
3. 为避免 v1/v2 返回类型不一致导致阻塞，执行器泛型改为宽返回类型（运行时行为不变）。
4. 先收 gateway 与关键业务层，再做全量页面/模块细化迁移（批次C）。

## 4. 文件修改清单（高价值）
### 4.1 规则与设计文档
1. `.cursor/nebula-skills/gateway-version-control/SKILL.md`（升级为主版本+降级链）
2. `.cursor/nebula-skills/gateway-version-control/agents/openai.yaml`
3. `docs/plans/2026-03-12-gateway-version-policy-convergence-design.md`

### 4.2 microfb
1. `src/api/gateway/gateway-version-policy.ts`
2. `src/api/gateway/gateway-executor.ts`
3. `src/api/gateway/gateway-flags.ts`
4. `src/api/gateway/index.ts`
5. `src/api/gateway/auth.gateway.ts`
6. `src/api/gateway/menu.gateway.ts`
7. `src/api/gateway/internal-auth.gateway.ts`
8. `src/api/gateway/__tests__/gateway-version-policy.test.ts`
9. `src/api/gateway/__tests__/gateway-executor.test.ts`
10. `src/store/modules/user/user.store.ts`
11. `src/store/modules/permission.store.ts`
12. `src/plugins/permission.ts`
13. `src/views/login/components/Login.vue`
14. `src/views/login/components/Register.vue`
15. `src/views/login_v2/components/Login.vue`
16. `src/views/login_v2/components/Register.vue`
17. `src/views/login_v2/components/VerifyTwoFactor.vue`
18. `src/utils/token-backdoor.ts`
19. `src/utils/permission-bypass.ts`
20. `.env.development`
21. `src/vite-env.d.ts`

### 4.3 apex_dev
1. `src/api/gateway/gateway-version-policy.ts`
2. `src/api/gateway/gateway-executor.ts`
3. `src/api/gateway/gateway-flags.ts`
4. `src/api/gateway/index.ts`
5. `src/api/gateway/auth.gateway.ts`
6. `src/api/gateway/menu.gateway.ts`
7. `src/api/gateway/user.gateway.ts`
8. `src/api/gateway/role.gateway.ts`
9. `src/api/gateway/config.gateway.ts`
10. `src/store/modules/user.store.ts`
11. `src/utils/token-backdoor.ts`
12. `.env.development`
13. `src/types/env.d.ts`

## 5. 关键代码位置（用于新会话快速定位）
1. `microfb/src/api/gateway/gateway-version-policy.ts:77`
2. `microfb/src/api/gateway/gateway-executor.ts:25`
3. `microfb/src/api/gateway/gateway-flags.ts:16`
4. `apex_dev/src/api/gateway/gateway-version-policy.ts:89`
5. `apex_dev/src/api/gateway/gateway-executor.ts:31`
6. `apex_dev/src/api/gateway/gateway-flags.ts:19`
7. `microfb/src/store/modules/user/user.store.ts:235`（v2 登录入口改走 AuthGateway）
8. `microfb/src/plugins/permission.ts:153`（session verify 改走 InternalAuthGateway）
9. `apex_dev/src/store/modules/user.store.ts:30`（login 改走 AuthGateway）
10. `apex_dev/src/utils/token-backdoor.ts:67`（验证码改走 AuthGateway）
11. `microfb/.env.development:34`（新策略变量起始）
12. `apex_dev/.env.development:33`（新策略变量起始）

## 6. 验证结果
已执行并通过：
1. `microfb`: `npm run type-check`
2. `microfb`: `npm run test:unit -- src/api/gateway/__tests__/gateway-version-policy.test.ts src/api/gateway/__tests__/gateway-executor.test.ts`
3. `apex_dev`: `npm run type-check`
4. 泄漏扫描（microfb/apex_dev 业务层）
- `rg -n "\.v2\.api|VITE_USE_SECCENTER" src/views src/store src/utils src/plugins`：当前无命中（允许 gateway 内部命中）。

## 7. 风险与注意事项
1. `AuthGateway.sendOtp` 在 microfb 做了宽类型兼容（登录前 OTP 与 MFA send code 共用入口），后续如后端协议明确建议拆成两个显式方法。
2. 执行器使用宽返回类型是为兼容过渡期 v1/v2 结构差异；批次C可逐模块收紧返回类型。
3. 当前工作区本身存在较多历史未提交改动，新会话执行时避免误回滚非本任务变更。

## 8. 新会话直接执行建议（批次C）
1. 目标
- 完成“剩余模块/页面级网关分流一致性”与“降级链观测增强”。

2. 建议步骤
1. 在 `microfb` 为 `auth/menu` gateway 增补分流单测（成功/降级/全失败）。
2. 在 `apex_dev` 为 `auth/menu/user/role/config` 增补分流单测。
3. 将仍依赖旧语义的调用点统一改为 `getExecutionOrder()` 或直接用 `executeWithVersionFallback`。
4. 增加网关降级日志规范（module/action/version/errorCode）。
5. 输出“旧开关下线清单”（`VITE_USE_SECCENTER_V2_*` 删除顺序与回滚策略）。

3. 新会话可直接粘贴的提示词
- “继续执行 `docs/plans/2026-03-12-gateway-version-policy-convergence-design.md` 的批次C：补齐 microfb/apex_dev 的 gateway 分流测试，收紧 executeWithVersionFallback 的调用类型，并产出旧开关下线计划。先扫描当前差距，再按模块提交最小改动并跑 type-check/test。”

## 9. 外部最佳实践校验
来源：
1. GitHub Docs - Helping others review your changes
- https://docs.github.com/pull-requests/collaborating-with-pull-requests/getting-started/best-practices-for-pull-requests
2. MDN - Pull request submission and reviews
- https://developer.mozilla.org/en-US/docs/MDN/Community/Pull_requests

采纳点：
1. 摘要优先给“改了什么 + 为什么 + 如何验证”，并列出可复现验证命令。
2. 结构化输出文件清单和关键定位，便于新会话快速接手。

未采纳点与原因：
1. PR 模板/截图要求：本次目标是“会话续接摘要”，不是提交 PR，因此未加入截图与模板段落。
2. issue 自动关闭关键字（如 `Closes #...`）：当前任务不是 issue 驱动流程，暂不引入。
