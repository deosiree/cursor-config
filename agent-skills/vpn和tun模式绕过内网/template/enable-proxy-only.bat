@echo off
setlocal
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f >nul
reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer /t REG_SZ /d "127.0.0.1:7890" /f >nul
echo [DONE] Proxy enabled: 127.0.0.1:7890
echo Reopen Chrome completely.
pause
exit /b 0