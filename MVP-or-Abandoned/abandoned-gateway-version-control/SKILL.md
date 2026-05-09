---
name: 收敛到 Gateway 统一版本策略（已弃用）
description: Use when 需要把 v1/v2/v3 混用 API 收敛到 Gateway 统一版本策略（主版本 + 失败降级链），并清理业务层的版本分支与直连调用。
---

# Gateway Version Control（版本主路由与降级链）

## Overview
将 API 版本选择统一收敛到 `src/gateway/*`，业务层（`views/store/utils/directive`）只引用 Gateway，不直接读环境变量，不直接引用 `*.v2.api/*.v3.api`。

核心原则：
1. 单一事实来源：版本策略只在 `gateway-version-policy.ts` 读取。
2. 业务层零分支：页面/状态/工具层不做 v1/v2 分支。
3. 网关内兼容：网关负责参数映射、DTO 映射、失败降级。
4. 策略可演进：支持 `v2 -> v1`，也支持未来 `v3 -> v2 -> v1`。
5. 调试可追踪：版本命中与降级原因有统一日志。

## When to Use
在以下任一场景触发：
1. 同一模块同时存在 `v1/v2` 或 `v2/v3` API 文件。
2. `views/store/utils/directive` 中出现版本判断或 env 分支。
3. 页面/Store 直接 import `*.v2.api/*.v3.api`。
4. 需要统一实现“默认允许版本 + 失败降级链”。

## Target State
1. `src/gateway/gateway-version-policy.ts` 是唯一版本策略入口。
2. 每个业务模块有对应 `*.gateway.ts`（如 `user/menu/auth/role/config`）。
3. 业务层仅引用 Gateway。
4. `src/views` 内无 `*.v2.api/*.v3.api` 直连、无版本 env 分支。

## Version Policy Contract
1. 统一 env 命名
- `VITE_GATEWAY_<MODULE>_PRIMARY=v1|v2|v3`
- `VITE_GATEWAY_<MODULE>_FALLBACK=v2,v1`（逗号分隔，允许空）

2. 统一策略模型
```ts
type ApiVersion = "v1" | "v2" | "v3";
interface ModuleVersionPolicy {
  primary: ApiVersion;
  fallback: ApiVersion[];
}
```

3. 默认策略示例
- auth: `primary=v2`, `fallback=[v1]`
- menu: `primary=v2`, `fallback=[v1]`
- user: `primary=v2`, `fallback=[v1]`
- role: `primary=v2`, `fallback=[v1]`
- 未来切换到 v3：`primary=v3`, `fallback=[v2,v1]`

4. 兼容旧变量（过渡期）
- 若未配置新变量，可回退读取旧布尔开关（如 `VITE_USE_SECCENTER_V2_*`）。
- 兼容期结束后删除旧变量解析逻辑。

## Implementation Steps
1. 新增策略中心 `gateway-version-policy.ts`
- 负责读取 env、合并默认值、输出 `getModulePolicy(module)`。
- 输出 `getExecutionOrder(module)`，返回 `[primary, ...fallback]` 去重后的顺序。

2. 新增统一执行器 `gateway-executor.ts`
- 入参：模块名、方法名、版本实现映射、请求参数。
- 按执行顺序依次尝试，成功即返回。
- 失败记录统一日志：模块、方法、当前版本、错误摘要、是否进入下一跳。

3. 按模块收敛 Gateway
- 建议模块：`auth/menu/user/role/device/tenant`。
- 每个网关只维护：
  1. `versions` 实现表（v1/v2/v3）
  2. 参数映射
  3. DTO 映射
- 业务层不得出现版本判断。

4. 业务层替换与收口
- `views/store/utils/directive/plugins` 仅保留 Gateway import。
- 删除 `if (useV2) ... else ...` 逻辑。
- 删除直接读取版本 env 的代码。

5. 注释规范补齐
- 所有新增/修改函数补齐职责、`@param`、`@returns`。

## JSDoc Template
```ts
/**
 * 功能职责一句话。
 *
 * @param input 参数说明
 * @returns 返回说明
 */
function fn(input: X): Y { ... }
```

## Verification Checklist
1. 检索业务层直连与版本 env 分支：
```bash
rg --line-number "import\.meta\.env\.VITE_USE_SECCENTER|\.v2\.api|\.v3\.api" src/views src/store src/utils src/directive src/plugins
```
- 期望：无命中（允许 `src/gateway` 内部命中）。

2. 检索策略中心是否唯一：
```bash
rg --line-number "VITE_GATEWAY_.*_PRIMARY|VITE_GATEWAY_.*_FALLBACK" src
```
- 期望：仅在 `src/gateway/gateway-version-policy.ts` 命中（以及测试文件）。

3. 类型检查：
```bash
npm run type-check
```
- 期望：通过。

4. 若项目有单测，补充网关分流测试：
- `primary=v2,fallback=v1` 命中顺序正确。
- `primary=v3,fallback=v2,v1` 命中顺序正确。
- 当前版本失败会进入下一跳，全部失败才抛错。

## Common Mistakes
1. 把版本策略散落在多个 gateway 文件，导致行为不一致。
2. 仅处理 `v2 -> v1`，没有抽象到任意版本链。
3. gateway 直接透传高版本 DTO，业务层被迫改字段。
4. 日志无模块名/方法名，调试时无法定位降级发生点。
5. 兼容旧 env 后未规划移除时间，技术债长期滞留。

## Quick Commands
```bash
# 发现业务层版本泄漏
rg --line-number "VITE_USE_SECCENTER|VITE_GATEWAY_.*(PRIMARY|FALLBACK)|\.v2\.api|\.v3\.api" src/views src/store src/utils src/directive src/plugins

# 网关文件总览
rg --files src/gateway

# 编译验证
npm run type-check
```
