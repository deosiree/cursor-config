# OpenCLI 默认会话与登录约定（nebula）

除非用户**明确要求双会话测试**或**明确指定备用会话/账号**，自动化默认如下：

| 项 | 默认值 | 勿用 |
|----|--------|------|
| 登录入口 | `http://localhost:8080/cloud/login` | ~~`http://localhost:8081/cloud/login`~~（子应用直连仅作例外说明时） |
| 账户 | `admin@system.local`（平台 admin） | ~~huiyan~~ 等其他账号 |
| 浏览器会话名 | `p2ejw7ww` | ~~`q5prwymq`~~、`nebula-menu-ux` 等 |
| OpenCLI Chrome profile | 命令前加 `opencli --profile p2ejw7ww` | 否则会落到默认 `q5prwymq` 报错未连接 |
| Chrome 配置 | `huiyan19990112@gmail.com` 对应 profile | 另一 profile 仅双会话时 |

## 白名单 E2E

- **子 skill**：`opencli-ux-api-whitelist/`
- **数据**：真实调用 `POST /dev-api/direct/seccenter/v2/apiWhitelist/create` 插入 50 条，**不用** mock 种子 50 条。
- **脚本**：`opencli-ux-api-whitelist/scripts/test-api-whitelist-table-scroll.ps1`
- **种子 eval**：`opencli-ux-api-whitelist/scripts/opencli-whitelist-seed-50-oneline.js`
- **滚动 eval**：`opencli-ux-api-whitelist/scripts/opencli-whitelist-scroll-eval-oneline.js`

## 双会话例外

见 `gen-perms-apis` → OpenCLI双会话权限验证：admin-profile + test-profile，此时才使用非 `p2ejw7ww` 的 profile/会话。
