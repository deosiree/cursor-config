# 最小 HTTP MCP Server 模板（FastAPI 方式）

基于 FastAPI + 原生 MCP 协议端点，适合需要精细控制 HTTP 路由的场景。

```python
"""
Minimal MCP Server - <功能描述>
运行: python server.py
协议: MCP over HTTP
"""
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any
import uvicorn

app = FastAPI(title="<Server Name>")

# ── 工具定义 ──────────────────────────────
TOOLS = [
    {
        "name": "<tool_name>",
        "description": "<tool description>",
        "inputSchema": {
            "type": "object",
            "properties": {
                "<param1>": {"type": "string", "description": "<param1 desc>"},
            },
            "required": ["<param1>"],
        },
    },
]

# ── MCP 协议端点 ──────────────────────────
@app.get("/mcp/tools")
def list_tools():
    return {"tools": TOOLS}

@app.post("/mcp/call")
def call_tool(req: Dict[str, Any]):
    tool_name = req.get("tool")
    arguments = req.get("arguments", {})

    if tool_name == "<tool_name>":
        return handle_tool(arguments)
    else:
        return {"content": [], "isError": True}

# ── 工具实现 ──────────────────────────────
def handle_tool(args: Dict) -> Dict:
    # Implementation
    return {
        "content": [{"type": "text", "text": "Result"}]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

## 适用场景

- 需要自定义 HTTP 中间件（认证、限流）
- 已有 FastAPI 项目需要增加 MCP 端点
- 需要精细控制路由结构
