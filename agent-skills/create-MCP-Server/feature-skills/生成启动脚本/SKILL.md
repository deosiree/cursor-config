---
name: 生成启动脚本
description: 为 MCP Server 生成 Windows bat、PowerShell、Linux sh 或 Dockerfile 启动脚本
---

# 生成启动脚本

## 职责

生成一键启动 MCP Server 的脚本文件。

## 模板

### Windows bat（UTF-8 兼容）

```bat
@echo off
chcp 65001 > nul
echo ========================================
echo   MCP Server - Startup Script
echo ========================================
echo.
echo [INFO] Starting MCP Server...
cd /d F:\Projects\my-mcp-server
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start. Check Python environment.
    pause
)
```

### Windows PowerShell

```powershell
$host.UI.RawUI.ForegroundColor = "Green"
Write-Host "Starting MCP Server..."
Set-Location F:\Projects\my-mcp-server
python server.py
```

### Linux shell

```sh
#!/bin/bash
echo "Starting MCP Server..."
cd /home/user/my-mcp-server
python3 server.py
```

### Dockerfile

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "server.py"]
```

### requirements.txt

```
fastmcp>=3.0
```
