# 通则一：原子 gateway 与集成 gateway（错误通知）

本 skill 从各业务样本中抽取的**跨模块通用规则**。租户删除、菜单导出、多 API 编排等均适用。

## 1. 定义

| 类型 | 判定 | 源码特征 |
|------|------|----------|
| **原子 gateway** | 方法职责是**一次**对 `src/api/**` 的调用（可含 wire/stable 映射） | 通常 `return handleGatewayError(() => XxxAPI.method(...), "…")` |
| **集成 gateway** | 编排多个**原子 gateway 方法**，或「先编排再调用一次 api」 | 方法体为多个 `await`，**不对整段**包 `handleGatewayError` |

**注意**：「原子」指**错误通知边界**，不是「只能有一行代码」。`exportMenuTree` 内一次 `MenuV2API.exportTree` 仍是原子。

## 2. 通则（强制）

1. **仅原子 gateway** 使用 `handleGatewayError`，失败时 toast **一次**。
2. **集成 gateway 禁止**用 `handleGatewayError` 包裹整个方法体。
3. 集成 gateway **调用其他 gateway 的原子方法**时，直接 `await`，**禁止**再套 `handleGatewayError`（否则双 toast）。
4. 集成 gateway 若**直接**调用 `XxxAPI`（绕过 gateway）：
   - **优先**：抽成原子 gateway 方法并包 `handleGatewayError`；
   - **禁止**：在集成方法外包整段 `handleGatewayError`，同时内部原子方法也已包。

## 3. 三种合法形态

### 3.1 集成 → 多个原子 gateway

```ts
// 集成：无 handleGatewayError
async unbindAllByTenantId(tenantId: string) {
  const bindRes = await DeviceGateway.getBind(tenantId);       // 原子，已包
  await DeviceGateway.deviceActivate({ tenantId, ... });       // 原子，已包
}

// 集成：仅「最后一步单次 api」可包一层
async deleteV2(id: string) {
  await DeviceGateway.unbindAllByTenantId(id);
  return handleGatewayError(() => TenantAPI.deleteV2(id), "删除租户失败");
}
```

### 3.2 单原子 gateway（最常见新增接口）

```ts
async exportMenuTree(query: MenuExportQuery) {
  return handleGatewayError(async () => {
    const data = await MenuV2API.exportTree(mapStable2Wire(query));
    return mapWire2StableExport(data);
  }, "导出失败");
}
```

### 3.3 集成内循环调用原子 gateway（多项目导出等）

```ts
// 集成：无 handleGatewayError
async exportMenuTreesByProjectIds(projectIds: string[]) {
  const blobs = [];
  for (const id of projectIds) {
    const one = await MenuGateway.exportMenuTree({ projectId: id }); // 每次失败由原子层通知并中断
    blobs.push(one);
  }
  return zipBlobs(blobs);
}
```

## 4. 反例

```ts
// 错误：集成包整段，内部原子 gateway 也已包 → 双 toast
async deleteV2(id: string) {
  return handleGatewayError(async () => {
    await DeviceGateway.unbindAllByTenantId(id);
    return TenantAPI.deleteV2(id);
  }, "删除租户失败");
}

// 错误：集成内直接 DeviceAPI.get 且外层又包 handleGatewayError
async doSomething() {
  return handleGatewayError(async () => {
    const r = await DeviceAPI.get({ ... });
    await OtherGateway.foo();
    return r;
  }, "失败");
}
```

## 5. GREEN 输出要求

gateway 四层清单中，每个新方法须标注：

- **原子 / 集成**
- **哪些行**使用 `handleGatewayError`（精确到「仅包裹哪一次 `XxxAPI` 调用」）

## 6. 印证样本（非专用逻辑）

| 样本 | 印证通则 |
|------|----------|
| `template/tenant-delete-orchestration/` | 通则 1：集成 `unbindAll` + 原子 `getBind`/`deviceActivate` + 删除仅包 `TenantAPI` |
| `menu.gateway` 现有 `exportMenuTree` | 通则 1：单原子 |
| 多项目菜单导出（设计态） | 通则 1：集成循环调用 `exportMenuTree` |

错误 helper 协议见 `[[../../shownotification/SKILL.md]]`。
