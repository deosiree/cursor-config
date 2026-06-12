# MCP 实操实例：从 0 到 1 搭建 MCP Server + Client

> **目标**：用 Python 实现一个最小 MCP Server（天气查询 + 数据库查询），然后用 MCP Client 调用
> **核心思想**：MCP = USB-C 接口 for AI，标准化 Agent 与外部工具的交互协议

## 完整实现

### MCP Server（服务端）

```python
"""
最小 MCP Server — 提供天气查询 + 数据库查询两个工具
运行: python mcp_weather_server.py
协议: 遵循 MCP 标准的 HTTP 传输（也可用 stdio）
"""
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Any, List
import uvicorn

app = FastAPI(title="Minimal MCP Server")

# ─── 工具定义 Schema ──────────────────────────────

TOOLS = [
    {
        "name": "get_weather",
        "description": "查询城市天气",
        "inputSchema": {
            "type": "object",
            "properties": {
                "city": {"type": "string", "description": "城市名，如 南京、上海"},
                "date": {"type": "string", "description": "日期，如 2025-06-01，默认今天"},
            },
            "required": ["city"],
        },
    },
    {
        "name": "query_database",
        "description": "执行 SQL 查询（只读，仅允许 SELECT）",
        "inputSchema": {
            "type": "object",
            "properties": {
                "sql": {"type": "string", "description": "SELECT 查询语句"},
            },
            "required": ["sql"],
        },
    },
]

# ─── MCP 协议端点 ─────────────────────────────────

@app.get("/mcp/tools")
def list_tools():
    """端点 1: 列出所有可用工具"""
    return {"tools": TOOLS}

@app.post("/mcp/call")
def call_tool(req: Dict[str, Any]):
    """端点 2: 调用指定工具"""
    tool_name = req.get("tool")
    arguments = req.get("arguments", {})

    if tool_name == "get_weather":
        return handle_weather(arguments)
    elif tool_name == "query_database":
        return handle_database(arguments)
    else:
        return {"content": [], "isError": True}

# ─── 工具实现 ─────────────────────────────────────

def handle_weather(args: Dict) -> Dict:
    """天气查询实现——调用真实天气 API"""
    import httpx
    city = args.get("city", "南京")

    # 实际: 调用和风天气 / OpenWeatherMap API
    # resp = httpx.get(f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid=KEY")
    # data = resp.json()
    # return {
    #     "content": [{"type": "text", "text": f"{city}: {data['weather'][0]['description']}, {data['main']['temp']}°C"}]
    # }

    # 模拟返回
    return {
        "content": [{
            "type": "text",
            "text": f"{city}: 25°C, 晴, 湿度 60%",
        }]
    }

def handle_database(args: Dict) -> Dict:
    """数据库查询实现——仅允许 SELECT"""
    import re, sqlite3
    sql = args.get("sql", "")

    # 安全检查：只允许 SELECT
    if not re.match(r'^\s*SELECT\s', sql, re.IGNORECASE):
        return {
            "content": [{"type": "text", "text": "只允许 SELECT 查询"}],
            "isError": True,
        }

    # 实际: 连接数据库执行
    # conn = sqlite3.connect("business.db")
    # cursor = conn.execute(sql)
    # rows = cursor.fetchall()
    # conn.close()

    return {
        "content": [{
            "type": "text",
            "text": f"查询结果: 模拟返回 3 行数据",
        }]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

### MCP Client（Agent 端）

```python
"""
MCP Client — Agent 通过它发现和调用工具
支持 stdio（本地进程）和 HTTP（远程服务）两种传输
"""
import httpx
import subprocess
import json
from typing import Dict, Any, List, Optional

class MCPClient:
    """MCP 客户端"""

    def __init__(self, transport: str = "http", **kwargs):
        self.transport = transport
        if transport == "http":
            self.server_url = kwargs.get("url", "http://localhost:8001")
            self.http_client = httpx.AsyncClient()
        elif transport == "stdio":
            self.command = kwargs["command"]
            self.process: Optional[subprocess.Popen] = None

    async def discover_tools(self) -> List[Dict]:
        """发现服务端所有工具"""
        if self.transport == "http":
            resp = await self.http_client.get(f"{self.server_url}/mcp/tools")
            return resp.json().get("tools", [])
        # stdio 通过 JSON-RPC 发现
        return []

    async def call_tool(self, name: str, args: Dict) -> Any:
        """调用指定工具"""
        if self.transport == "http":
            resp = await self.http_client.post(
                f"{self.server_url}/mcp/call",
                json={"tool": name, "arguments": args},
                timeout=30.0,
            )
            result = resp.json()
            if result.get("isError"):
                raise RuntimeError(result["content"][0]["text"])
            return result["content"][0]["text"]
        return None

    async def close(self):
        if self.transport == "http":
            await self.http_client.aclose()

# ─── 在 Agent 中使用 ─────────────────────────────

async def agent_workflow():
    """Agent 通过 MCP 发现和调用工具的工作流"""
    import asyncio

    client = MCPClient(transport="http", url="http://localhost:8001")

    # 1. 发现工具
    tools = await client.discover_tools()
    print(f"发现 {len(tools)} 个工具:")
    for t in tools:
        print(f"  - {t['name']}: {t['description']}")

    # 2. Agent 推理决定调用哪个工具（LLM 选择）
    # LLM 输出: {"tool": "get_weather", "arguments": {"city": "南京"}}

    # 3. 调用工具
    result = await client.call_tool("get_weather", {"city": "南京"})
    print(f"\n工具返回: {result}")

    # 4. 结果返回给 LLM 生成最终回复
    # llm_response = llm.invoke(f"根据工具结果回答用户：{result}")
    print(f"最终回复: 南京今天 25°C, 晴, 适合出行 ☀️")

    await client.close()

# asyncio.run(agent_workflow())
```

## MCP vs Function Calling 对比

| 维度 | Function Calling | MCP |
|------|-----------------|-----|
| 标准化 | OpenAI 专属 | 开放标准，多厂商支持 |
| 工具发现 | 预定义在请求中 | 运行时动态发现 |
| 传输协议 | HTTP | HTTP + stdio + SSE |
| Schema 格式 | OpenAI 特定格式 | JSON Schema 标准 |
| 工具粒度 | 每次请求传全部 | 按需发现，服务端管理 |
| 安全沙箱 | 无 | 可集成（如 OpenClaw） |

## 面试话术

> **"MCP 的核心价值不是 '另一种 Function Calling'，而是工具与 Agent 的解耦。没有 MCP 时，每加一个工具要改 Agent 的 tool definition，还要重启服务。有了 MCP，Agent 启动时自动发现工具，新增工具 = 新启一个 Server + 注册到 Registry，Agent 代码不动。这在企业级 Agent 系统里是质变——运维不需要懂 Agent，开发不需要管部署。"**
