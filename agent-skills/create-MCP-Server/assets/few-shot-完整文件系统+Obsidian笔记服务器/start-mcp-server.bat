@echo off
chcp 65001 > nul
echo ========================================
echo   Reasonix MCP Server - Startup Script
echo ========================================
echo.
echo [INFO] Starting MCP Server...
cd /d F:\Documents\Repertory\Own\mcp-server
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start. Please check Python environment.
    pause
)
