# Profile 配置指南

## 内置 Profile 总览

| Profile | baseUrl | 默认账号 | captchaMode | 配置密码位置 |
|---------|---------|---------|-------------|-------------|
| `local` | http://localhost:8080 | admin@system.local | auto | 无密码（默认 123456） |
| `cloud` | https://cloud.lanniu.top | admin@system.local | manual | `local.json.profiles.cloud.password` |
| `t-cloud` | https://t-cloud.lanniu.top | admin@system.local | manual | `local.json.profiles.t-cloud.password` |
| `ip-47` | http://47.103.23.246 | admin@system.local | manual | `local.json.profiles.ip-47.password` |
| `phone-user` | https://cloud.lanniu.top | 13813815913 | bind-only | `local.json.profiles.phone-user.password` |

## 新增 Profile

在 `config/ux-test.config.json` 的 `profiles` 段新增：

```json
{
  "profiles": {
    "my-new-env": {
      "baseUrl": "https://my-env.example.com",
      "loginPath": "/cloud/login",
      "tenantPath": "/cloud/Apex/tenant",
      "account": "admin@system.local",
      "password": "CHANGE_ME",
      "captchaMode": "manual"
    }
  }
}
```

然后在 `config/ux-test.config.local.json` 中覆盖密码：

```json
{
  "profiles": {
    "my-new-env": {
      "password": "real-password-123"
    }
  }
}
```

## 验证码模式选择

| 场景 | 推荐 captchaMode | 原因 |
|------|-----------------|------|
| 本地开发 | `auto` | 无验证码，出错即停 |
| CI/CD 自动化 | `skip` 或 `auto` | 无人工介入 |
| 远程有验证码 | `manual` | 需人工输入，但 120s 超时保护 |
| 手机验证码 / MFA | `bind-only` | 人工登录后 bind session |
