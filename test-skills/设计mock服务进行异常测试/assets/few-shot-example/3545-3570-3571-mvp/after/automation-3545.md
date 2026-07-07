# CSV 3545 — 用户列表接口失败时页面不白屏

> 完整流程见 [`../workflow.md`](../workflow.md)（方案 A：8081 + 注入权限）

## 环境

- URL：`http://localhost:8081/cloud/Apex/system/user`（**勿用 8080**）
- `.env.development.local`：`VITE_MOCK_DEV_SERVER=true`
- `error-scenario.json`：`{ "active": "3545" }`
- Console 已执行权限注入（见 workflow 第 4 节）

## 步骤

1. 确认 `active` 为 `"3545"`，保存
2. 打开上述 URL，刷新
3. 等待 loading 结束
4. 点击「新增」

## 预期

- [ ] 页面不白屏；框架完整
- [ ] 错误通知含「加载用户列表失败」
- [ ] loading 消失；「新增」可开弹窗
- [ ] `user/list` 响应 `code: 40001`

## curl 快验

```bash
curl -X POST "http://localhost:8081/dev-api/forward/seccenter/v2/user/list" ^
  -H "Content-Type: application/json" ^
  -d "{\"pagination\":{\"page\":1,\"pageSize\":20}}"
```

## 实际结果 / 备注

（自测填写）
