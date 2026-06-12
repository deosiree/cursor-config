# HTTP 传输模式解读

## Streamable HTTP（FastMCP 3.x 默认）

- 端点：`POST /mcp`
- 协议：MCP Streamable HTTP 规范
- 特性：支持 stateless 模式（每次请求独立，无需会话 ID）
- 响应格式：SSE `event: message` + `data: {...}` 或纯 JSON

### 为什么是 SSE 不是直接 JSON？

MCP 协议支持服务器主动推送通知（如工具列表变更、资源更新），
SSE 格式为后续服务器推送留了接口。即使当前只用请求-响应，
也统一走 SSE 包装。

## 传输模式对比

| 模式 | 请求方式 | 会话管理 | 适用 |
|------|----------|----------|------|
| **stateful** | POST + sessionId | 服务端维护会话 | 需要跟踪上下文 |
| **stateless**（推荐） | POST（无 session） | 每次请求独立 | 简单调用，无需上下文 |

**推荐使用 stateless 模式**：`mcp.run(transport="http", stateless=True)`

## 连接流程（Stateless）

```
Client                     Server
  |                          |
  |-- POST /mcp ----------->|  tools/list
  |<-- event: message ------|  data: {"tools": [...]}
  |                          |
  |-- POST /mcp ----------->|  tools/call
  |<-- event: message ------|  data: {"content": [...]}
```

## FastMCP 参数

```python
mcp.run(
    transport="http",      # http | sse | stdio
    host="0.0.0.0",        # 监听所有网卡
    port=8000,             # 默认 8000
    stateless=True,        # 无状态模式
)
```
