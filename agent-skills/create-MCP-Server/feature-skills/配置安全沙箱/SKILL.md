---
name: 配置安全沙箱
description: 为 MCP Server 设置路径白名单、文件大小限制、权限控制和操作日志
---

# 配置安全沙箱

## 职责

为 MCP Server 设置安全边界，防止越权访问和滥用。

## 安全配置模板

```python
from pathlib import Path
from typing import Optional

# ── 路径白名单 ────────────────────────────
ALLOWED_ROOTS = [
    Path.home() / "Documents",
    Path.home() / "Desktop",
    Path("C:/MyApp/data"),       # 应用数据目录
]

# ── 文件限制 ───────────────────────────────
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.txt', '.md', '.json', '.csv', '.log', '.py'}

# ── 路径检查函数 ──────────────────────────
def is_path_allowed(path: Path) -> bool:
    \"\"\"检查路径是否在安全白名单内\"\"\"
    try:
        resolved = path.resolve()
        return any(
            str(resolved).startswith(str(root.resolve()))
            for root in ALLOWED_ROOTS
        )
    except Exception:
        return False
```

## 安全策略清单

| 策略 | 实现方式 | 说明 |
|------|----------|------|
| 路径白名单 | `ALLOWED_ROOTS` + `is_path_allowed()` | 只允许访问指定目录 |
| 文件大小限制 | `MAX_FILE_SIZE` | 超过限制拒绝读取 |
| 文件类型过滤 | `ALLOWED_EXTENSIONS` | 只允许处理特定后缀 |
| 只读/读写分离 | 分工具控制 | read_file 只读，write_file 需额外确认 |
| 操作日志 | 每次工具调用记录日志 | 便于审计 |
| 速率限制 | 可选：计数器 + 时间窗口 | 防止滥用 |
| SQL 安全 | 仅允许 SELECT | 使用正则过滤 DDL/DML |

## 日志记录示例

```python
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mcp-server")

@mcp.tool()
def read_file(file_path: str) -> str:
    logger.info(f"read_file called: {file_path}")
    ...
```
