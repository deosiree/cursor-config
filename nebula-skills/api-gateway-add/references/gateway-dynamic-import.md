# 通则二：跨 Gateway 动态 import

从各业务样本中抽取，用于破除 `TenantGateway ↔ DeviceGateway` 等**加载期环依赖**。

## 规则

1. **禁止**在 gateway 文件顶层 `import` 其他 `*Gateway`。
2. 仅在**用到**的 gateway 方法体内：

```ts
const { default: DeviceGateway } = await import("@/gateway/device/device.gateway");
await DeviceGateway.unbindAllByTenantId(id);
```

3. 同文件内调用**本对象**其它方法（如 `DeviceGateway.getBind`）仍用 `DeviceGateway.xxx`，无需 dynamic import。
4. `src/api/**` 不受此限；仅 **gateway ↔ gateway**。

## 何时必须

- 两个 gateway 文件互相需要对方能力
- 构建报 circular dependency / 运行时导出为 `undefined`

## GREEN 输出要求

若方案涉及跨域 gateway，清单须列出：

- 删除哪些顶层 `import XxxGateway`
- 在哪些方法内改为 `await import("…")`

## 印证样本

`template/tenant-delete-orchestration/before` → `after`（`f734a7b`）三文件完整 diff。

细则入口：`[[../feature-skills/跨Gateway动态引用/SKILL.md]]`。
