# 端到端入口（PowerShell / Windows）
# 用法: .\run-e2e.ps1 [-Profile local-subapp] [-SkipLogin]

param(
    [string]$Profile = "local-subapp",
    [switch]$SkipLogin
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (Get-Command bash -ErrorAction SilentlyContinue) {
    $args = @()
    if ($Profile) { $args += @("--profile", $Profile) }
    if ($SkipLogin) { $args += "--skip-login" }
    & bash "$ScriptDir/run-e2e.sh" @args
    exit $LASTEXITCODE
}

Write-Host "未检测到 bash，使用 PowerShell 原生流程（TC1~TC3）" -ForegroundColor Yellow
& "$ScriptDir/scripts/menu-route-dup-check.ps1" -Profile $Profile
