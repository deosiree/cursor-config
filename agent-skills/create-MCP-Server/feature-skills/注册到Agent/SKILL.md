---
name: 注册到Agent
description: 将 MCP Server 注册到 Reasonix、OpenCode、Hermes 或 Claude Code
---

# 注册到Agent

## 职责

指导用户将已创建的 MCP Server 注册到其使用的 Agent 平台。

## Reasonix / OpenCode

将 `.mcp.json` 放到工作目录下，Reasonix 启动时自动加载。

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp"
    }
  }
}
```

验证方式：在 Reasonix 会话中让 AI 调用 `get_server_info`（如果实现了该工具）。

## Hermes Agent

编辑 Hermes 配置文件（通常在 `~/.hermes/config.yaml` 或 Hermes 管理界面）：

```yaml
mcp:
  servers:
    my-server:
      command: python
      args:
        - F:\Projects\my-mcp-server\server.py
```

或 HTTP 模式：

```yaml
mcp:
  servers:
    my-server:
      url: http://192.168.1.100:8000/mcp
      transport: http
```

## Claude Code

将 `.mcp.json` 放到项目根目录，在 Claude Code 中运行：

```
/mcp
```

即可看到注册的 Server 和工具列表。

## 验证检查清单

- [ ] Server 已运行（终端窗口保持打开）
- [ ] `.mcp.json` 语法正确（JSON 格式）
- [ ] URL/IP 地址正确（远程访问用实际 IP，本地用 127.0.0.1）
- [ ] 防火墙已放行端口（远程访问时需要）
- [ ] Agent 能列出工具（返回 200 OK）
