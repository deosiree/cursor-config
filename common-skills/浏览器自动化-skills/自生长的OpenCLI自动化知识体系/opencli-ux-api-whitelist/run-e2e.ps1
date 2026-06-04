# E2E 入口：API 白名单弹窗表格滚动（封装 scripts/test-api-whitelist-table-scroll.ps1）
#
# 用法：
#   .\run-e2e.ps1                 # 默认 -BindOnly -SkipSeed（已登录，只测滚动，推荐）
#   .\run-e2e.ps1 -Full           # -BindOnly + 串行插种 50 条 + 滚动
#   .\run-e2e.ps1 -AutoLogin      # 全自动登录（易卡验证码，不推荐）
#   .\run-e2e.ps1 -Check          # 仅 opencli doctor
#
# 来源：opencli-ux-api-whitelist/

param(
  [switch]$Full,
  [switch]$AutoLogin,
  [switch]$Check,
  [switch]$BindOnly = -not $AutoLogin
)

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Main = Join-Path $ScriptDir "scripts\test-api-whitelist-table-scroll.ps1"

if ($Check) {
  Write-Host "==> opencli doctor (profile p2ejw7ww)"
  & opencli --profile p2ejw7ww doctor
  exit $LASTEXITCODE
}

if (-not (Test-Path $Main)) {
  Write-Host "ERROR: missing $Main"
  exit 1
}

# 勿用 $args 变量名（与 PowerShell 自动变量冲突，会导致 -BindOnly 丢失）
$mainSwitches = @{}
if ($BindOnly) { $mainSwitches["BindOnly"] = $true }
if (-not $Full) { $mainSwitches["SkipSeed"] = $true }

$flagLabel = ($mainSwitches.Keys | ForEach-Object { "-$_" }) -join " "
Write-Host "==> run-e2e: $Main $flagLabel"
& $Main @mainSwitches
exit $LASTEXITCODE
