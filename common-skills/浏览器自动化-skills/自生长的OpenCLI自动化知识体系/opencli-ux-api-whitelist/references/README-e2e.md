# 白名单 OpenCLI E2E 说明

## 卡死原因（摘要）

1. 图形验证码阻塞自动登录
2. 50 条并发 `fetch` 挂死 → 已改串行
3. PowerShell `Stop` + opencli stderr
4. 未带 `--profile p2ejw7ww`

## 约定

| 项 | 值 |
|----|-----|
| 登录 | `http://localhost:8080/cloud/login` |
| 账户 | `admin@system.local` / `123456` |
| OpenCLI | `opencli --profile p2ejw7ww browser p2ejw7ww ...` |
| 数据 | 真实 `apiWhitelist/create` |

## 推荐执行

```powershell
cd "…/opencli-ux-api-whitelist/scripts"
.\test-api-whitelist-table-scroll.ps1 -BindOnly
.\test-api-whitelist-table-scroll.ps1 -BindOnly -SkipSeed
```

## 单步

```powershell
opencli --profile p2ejw7ww browser p2ejw7ww bind
$js = Get-Content .\opencli-whitelist-scroll-eval-oneline.js -Raw
opencli --profile p2ejw7ww browser p2ejw7ww eval $js
```
