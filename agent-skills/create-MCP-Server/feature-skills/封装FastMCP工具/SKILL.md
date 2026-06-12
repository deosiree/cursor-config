---
name: 封装FastMCP工具
description: 将 Python 函数封装为 FastMCP @tool 装饰器格式，附带 Schema 生成
---

# 封装FastMCP工具

## 职责

把业务函数装帧为 FastMCP 可识别的 `@mcp.tool()` 格式。

## 用法

### 基础模式

```python
from fastmcp import FastMCP

mcp = FastMCP("My Server")

@mcp.tool()
def my_tool(param1: str, param2: int = 0) -> str:
    \"\"\"
    工具描述（Agent 通过此描述决定是否调用）

    Args:
        param1: 参数 1 的描述
        param2: 参数 2 的描述（默认 0）

    Returns:
        返回值的描述
    \"\"\"
    # 业务逻辑
    return f"Result: {param1}"
```

### 规则

1. **函数名 = 工具名**，使用 snake_case，Agent 会据此识别
2. **Docstring** 必须写清楚功能描述和每个参数的作用（Agent 靠它理解工具）
3. **类型注解** 必须完整，FastMCP 自动将其转为 JSON Schema
4. **返回值** 统一为 `str`，FastMCP 自动包装为 `TextContent`
5. **错误处理** 在函数内 try/except，返回友好错误信息

### 参数 Schema 自动推导

| Python 类型 | JSON Schema |
|------------|-------------|
| `str` | `{"type": "string"}` |
| `int` | `{"type": "integer"}` |
| `float` | `{"type": "number"}` |
| `bool` | `{"type": "boolean"}` |
| `list[str]` | `{"type": "array", "items": {"type": "string"}}` |
| `Optional[str]` | `{"type": "string"}`（非必需） |
| `Literal["a","b"]` | `{"enum": ["a","b"]}` |

### 导入外部依赖

```python
@mcp.tool()
def query_data(sql: str) -> str:
    import sqlite3  # 函数内导入，避免全局依赖缺失
    ...
```
