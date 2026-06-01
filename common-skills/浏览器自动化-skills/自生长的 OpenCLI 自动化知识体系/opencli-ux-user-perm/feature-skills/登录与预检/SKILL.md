# 登录与预检

## 前置

- `opencli doctor` 通过
- `config/ux-test.config.local.json` 已填密码（勿提交仓库）

## 步骤

### 1. 打开登录页

```powershell
opencli browser user0601 open http://localhost:8080/cloud/login
```

### 2. 填表登录（eval）

Vue 表单须触发 `InputEvent`：

```javascript
(function loginEval(account, password) {
  function setInput(el, v) {
    el.value = v;
    el.dispatchEvent(new InputEvent('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const inputs = [...document.querySelectorAll('input')];
  const user = inputs.find(i => /用户|账号|邮箱|手机/.test(i.placeholder || ''));
  const pwd = inputs.find(i => i.type === 'password');
  setInput(user, account);
  setInput(pwd, password);
  const btn = [...document.querySelectorAll('button')].find(b => /登录|登 录/.test(b.textContent));
  btn && btn.click();
  return 'clicked';
})('user0601v2@qq.com', 'YOUR_PASSWORD')
```

### 3. 绑定会话（推荐）

人工或自动登录成功后：

```powershell
opencli browser user0601 bind
```

### 4. 进入用户页

```powershell
opencli browser user0601 open http://localhost:8080/cloud/Apex/system/user
```

**禁止**在 eval 内 `location.href = ...`（会断 CDP）。

### 5. 预检 perm

```javascript
(() => {
  const me = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
  const perms = (me.permissions || me.perms || []).filter(p => p.startsWith('sys:user:'));
  return JSON.stringify({ userName: me.userName, isOwner: me.isOwner, perms });
})()
```

缺少 `sys:user:add` 时：**API 创建仍可**（若有 create 接口权限），但 UI「新增」不可见。

## 输出

- `sessionUser` / `userPerms[]`
- 是否已 bind
