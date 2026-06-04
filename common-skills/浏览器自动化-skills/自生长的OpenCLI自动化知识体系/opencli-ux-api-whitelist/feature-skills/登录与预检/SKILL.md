# 登录与预检

## 默认

见知识体系根目录 `../../../references/opencli-默认会话与登录约定.md`。

- URL：`http://localhost:8080/cloud/login`
- 账号：`admin@system.local` / `123456`
- `opencli --profile p2ejw7ww browser p2ejw7ww`

## 推荐：BindOnly

用户已在 p2ejw7ww Chrome 登录后：

```powershell
opencli --profile p2ejw7ww browser p2ejw7ww bind
```

## 自动登录 eval

`scripts/opencli-login-admin-eval-oneline.js`（易卡验证码，非首选）。

## 预检

```bash
opencli doctor
opencli --profile p2ejw7ww browser p2ejw7ww get url
# 应含 localhost:8080 且非 /login
```
