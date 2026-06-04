@echo off
REM S1 场景入口：只选导入
REM 优先 Node.js 脚本；无 node 时提示安装
setlocal
cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未找到 node.exe，请安装 Node.js ^>= 20
  exit /b 1
)

echo === 菜单管理 E2E / S1 只选导入 ===
node scripts\run-e2e-scenario.node.js scenarios\01-only-import.json %*
exit /b %ERRORLEVEL%
