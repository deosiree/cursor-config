@echo off
REM 菜单管理 E2E — 8 场景全矩阵
REM 用法:
REM   run-all.bat           跑全部 8 场景
REM   run-all.bat --from 2  从 S2 开始
REM   run-all.bat --only 6,7,8
setlocal
cd /d "%~dp0.."

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] 未找到 node.exe，请安装 Node.js ^>= 20
  exit /b 1
)

echo.
echo ============================================================
echo  菜单管理 E2E 全矩阵 ^(S1~S8^)
echo  前置: opencli 双 profile + localhost:8080 服务运行中
echo ============================================================
echo.

node scripts\run-all.node.js %*
set EXIT_CODE=%ERRORLEVEL%

echo.
if %EXIT_CODE%==0 (
  echo [OK] 全部场景通过
) else (
  echo [FAIL] 存在失败场景，详见 examples\result-*.json
)
exit /b %EXIT_CODE%
