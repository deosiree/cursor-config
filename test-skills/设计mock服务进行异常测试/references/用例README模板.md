# 单用例 README 模板（automation/{caseId}.md）

> 每用例独立文件；**不**复制 workflow 全文，只链接。

## 结构（25–40 行）

```markdown
# CSV {case_id} — {name}

> 完整流程见 [`../workflow.md`](../workflow.md)（方案 A：8081 + 注入权限）

## 环境

- URL：`{base_url}{route}`（**勿用 8080**）
- `.env.development.local`：`VITE_MOCK_DEV_SERVER=true`
- `error-scenario.json`：`{ "active": "{scenario_active}" }`
- Console 已执行权限注入（见 workflow 第 4 节）
- perm_status: {ok|pending_human — 若 pending 则浏览器步骤 blocked}

## 步骤

1. 确认 `active` 为 `"{scenario_active}"`，保存
2. …（来自 CSV 步骤，精简为可执行操作）

## 预期

- [ ] …（来自 CSV 预期，checkbox）
- [ ] Network 中 `{api_short}` 响应 `code: {mock_error_code}`

## curl 快验

\`\`\`bash
curl -X POST "http://localhost:8081/dev-api/forward/seccenter/v2/..." ...
\`\`\`

## 实际结果 / 备注

（自测填写）
```

## 禁止

- 粘贴完整 Console 注入脚本（链 workflow）
- 粘贴 8080/8081 对比长表（链 workflow）
- 单文件超过 50 行（应拆到 workflow 或 registry）
