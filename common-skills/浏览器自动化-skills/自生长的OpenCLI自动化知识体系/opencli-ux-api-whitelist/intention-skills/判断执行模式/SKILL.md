# 判断执行模式

| 用户状态 | 参数 | 说明 |
|----------|------|------|
| 未登录 / 不确定 | （无） | 全自动 open + eval 登录，易卡验证码 |
| 已在 p2ejw7ww 登录 8080 | `-BindOnly` | **推荐** |
| 已插过 50 条，只测 UI | `-BindOnly -SkipSeed` | 跳过 seed |
| 需要重新插种 | `-BindOnly`（无 SkipSeed） | bind 后串行 insert |

优先 `run-e2e.ps1`（默认 `-BindOnly -SkipSeed`）；底层见 `scripts/test-api-whitelist-table-scroll.ps1`。
