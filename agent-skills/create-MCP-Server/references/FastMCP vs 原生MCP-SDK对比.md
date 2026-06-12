# FastMCP vs 原生 MCP SDK 对比

## FastMCP（推荐）

```python
from fastmcp import FastMCP

mcp = FastMCP("My Server")

@mcp.tool()
def my_tool(x: str) -> str:
    return f"Hello {x}"

mcp.run(transport="http")
```

**优点**：极简 API、自动 Schema 生成、HTTP/SSE/stdio 一行切换、内置 Starlette 服务器

**缺点**：底层封装较厚，难以精细控制 HTTP 中间件

**适用**：大多数 MCP Server 新建场景

## 原生 MCP SDK

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

server = Server("my-server")

@server.list_tools()
async def list_tools():
    return [Tool(name="my_tool", ...)]

@server.call_tool()
async def call_tool(name, args):
    ...
```

**优点**：完全控制协议细节，适合深度定制

**缺点**：代码量大，需要手动处理 Schema、传输、生命周期

**适用**：已有 MCP SDK 深度集成需求，或需要自定义传输层

## 选型建议

- **新建项目一律用 FastMCP**，一行 `transport="http"` 即可切换
- 需要自定义 HTTP 路由/中间件时，用 FastMCP 的 `http_app()` 方法获取 Starlette app 再扩展
- 仅在需要实现 MCP 协议扩展（自定义 capability）时才考虑原生 SDK
