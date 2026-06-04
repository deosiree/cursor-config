---
name: 双会话OpenCLI环境初始化
description: 首次搭建 OpenCLI 双 profile 环境：预检、双登录、sessionStorage 清理。单轮策略见 OpenCLI双会话；菜单8场景见菜单管理功能项依赖链验证。触发词：opencli环境初始化、双profile、chrome双用户。
---

# 双会话OpenCLI环境初始化

## TL;DR

**仅环境首次搭建时用**。后续单轮验证 → `[[../OpenCLI双会话权限验证]]`；菜单 8 场景 → `[[../菜单管理功能项依赖链验证]]`（node 脚本已内联 login/logout）。

> session 名：示例可用 `admin-session`/`test-session`；**本项目 E2E 脚本统一用 `admin`/`test`**。隔离靠 `--profile`，不靠 session 名。

## RED

- 没有本 skill 时，容易把 admin 和 test 用户放在同一 Chrome profile 下导致 Cookie 共享
- 忘记 `--profile` 全局 flag → 两个 session 共用 cookie，只能登录同一用户
- 跳过 `sessionStorage.clear()` → test 用户读到旧 `userInfo` / `permsMap`，结果不可信
- admin 保存角色后立即切 test 用户验证 → 权限未同步

## 输入

- `admin profile`：必填（Chrome profile 名）
- `test profile`：必填（Chrome profile 名）
- `admin 凭据`：默认 `admin@system.local / 123456`
- `test 凭据`：默认 `13813815913 / 123456`
- `targetUrl`：默认 `http://localhost:8080`

## GREEN

### 1. 预检

```bash
opencli profile list
```

确保至少 2 个 Chrome profile 已连接。若只有 1 个 → 提示用户去 Chrome 设置添加用户。

### 2. 初始化双会话

```bash
opencli --profile <admin-profile> browser admin open <targetUrl>/cloud/login
opencli --profile <test-profile> browser test open <targetUrl>/cloud/login
```

> **关键：** 永远用 `--profile <name>` 区分用户。session 名（admin/test）只是 tab 标签。

### 3. Admin 登录

```bash
opencli --profile <admin-profile> browser admin fill --role textbox --name 手机号/邮箱地址 "admin@system.local"
opencli --profile <admin-profile> browser admin fill --role textbox --name 密码 "123456"
opencli --profile <admin-profile> browser admin click --role button --name 登录
```

### 4. Test 用户登录

```bash
opencli --profile <test-profile> browser test eval "sessionStorage.clear();localStorage.clear();"
opencli --profile <test-profile> browser test fill --role textbox --name 手机号/邮箱地址 "13813815913"
opencli --profile <test-profile> browser test fill --role textbox --name 密码 "123456"
opencli --profile <test-profile> browser test click --role button --name 登录
```

### 5. 每轮验证前：退出重登

完整 logout 流程见 `[[../OpenCLI双会话权限验证]]` §2b（菜单 E2E 脚本已内联，一般无需手操）。

### 6. 保存后等待

```bash
opencli --profile <admin-profile> browser admin wait time 3
```

## 输出

- 两个活跃 browser session（admin + test），分属不同 profile

## REFACTOR

- sessionStorage 残留 → 切 test 前必须 clear
- 单 profile → 停止并提示用户新建 Chrome 用户
- admin 跳 about:blank → 重开 role 管理 URL
