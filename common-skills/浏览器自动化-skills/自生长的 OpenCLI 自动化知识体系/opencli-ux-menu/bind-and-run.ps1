# 8080 基座：人工登录 → bind → 跑菜单判重 TC1~TC3
# 用法: .\bind-and-run.ps1 [-AlreadyBound]

param(
    [switch]$AlreadyBound
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (Get-Command bash -ErrorAction SilentlyContinue) {
    $args = @()
    if ($AlreadyBound) { $args += "--already-bound" }
    & bash "$ScriptDir/bind-and-run.sh" @args
    exit $LASTEXITCODE
}

. (Join-Path $ScriptDir "scripts\Load-MenuUxConfig.ps1") -Profile local
$Session = $MenuUxSession

if (-not $AlreadyBound) {
    Write-Host @"

请在 Chrome 中：
  1. 打开 $MenuUxLoginUrl
  2. 使用 $MenuUxAccount 登录成功
  3. 保持该标签为当前活动标签

"@ -ForegroundColor Yellow
    Read-Host "完成后按 Enter 执行 bind"
    opencli browser $Session bind 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "bind 失败" }
}

opencli browser $Session open $MenuUxMenuUrl 2>&1 | Out-Null
Start-Sleep -Seconds 2
$url = (opencli browser $Session get url 2>&1) -join "" -replace "`r|`n", ""
if ($url -match "/login") { throw "仍在登录页: $url" }

& (Join-Path $ScriptDir "scripts\menu-route-dup-check.ps1") -Profile local
Write-Host "bind-and-run 完成 (session=$Session)"
