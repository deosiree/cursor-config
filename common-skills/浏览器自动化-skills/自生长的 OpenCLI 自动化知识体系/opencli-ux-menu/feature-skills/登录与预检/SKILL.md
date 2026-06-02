# 登录与预检（菜单场景）

## 两条入口

| 入口 | URL | profile | 说明 |
|------|-----|---------|------|
| **子应用直连（推荐）** | `http://localhost:8081/cloud/Apex/system/menu` | `local-subapp` | `authMode: none`，本次 OpenCLI 实测稳定 |
| **基座登录** | `http://localhost:8080/cloud/login` → 菜单 | `local` | 需 Cookie；自动登录易误点按钮 |

## 基座登录（8080）

### 1. 优先 login-submit-btn

`click --role button --name "登录"` 可能点到**语言菜单**等同名 button。

```bash
# login.sh / lib/common.sh 已封装
click_login_submit
```

或 eval：

```javascript
document.querySelector('button.login-submit-btn')?.click()
```

### 2. bind 模式（人工登录后）

```powershell
# 1. 手动 Chrome 打开 http://localhost:8080/cloud/login 并登录
# 2. 保持该标签激活
opencli browser nebula-menu-ux bind
opencli browser nebula-menu-ux open http://localhost:8080/cloud/Apex/system/menu
```

### 3. 禁止

- eval 内 `location.href = ...` 跳转（易断 CDP）
- 未离开 `/login` 就断言菜单页元素

## 子应用（8081）预检

```powershell
opencli browser nebula-ux open http://localhost:8081/cloud/Apex/system/menu
opencli browser nebula-ux wait text "菜单列表" --timeout 20000
opencli browser nebula-ux eval "document.querySelector('.project-select') ? 'ok' : 'no-project-select'"
```

## 账号

- 默认：`admin@system.local` / `123456`（与 tenant/user-perm 一致）
- Session：`nebula-menu-ux`（**勿**与 `nebula-ux` 混用，见 `config.sessionName`）

## 输出

- 当前 URL 不含 `/login`
- 页面出现「菜单列表」+ 项目下拉
