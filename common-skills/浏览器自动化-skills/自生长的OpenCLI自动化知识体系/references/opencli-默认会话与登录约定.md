# OpenCLI 默认会话与登录约定（nebula）

除非用户**明确要求双会话测试**或**明确指定备用会话/账号**，自动化默认如下：

| 项 | 默认值 | 说明 |
|----|--------|------|
| 登录入口 | `http://localhost:8080/cloud/login` | ~~8081 子应用直连~~ 仅作例外 |
| 账户 | `admin@system.local` | 非双会话勿换 huiyan 等 |
| Chrome profile | **动态**：`opencli profile list` 中取 connected（优先 default） | 勿写死 profile ID；见 `lib/resolve-opencli-context.*` |
| Browser session | **动态**：`OPENCLI_BROWSER_SESSION` > config `sessionName` > 同 profile ID | 逻辑会话名（如 `nebula-ux`）可在 config 指定 |
| 人工兜底 | 无 connected profile 时 | 运行 `opencli profile list`，将 ID 告诉 Agent 或设 `OPENCLI_CHROME_PROFILE` |

## 解析优先级（脚本统一）

1. 环境变量 `OPENCLI_CHROME_PROFILE` / `OPENCLI_BROWSER_SESSION`（人类或 Agent 显式指定）
2. config 中 `opencliChromeProfile` / `sessionName`（仅 profile 需 connected）
3. `opencli profile list` 自动选 connected profile；session 默认同 profile ID
4. 仍失败 → 脚本退出并提示人类介入（见 `lib/resolve-opencli-context.ps1`）

## bind 约定

- bind 前必须在 **connected Chrome 窗口聚焦目标标签**（非 `about:blank`）
- 脚本会拒绝 bind 到 `about:blank` / `chrome://`
- 推荐：手动登录后用 `-BindOnly` 或 `opencli_bind_with_url_check`

## 白名单 E2E

- **子 skill**：`opencli-ux-api-whitelist/`
- **脚本**：`scripts/test-api-whitelist-table-scroll.ps1`（已接入动态 profile）

## 双会话例外

见 `gen-perms-apis` → OpenCLI双会话权限验证：admin-profile + test-profile 需**两个** Chrome profile 同时 connected；此时通过 `--admin` / `--test` 或环境变量显式指定，不依赖自动解析。

## 升级 OpenCLI

```bash
npm install -g @jackwener/opencli
opencli doctor
```

当前 npm 最新版见 `npm view @jackwener/opencli version`。
