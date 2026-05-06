---
name: 收敛为稳定版本
description: Use when 需要将模块从 v1/v2 兼容分支收敛到稳定版本，并建立 types 稳定类型、api 原始类型、gateway 映射输出的分层契约。
---

# API Types Global（稳定类型全局收敛）

## Overview

将“版本兼容细节 + 后端原始响应”从业务层剥离，统一下沉到 gateway。  
业务层只依赖稳定网关方法和 `types/` 稳定领域类型，降低接口版本切换与字段抖动风险。

## When to Use

出现以下任一信号时触发：

1. 页面或 Store 直接 import `*.v2.api` / `*.v3.api`。
1. 业务层出现 `if (useV2)` 一类版本分支。
1. 稳定类型散落在 gateway 或页面局部 interface 中。
1. 相同字段映射在多个页面重复实现。

## Target Architecture

1. `src/types/**`：稳定领域类型（唯一定义源）。
1. `src/api/**`：原始请求/响应 DTO（紧贴 Swagger/OpenAPI）。
1. `src/api/gateway/**` 或 `src/gateways/**`：
   - 调用 API；
   - 映射 DTO -> 稳定类型；
   - 对外暴露稳定方法。
1. `src/views|src/store|src/utils|src/directive|src/plugins`：
   - 仅消费 gateway + `types/**`。

## Migration Steps（模块迁移步骤）

1. **识别泄漏点**
   - 扫描业务层 API 直连与版本分支。
1. **抽取稳定类型**
   - 将页面局部 `*Local` 类型上提到 `src/types/<module>.ts`。
1. **保留原始 DTO**
   - `src/api/<domain>/*.api.ts` 只保留协议模型，不掺杂业务别名。
1. **网关新增映射**
   - 在 gateway 新增 `mapRawToStable`，统一归一化（id/status/time）。
1. **替换业务引用**
   - 页面/Store 改为只用 gateway 与稳定类型。
1. **补齐回归测试**
   - 增加网关映射测试与关键页面回归测试。

## Minimal Contract Template

```ts
// src/types/user.ts
export interface UserInfo {
  id: string;
  username: string;
  roleName?: string;
  permissions: string[];
}

// src/api/seccenter/user.v2.api.ts
export interface GetUserResponse {
  user: { id?: string; username?: string; roleName?: string };
  permissions?: string[];
}

// src/api/gateway/user.gateway.ts
function mapDetailToUserInfo(res: GetUserResponse): UserInfo {
  return {
    id: String(res?.user?.id ?? ""),
    username: String(res?.user?.username ?? ""),
    roleName: res?.user?.roleName,
    permissions: Array.isArray(res?.permissions) ? res.permissions : [],
  };
}
```

## Verification

1. 业务层无 API 直连：

```bash
rg --line-number "\.v1\.api|\.v2\.api|\.v3\.api" src/views src/store src/utils src/directive src/plugins
```

1. 业务层无版本分支：

```bash
rg --line-number "VITE_USE_|isV2Enabled|gateway-version-policy|primary|fallback" src/views src/store src/utils src/directive src/plugins
```

1. 稳定类型集中于 `types/`：

```bash
rg --line-number "interface .*Local|type .*Local" src/views src/store
```

1. 类型与测试：

```bash
pnpm -C microfb type-check
pnpm -C apex_dev type-check
```

## Common Mistakes

1. 在 gateway 定义“稳定类型”而不是引用 `types/`，导致重复源。
1. 页面继续保留 `UserInfoLocal` 等临时类型，形成双轨。
1. API 层提前做业务语义命名，和后端字段演进耦合。
1. 映射函数散落在页面而非网关，后续难以统一修复。

## Output Requirement（执行本 Skill 的交付）

1. 给出模块迁移清单：已迁移 / 待迁移 / 风险点。
1. 给出每个模块的“稳定类型文件 + 网关映射文件 + 业务替换文件”清单。
1. 给出可直接执行的验证命令与通过标准。
