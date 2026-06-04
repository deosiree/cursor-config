# should-not-trigger — 不应触发本 skill 的场景

## 角色管理与其他 skill 混淆

```text
用户: "帮我看看角色管理页面的权限配置问题"
→ 不应触发。仅 Tab 校验问题触发此 skill，权限配置属于业务逻辑。
```

## 只改源码不需浏览器验证

```text
用户: "修改 useTabValidation.ts 的校验逻辑"
→ 不应触发。改源码用单元测试验证，不需要 OpenCLI。
```

## 非角色管理场景

```text
用户: "测一下租户创建 - 同样的弹窗 Tab 问题"
→ 不应触发。租户场景走 opencli-ux-tenant，即使 UI 类似也分开治理。
```

## 用户管理 / 菜单管理

```text
用户: "帮我在用户列表创建几个种子用户"
→ 不应触发。走 opencli-ux-user-perm。
```

```text
用户: "验证菜单路由路径是否重复"
→ 不应触发。走 opencli-ux-menu。
```

## 无浏览器环境

```text
用户: "在 CI 上跑角色 Tab 测试"
→ 不应触发。本 skill 依赖本地 Chrome + OpenCLI 扩展，不适合 CI。
```
