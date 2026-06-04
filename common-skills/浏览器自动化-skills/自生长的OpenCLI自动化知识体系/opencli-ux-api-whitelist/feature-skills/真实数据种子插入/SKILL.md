# 真实数据种子插入

## 🔴 CHECKPOINT

执行 seed eval **之前**必须向用户确认：本地 8080、非生产、将插入 50 条真实 `apiWhitelist/create`。用户未确认则 **STOP**。

## 目标

在已登录 8080 页面内，串行调用 `POST /dev-api/direct/seccenter/v2/apiWhitelist/create` 插入 50 条。

## 脚本

- 主流程内嵌：`test-api-whitelist-table-scroll.ps1`（无 `-SkipSeed`）
- 单行 eval：`scripts/opencli-whitelist-seed-50-oneline.js`
- 可读版：`scripts/opencli-whitelist-seed-50-eval.js`

## 禁止

- mock 50 条冒充 E2E 数据
- `Promise.all(50)` 并发

## 期望输出

```json
{ "ok": true, "inserted": 50, "total": 50 }
```

## 🔴 执行后清理

插种完成 + 滚动断言 PASS 后，必须向用户确认是否清理种子数据：

| 时机 | 确认语 |
|:----|:-------|
| 断言 PASS 后 | 「本次插入了 50 条白名单，是否逐条清理（`apiWhitelist/delete`）？(y/n)」 |

用户确认后，通过 eval 逐条 DELETE `/dev-api/direct/seccenter/v2/apiWhitelist/delete?id={id}`。
不清理时，在 `session-log/` 记录「未清理的种子 id 范围」以便后续手动清理。

失败样本见 `template/before/常见失败.md`。
