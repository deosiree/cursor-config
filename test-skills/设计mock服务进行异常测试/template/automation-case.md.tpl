# CSV {{case_id}} — {{name}}

> 完整流程见 [`../workflow.md`](../workflow.md)（方案 A：8081 + 注入权限）

## 环境

- URL：`{{base_url}}{{route}}`（**勿用 8080**）
- `.env.development.local`：`VITE_MOCK_DEV_SERVER=true`
- `error-scenario.json`：`{ "active": "{{scenario_active}}" }`
- Console 已执行权限注入（见 workflow 第 4 节）

## 步骤

{{steps_numbered}}

## 预期

{{expected_checkboxes}}

## curl 快验

```bash
curl -X POST "http://localhost:{{devPort}}{{apiBasePath}}/{{mock_path}}" ^
  -H "Content-Type: application/json" ^
  -d "{{curl_body}}"
```

## 实际结果 / 备注

（自测填写）
