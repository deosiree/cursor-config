---
name: gateway-version-control
description: Use when migrating mixed v1/v2 API usage to a gateway-controlled version selection model, replacing direct API/env branching in views/store/utils/directive with gateway imports and enforcing complete function-level JSDoc comments.
---

# Gateway Version Control

## Overview
将 API 版本选择统一收敛到 `src/api/gateway/*`，业务层（`views/store/utils/directive`）只引用 Gateway，不直接读 `import.meta.env.VITE_USE_SECCENTER_V2_*`，不直接引用 `*.v2.api`。

核心原则：
1. 单一事实来源：版本开关只在 `gateway-flags.ts` 读取。
2. 业务层零分支：页面/状态/工具层不做 v1/v2 分支。
3. 网关内兼容：网关负责参数映射、DTO 映射、失败回退。
4. 注释完整：新增/修改函数必须写职责、`@param`、`@returns`。

## When to Use
在以下任一场景触发：
1. 同一模块同时存在 `api/system/*.api.ts`（v1）和 `api/seccenter/*.v2.api.ts`（v2）。
2. `views/store/utils/directive` 中出现 `VITE_USE_SECCENTER_V2_*` 分支。
3. 页面/Store 直接 import `*.v2.api`。
4. 需要支持 v2 失败自动回退 v1。

## Target State
1. `src/api/gateway/gateway-flags.ts` 是唯一开关读取入口。
2. 每个业务模块有对应 `*.gateway.ts`（如 `user/menu/auth/role/config`）。
3. 业务层仅引用 Gateway。
4. `src/views` 内无 `*.v2.api` 直连、无 `import.meta.env.VITE_USE_SECCENTER_V2_*`。

## Implementation Steps
1. 新增/扩展 `gateway-flags.ts`
- 维护 `V2Module` 联合类型。
- 新增 `isV2Enabled(module)` 并写函数级 JSDoc。

2. 为模块创建网关文件
- 建议路径：`src/api/gateway/<module>.gateway.ts`。
- 网关方法命名与业务语义一致（如 `getPage/create/update/deleteById`）。
- 每个方法内部模式：
```ts
if (!isV2Enabled('module')) return V1Api.xxx(...)
try {
  return await V2Api.xxx(...)
} catch {
  return V1Api.xxx(...)
}
```

3. 做 DTO 与参数映射
- v1 -> v2：请求字段转换（命名、类型、枚举）。
- v2 -> 业务层：返回结构统一为业务层现有 DTO。
- 所有映射函数写 JSDoc。

4. 业务层替换引用
- 替换 `views/store/utils/directive` 中 `V1Api/V2Api` 直连为 `Gateway`。
- 删除业务层 env 分支，改为直接调用 Gateway。
- 可复用工具（如权限后门）集中到 `utils` 单点实现，避免重复逻辑。

5. config 模块特殊处理
- 若 v1 是键值配置接口（如 `api/system/config.api.ts`），需在 `config.gateway.ts` 内维护键映射表，将键值对组装成安全配置对象，并支持回写。

6. 注释规范补齐
- 所有新增/修改函数必须包含：
  1. 职责说明
  2. `@param`
  3. `@returns`
- 网关对象本身补对象级职责注释（例如“v1/v2 自动选路 + 回退”）。

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
1. 检索业务层直连与 env 分支：
```bash
rg --line-number "import\.meta\.env\.VITE_USE_SECCENTER_V2_|\.v2\.api" src/views src/store src/utils src/directive
```
- 期望：无命中（允许 `src/api/gateway` 内部命中）。

2. 类型检查：
```bash
npm run type-check
```
- 期望：通过。

3. 若项目有单测，补充网关分流测试：
- 开关 `true/false` 下分别命中 v2/v1。
- v2 异常时回退 v1。

## Common Mistakes
1. 只改页面，不改 Store/Utils/Directive，导致残留分支。
2. Gateway 内直接透传 v2 DTO，业务层被迫改大量字段。
3. `try/catch` 中漏 `await`，导致本层捕获不到异步错误。
4. 注释缺失或只写“做了什么”，未写参数和返回语义。
5. `config` 模块误以为只有 v2，忽略 v1 键值配置兼容。

## Quick Commands
```bash
# 发现混合点
rg --line-number "VITE_USE_SECCENTER_V2_|\.v2\.api" src/views src/store src/utils src/directive

# 网关文件总览
rg --files src/api/gateway

# 编译验证
npm run type-check
```

