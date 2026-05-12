# MVP Sample 04

## 标题
仓库已存在 `handleApiError` 时，复用现成 helper 并上收为 `handleGatewayError`

## 适用场景
- 仓库里已经有错误提示 helper，例如 `handleApiError`
- gateway / view 多层都在 `catch` 后端错误，存在重复弹窗风险
- 希望把“提示职责”上收至 gateway，把 view 层退化为只消费异常控制流

## 历史来源
- staged changes from `apex_dev`
- 关键文件：
  - `src/utils/notification.ts`
  - `src/gateway/system/menu/menu.gateway.ts`
  - `src/views/system/menu/components/*`
  - `src/views/system/menu/index.vue`

## 说明
这个样本不是“新增 `showNotificationError`”。

它证明的是另一条稳定模式：

- 仓库已有等价 helper：`handleApiError`
- 新需求应优先复用现成 helper
- 若某领域存在大量重复 `try/catch + helper + throw`，可以再包装成 `handleGatewayError`

因此，`showNotificationError` 在本 skill 里只是模式名，不是硬编码函数名。

## 先看这个
先消费这组最小结论，再决定是否下钻 before/after：

```ts
export async function handleGatewayError<T>(action: () => Promise<T>, defaultMsg = "操作失败") {
  try {
    return await action();
  } catch (error) {
    handleApiError(error, defaultMsg);
    throw error;
  }
}
```

```ts
return handleGatewayError(() => MenuV2API.create(payload), "新增失败");
```

```ts
try {
  await MenuGateway.create(submitData);
  showNotification("新增成功", { type: "success" });
} catch {
  return;
}
```

## 只关注的最小片段
- `src/utils/notification.ts`
  在已有 `handleApiError` 基础上新增 `handleGatewayError`
- `src/gateway/system/menu/menu.gateway.ts`
  统一用 `handleGatewayError` 包装菜单读写接口
- `src/views/system/menu/components/MenuFormDialog.vue`
  从 `catch + handleApiError` 改成 `async/await` 只消费异常控制流
- `src/views/system/menu/components/PermissionConfigDialog.vue`
  去掉空 `catch`，保留 `try/catch/finally` 的 loading 收口

## before

### `src/views/system/menu/components/MenuFormDialog.vue`

```ts
MenuGateway.create(submitData)
  .then(() => {
    showNotification("新增成功", { type: "success" });
    handleClose();
    emit("success");
  })
  .catch((e: any) => {
    handleApiError(e, "路由路径已存在，新增失败");
  });
```

### `src/gateway/system/menu/menu.gateway.ts`

```ts
async create(data: MenuForm) {
  const payload = mapMenuFormToV2Payload(data);
  return MenuV2API.create(payload);
}
```

## after

### `src/utils/notification.ts`

```ts
export async function handleGatewayError<T>(
  action: () => Promise<T>,
  defaultMsg: string = "操作失败"
): Promise<T> {
  try {
    return await action();
  } catch (error) {
    handleApiError(error, defaultMsg);
    throw error;
  }
}
```

### `src/gateway/system/menu/menu.gateway.ts`

```ts
async create(data: MenuForm) {
  return handleGatewayError(() => {
    const payload = mapMenuFormToV2Payload(data);
    return MenuV2API.create(payload);
  }, "新增失败");
}
```

### `src/views/system/menu/components/MenuFormDialog.vue`

```ts
try {
  await MenuGateway.create(submitData);
  showNotification("新增成功", { type: "success" });
  handleClose();
  emit("success");
} catch {
  return;
}
```

## 修改要点
- 不新增第二个与 `handleApiError` 等价的 helper 名称
- 复用现成 helper，再在网关层新增 `handleGatewayError`
- view 层不再重复提示后端错误，只做成功提示、阻断和 loading 收口
- 重复弹窗治理优先靠边界，不靠 helper 黑盒消重

## 这个样本证明什么
- `showNotificationError` 是模式锚点，不是唯一合法函数名
- 发现现成 helper 时，优先复用比引入新名字更重要
- 当一个领域里有大量重复错误提示时，适合从 helper 再上提到网关包装器
- view 层的 `try/catch` 不是为了提示错误，而是为了消费异常控制流

## 这个样本不证明什么
- 不证明所有仓库都必须新增 `handleGatewayError`
- 不证明所有已有 helper 都能直接复用
- 不讨论国际化、埋点、自动去重标记
