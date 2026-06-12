---
name: 生成mcp配置
description: 生成 .mcp.json 配置文件，供 Reasonix / OpenCode / Claude Code 识别 MCP Server
---

# 生成mcp配置

## 职责

生成 `.mcp.json` 文件，使 AI Agent 能自动发现和连接 MCP Server。

## 配置模板

### HTTP 传输

```json
{
  "mcpServers": {
    "my-server": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp",
      "description": "My MCP Server - 功能描述"
    }
  }
}
```

### stdio 传输

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["F:/Projects/my-mcp-server/server.py"]
    }
  }
}
```

### SSE 传输

```json
{
  "mcpServers": {
    "my-server": {
      "type": "sse",
      "url": "http://127.0.0.1:8000/sse"
    }
  }
}
```

## 部署位置

| Agent | 位置 |
|-------|------|
| Reasonix | 工作目录下 `.mcp.json` |
| OpenCode | 工作目录下 `.mcp.json` |
| Claude Code | 项目根目录 `.mcp.json` |
| Hermes | 独立配置文件（config.yaml） |
