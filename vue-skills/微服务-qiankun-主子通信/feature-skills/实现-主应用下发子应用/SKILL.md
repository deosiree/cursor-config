---
name: 实现-主应用下发子应用
description: 主应用通过 getAppProps/setMicroAppProps 向 qiankun 子应用下发 userInfo/menu 等。Use when getAppProps、setMicroAppProps、主应用下发子应用、登录后子应用无 userInfo。
---

# 实现-主应用下发子应用

## 何时使用

- 子应用 **mount/update** 时 userInfo/menu 不对
- 登录后主应用有数据，子应用仍空
- 运行时联动已满足，仅需补齐初始 props

## 何时不要使用

- 子应用内用户操作后主应用 UI 需即时更新 → 子→主 [[实现-子应用发通知]]
- 同页已 mount 但 Navbar 不更新 → notify + sideEffect，不是 props

## 输入契约

| 字段 | 说明 |
|---|---|
| `hostRepo` | 主应用路径 |
| `childRepo` | 子应用路径 |
| `propsKeys[]` | 如 userInfo, menuList, menuVersion |

## 选型：props vs notify

| 场景 | 用 props | 用 notify |
|---|---|---|
| 登录后首次 mount | ✅ getAppProps | ❌ |
| 主应用改 menu 版本 | ✅ setMicroAppProps | 可选 |
| 子应用内改用户名 | ❌ | ✅ notifyMainApp |
| 子应用切换电站 | ❌ | ✅ customEvent 链 |

## getAppProps（动态读 Storage）

```typescript
// microfb/src/plugins/qiankun/apps.ts
export const getAppProps = (appName: string, routerBase: string) => {
  const rawUserInfo = Storage.get<UserInfo | null>(USER_INFO_STORAGE_KEY, null);
  const currentUserInfo = rawUserInfo ?? null;

  return {
    setGlobalState: (state) => actions.setGlobalState(state),
    onGlobalStateChange: (cb, fireImmediately) =>
      registerSubAppGlobalListener(appName, cb, fireImmediately),
    userInfo: currentUserInfo,
    menuList: readMenuCache().menus,
    menuVersion: getMenuVersion(),
    routerBase,
  };
};
```

## 登录后 setMicroAppProps

```typescript
const sharedProps = { menuVersion: getMenuVersion(), userInfo: userInfo.value };
appConfigs.forEach((app) => setMicroAppProps(app.name, sharedProps));
```

## 子应用消费（mount 时 sync）

```typescript
function syncUserInfoFromHost(props: QiankunProps) {
  const incoming = props?.userInfo;
  if (!incoming) return;
  Storage.set("userInfo", { ...incoming, userId: incoming.userId ?? incoming.id });
}
```

## 检查清单

- [ ] getAppProps 与子应用 store 均使用 `username` 字段
- [ ] loginAfterAuth 调用 setMicroAppProps
- [ ] 子应用 mount/update 生命周期读取 props

## 失败分支

| 现象 | 处理 |
|---|---|
| mount 有数据，操作后主应用不更新 | 补子→主 notify，非 props |
| props userInfo 空 | 查主应用 Storage key 与 getAppProps 读取 |
| 子应用未 sync props | 查 lifecycle mount 是否调用 syncUserInfoFromHost |

## 使用示例

```text
登录后子应用要拿到最新 userInfo，检查 getAppProps 与 loginAfterAuth 里 setMicroAppProps。
参考 nebula/microfb/src/plugins/qiankun/apps.ts。
```
