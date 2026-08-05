@echo off
setlocal
set "SCRIPT_DIR=%~dp0"
set "PS1=%SCRIPT_DIR%restore-vpn.ps1"

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo 请求管理员权限...
    powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%PS1%\"\" %*'"
    exit /b 0
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%" %*
set "EC=%ERRORLEVEL%"
echo.
pause
exit /b %EC%
