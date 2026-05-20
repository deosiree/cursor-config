# 网关编排与跨域引用（细则）

编排类需求的补充细则。**通则一、通则二**以 `[[gateway-atomic-vs-integration.md]]`、`[[gateway-dynamic-import.md]]` 为准。

主流程见 `[[../SKILL.md]]`；功能入口见 `[[../feature-skills]]`。

## 1. 编排 vs 纯新增 API

| 场景 | 典型动作 | 是否必读契约新接口 |
|------|----------|-------------------|
| 纯新增 API | 补 `api/types/gateway` 新方法 | 是 |
| 编排既有 API | 组合 `getBind` + `deviceActivate` + `deleteV2` | 否（除非缺接口） |

编排类 GREEN 方案输出后，涉及删除/解绑等写操作时，须待用户确认再改码（见 `[[../feature-skills/网关原子与集成错误分层/SKILL.md]]` 人类检查点）。

编排仍须输出 GREEN 六段，但 gateway 清单区分**原子**与**集成**。

## 2. handleGatewayError 分层

全文见 `[[gateway-atomic-vs-integration.md]]`。与 `[[../../shownotification/SKILL.md]]` 分工：

- **shownotification**：helper 实现与业务错误协议
- **通则一**：gateway **哪一层**包 helper（原子 vs 集成；集成内直接调 api 的处理）

### 租户删除样本（apex_dev `f734a7b`）

| 调用 | 类型 | handleGatewayError |
|------|------|-------------------|
| `DeviceGateway.getBind` | 原子 | 有 |
| `DeviceGateway.deviceActivate` | 原子 | 有 |
| `DeviceGateway.unbindAllByTenantId` | 集成 | 无 |
| `TenantGateway.deleteV2` 中解绑段 | 集成 | 无 |
| `TenantAPI.deleteV2` | 原子 | 有（仅包裹此调用） |

源码：

- before：`template/tenant-delete-orchestration/before/src/gateway/**`
- after：`template/tenant-delete-orchestration/after/src/gateway/**`

关键 after 落点：

- `device.gateway.ts`：`unbindAllByTenantId`（约 L70+）、`getBind`、`deviceActivate`
- `tenant.gateway.ts`：`deleteV2`（约 L303–308）

## 3. 跨 Gateway 动态 import

细则见 `[[../feature-skills/跨Gateway动态引用/SKILL.md]]`。

before 典型问题：`device.gateway.ts` 静态 `import TenantGateway`；`tenant.gateway.ts` 静态 `import ProjectGateway`。

after：仅在方法体内 `await import("@/gateway/...")`。

## 4. 业务层边界

编排完成后，业务层仍只调**一个**集成入口（如 `TenantGateway.deleteV2`），不在页面串联 `getBind` + `deviceActivate` + `delete`。

确认文案与网关行为一致（本案例 `index.vue` 删除确认框）。

## 5. 部分成功态与失败顺序

多步编排须按**失败点**写清状态，并在 GREEN「风险点」中体现：

| 失败发生在 | 租户 | 设备绑定 | 典型提示（原子层） | 后续 |
|------------|------|----------|-------------------|------|
| `getBind` | 未删除 | 保持原状 | 加载租户已绑定设备失败 | **停止**，不调用解绑/删除 |
| `deviceActivate` | 未删除 | 保持原状 | 设备绑定/解绑失败 | **停止**，不调用 `TenantAPI.deleteV2` |
| `TenantAPI.deleteV2` | 未删除 | **已解绑** | 删除租户失败 | 部分成功；刷新列表；默认**不**自动回绑（除非产品明确要求补偿） |

设计输出须写明：业务层在 `deleteV2` 失败后是否只提示删除失败、是否需二次确认重试删除。

## 6. 风险与不做项

- 不在集成方法内为「整段流程」再包 `handleGatewayError`
- 不为破除环依赖而在业务层直接 `import` 多个 gateway
- 编排不等于新增契约类型；无必要不新增 `src/api` 方法
- 部分成功态下勿在集成方法内「静默吞掉」解绑已生效的事实
