---
name: 撰写-mock端点
description: 在 csv-error mock 文件中追加 scenario 分支，HTTP 200 + 业务 code，forward 路径，Windows 正斜杠 defineMock。
---

# Feature：撰写 mock 端点

## 何时触发

- `策略-新增异常Mock用例` 中需实现 API mock

## 规范

必读 [[../../references/apex-mock架构与路径约定.md]]。

### 模板要点

```typescript
// activeScenario() 读 .mock-shared/error-scenario.json
{
  url: "forward/seccenter/v2/user/list",
  method: ["POST"],
  body({ body }) {
    if (activeScenario() === "3545") {
      return { code: 40001, message: "加载用户列表失败（mock）", data: null };
    }
    // 非当前场景：返回成功 mock 数据，避免干扰其他用例
  },
}
```

### 并行请求

列表页常有并行 API（如 `config/security/detail`），非目标端点应返回成功 mock，避免连带错误。

### 文件策略

| 用例数 | 策略 |
|--------|------|
| ≤7 | 单文件 `csv-error.mvp.mock.ts` |
| ≥8 | 拆 `csv-error-{domain}.mock.ts` |

## 输出

- mock 文件路径
- 每条：`mock_endpoint`、`mock_error_code`、`scenario_active`

## 边界

- 不改 `vite.config.ts` / `env.d.ts`
- url 必须含 `forward/`（apex_dev profile）

## 使用示例

```text
为 case 3545 追加 user/list 失败分支，code 40001。
```
