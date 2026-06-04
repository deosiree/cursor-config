# OpenCLI 验证流程

## 环境准备

1. SSH 到目标环境
2. 确认 targetUrl 可访问（默认 `http://localhost:8080`）
3. 准备测试账号凭据

## 验证检查项

### 1. Bypass 验证

```js
// 正面：isOwner=true 时绕过所有 perm
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
console.log('isOwner:', ui?.isOwner, typeof ui?.isOwner);
// 预期：true (boolean)

// 执行 checkHasPerm
checkHasPerm('sys:dashboard:view');
// 预期：true
```

```js
// 负面：模拟 isOwner 丢失后应被拦截
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
delete ui.isOwner;
sessionStorage.setItem('userInfo', JSON.stringify(ui));
// 刷新页面 → 预期：页面被拦截
```

### 2. Header 显隐

- 登录后**不要 `reload()`**
- 点击右上角用户下拉
- 检查「个人中心」是否可见
- 检查「退出登录」分隔线是否正确

### 3. 页面守卫

- 直接访问受保护路由（如 `/Apex/dashboard`）
- 无 perm 时应显示拦截提示
- 有 perm 时应正常渲染

### 4. sessionStorage 字段

```js
const ui = JSON.parse(sessionStorage.getItem('userInfo'));
// 应包含：isOwner, permissions, username, id
```

### 5. 负向测试

- 模拟 perm 缺失 → 对应功能不显示/不可点击
- 模拟 isOwner=false → bypass 失效，走角色 perm

## 验证报告模板

| 检查项 | 步骤 | 预期 | 实际 | 通过 |
|--------|------|------|------|------|
| bypass 生效 | 登录后 checkHasPerm | true | <实际> | ✅/❌ |
| bypass 失效 | 模拟 isOwner 丢失 | false | <实际> | ✅/❌ |
| Header 显隐 | 登录后下拉菜单 | 个人中心可见 | <实际> | ✅/❌ |
| 页面守卫 | 访问受保护路由 | 拦截提示 | <实际> | ✅/❌ |

## 关键注意事项

- **登录后不要 reload()**：验证 computed 是否响应式更新
- **检查 sessionStorage** 而非 Pinia store：`checkHasPerm` 直接读 sessionStorage
- **区分基座和子应用**：Header 在 microfb，页面守卫在 apex
- **qiankun 环境**：子应用在登录后 mount，与基座生命周期不同
