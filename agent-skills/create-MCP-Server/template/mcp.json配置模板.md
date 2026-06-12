# .mcp.json 配置模板

将此文件放置到工作目录，供 Reasonix / OpenCode / Claude Code 自动加载 MCP Server。

## HTTP 模式（推荐远程访问）

```json
{
  "mcpServers": {
    "<server-name>": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp",
      "description": "<Server description>"
    }
  }
}
```

## stdio 模式（推荐本机运行）

```json
{
  "mcpServers": {
    "<server-name>": {
      "command": "python",
      "args": ["F:/path/to/server.py"]
    }
  }
}
```

## 多 Server 配置

```json
{
  "mcpServers": {
    "filesystem-server": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp"
    },
    "database-server": {
      "type": "http",
      "url": "http://127.0.0.1:8001/mcp"
    }
  }
}
```
