# 权限后门与 Header 诊断

## 先读

- `../../references/perm-bypass-isOwner-pitfalls.md`
- `../../../references/场景-权限与登录态诊断.md`

## 何时使用

- 租户所有者 / `admin@system.local` 仍被 perm 拦截
- 登录后右上角下拉没有「个人中心」
- 怀疑 `isOwner` bypass 或 sessionStorage 与 UI 不一致
- 验证 NavbarActions computed fix 是否生效

## 何时不要使用

- 仅用户表操作列问题 → `操作列权限诊断`
- 无 Chrome / OpenCLI → 先 `opencli doctor`
- 纯改菜单 YAML / 角色模板 → 不必开浏览器

## 步骤

### 1. 预检

```bash
opencli doctor
opencli browser nebula-ux open "http://localhost:8080/cloud/login"
```

### 2. 登录（ref 来自 state）

```bash
opencli browser nebula-ux state
opencli browser nebula-ux type <账号ref> "admin@system.local"
opencli browser nebula-ux type <密码ref> "123456"
opencli browser nebula-ux click "button:has(span)" --nth 0
```

等待 3–5s，**禁止** `location.reload()`。

### 3. session + bypass 断言

执行 `场景-权限与登录态诊断.md` §3 的 eval，确认：

- `isOwnerStrict: true`
- `tests.sys:profile:view: true`

### 4. Header 下拉（fix 验收）

执行 `场景-权限与登录态诊断.md` §5，确认 `profileVisible: true`。

### 5. 可选负向

删 `isOwner` → reload → 子应用首页「暂无权限查看首页」。

### 6. 单元测试（无浏览器）

```powershell
cd apex_dev
npm test -- src/directive/__tests__/hasPerm.test.ts
```

## 输出契约

| 字段 | 说明 |
|------|------|
| `isOwnerStrict` | 是否可走 bypass |
| `tests` | 关键 perm 模拟结果 |
| `profileVisible` | 登录后未 reload 时下拉是否含个人中心 |
| `failures[]` | 对照 perm-bypass-isOwner-pitfalls.md |

## 关联会话

- `../../../session-log/2026-06-02-perm-bypass-isOwner-header.md`
