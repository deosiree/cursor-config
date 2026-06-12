# FastMCP Server 通用模板

## 完整代码框架

```python
"""
MCP Server - <功能描述>
Transport: <http | stdio>
"""
import os
import json
from pathlib import Path
from fastmcp import FastMCP

# ── 配置 ──────────────────────────────────────
ALLOWED_ROOTS = [
    Path.home() / "Documents",
    Path("C:/MyApp/data"),
]
MAX_FILE_SIZE = 10 * 1024 * 1024

# ── 服务实例 ──────────────────────────────────
mcp = FastMCP("<Server Name>", version="1.0.0")

# ── 辅助函数 ──────────────────────────────────
def is_path_allowed(path: Path) -> bool:
    try:
        resolved = path.resolve()
        return any(
            str(resolved).startswith(str(root.resolve()))
            for root in ALLOWED_ROOTS
        )
    except Exception:
        return False

# ── 工具定义 ──────────────────────────────────
@mcp.tool()
def tool_name(param1: str, param2: int = 0) -> str:
    """
    Tool description (shown to AI Agent)

    Args:
        param1: Description of param1
        param2: Description of param2 (default 0)

    Returns:
        Description of return value
    """
    # Implementation here
    return f"Result: {param1}"

# ── 启动入口 ──────────────────────────────────
if __name__ == "__main__":
    mcp.run(transport="http", host="0.0.0.0", port=8000, stateless=True)
```

## 模板变体

### stdio 模式

```python
mcp.run(transport="stdio")
```

### 指定端口

```python
mcp.run(transport="http", host="0.0.0.0", port=8765, stateless=True)
```

## 使用方式

1. 复制此模板到目标目录
2. 修改 Server Name 和工具函数
3. 修改 ALLOWED_ROOTS 安全配置
4. `pip install fastmcp`
5. `python server.py`
