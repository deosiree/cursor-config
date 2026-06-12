# Whitelist E2E: 8080 + admin@system.local + 动态 OpenCLI profile + real API x50
# Usage:
#   .\test-api-whitelist-table-scroll.ps1              # auto login + seed + scroll
#   .\test-api-whitelist-table-scroll.ps1 -BindOnly  # 已在 Chrome 登录且可 bind 时用（推荐，避免卡验证码）
#   .\test-api-whitelist-table-scroll.ps1 -SkipSeed    # 已插入 50 条时只测滚动
param(
  [switch]$BindOnly,
  [switch]$SkipSeed
)

$ErrorActionPreference = "Continue"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$KbsLib = Join-Path (Split-Path (Split-Path $ScriptDir -Parent) -Parent) "lib\resolve-opencli-context.ps1"
. $KbsLib

$ConfigPath = Join-Path (Split-Path $ScriptDir -Parent) "config\ux-test.config.json"
$ConfigSession = ""
$ConfigProfile = ""
if (Test-Path $ConfigPath) {
  $cfg = Get-Content $ConfigPath -Raw -Encoding UTF8 | ConvertFrom-Json
  if ($cfg.sessionName) { $ConfigSession = [string]$cfg.sessionName }
  if ($cfg.opencliChromeProfile) { $ConfigProfile = [string]$cfg.opencliChromeProfile }
}

$LoginUrl = "http://localhost:8080/cloud/login"
$MenuUrl = "http://localhost:8080/cloud/Apex/system/menu"
$LoginJs = Join-Path $ScriptDir "opencli-login-admin-eval-oneline.js"
$SeedJs = Join-Path $ScriptDir "opencli-whitelist-seed-50-oneline.js"
$ScrollJs = Join-Path $ScriptDir "opencli-whitelist-scroll-eval-oneline.js"

function Invoke-Oc {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$OcCommandArgs)
  Invoke-OpenCliOc -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile @OcCommandArgs
}

function Get-PageUrl {
  $out = Invoke-Oc @("browser", $script:OpenCliSession, "get", "url")
  if ($out -match "(https?://[^\s]+)") { return $Matches[1].Trim() }
  return $out.Trim()
}

Initialize-OpenCliContext -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile
Write-Host "==> doctor profile=$($script:OpenCliProfile)"
& opencli --profile $script:OpenCliProfile doctor 2>&1 | Out-Null

if ($BindOnly) {
  Write-Host "==> bind: 请确保 connected Chrome 当前标签在已登录的 8080 页面"
  $boundUrl = Invoke-OpenCliBindWithUrlCheck -UrlPattern "localhost:8080" -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile
  Write-Host "==> bound: $boundUrl"
} else {
  Write-Host "==> open $LoginUrl"
  Invoke-Oc @("browser", $script:OpenCliSession, "open", $LoginUrl) | Out-Null
  Start-Sleep -Seconds 2

  $url = Get-PageUrl
  if ($url -match "/login") {
    Write-Host "==> admin login (eval; 若卡住多为图形验证码，请改 -BindOnly)"
    $loginJs = (Get-Content -Path $LoginJs -Raw -Encoding UTF8).Trim()
    Invoke-Oc @("browser", $script:OpenCliSession, "eval", $loginJs) | Out-Null
    Start-Sleep -Seconds 8
    $url = Get-PageUrl
  }
  if ($url -match "/login") {
    Write-Host "ERROR: 仍在登录页。请手动登录后: .\test-api-whitelist-table-scroll.ps1 -BindOnly"
    exit 1
  }
}

Write-Host "==> menu $MenuUrl"
Invoke-Oc @("browser", $script:OpenCliSession, "open", $MenuUrl) | Out-Null
Start-Sleep -Seconds 3

if (-not $SkipSeed) {
  Write-Host "==> seed 50 via real API (串行，约 30-90s，勿用 50 并发)"
  $seedJs = (Get-Content -Path $SeedJs -Raw -Encoding UTF8).Trim()
  $seedOut = Invoke-Oc @("browser", $script:OpenCliSession, "eval", $seedJs)
  if ($seedOut -notmatch '"inserted"\s*:\s*(\d+)') {
    Write-Host "WARN: seed 结果异常，继续测滚动"
  }
}

Write-Host "==> open whitelist dialog"
$clickOut = Invoke-Oc @("browser", $script:OpenCliSession, "click", "--testid", "sys-menu-whitelist-btn")
if ($clickOut -match "error|not_found|semantic_not_found") {
  $clickJs = @"
(()=>{const b=document.querySelector('[data-testid=sys-menu-whitelist-btn]');if(b){b.click();return{clicked:true}}return{clicked:false,reason:'sys-menu-whitelist-btn not found'}})()
"@.Trim()
  Invoke-Oc @("browser", $script:OpenCliSession, "eval", $clickJs) | Out-Null
}
Start-Sleep -Seconds 2

Write-Host "==> scroll metrics"
$scrollJs = (Get-Content -Path $ScrollJs -Raw -Encoding UTF8).Trim()
$scrollOut = Invoke-Oc @("browser", $script:OpenCliSession, "eval", $scrollJs)
if ($scrollOut -match '"hasVerticalScroll"\s*:\s*true') { Write-Host "PASS: vertical scroll" }
else { Write-Host "WARN: no vertical scroll (need 50 rows + max-height 400)" }
if ($scrollOut -match '"hasHorizontalScroll"\s*:\s*true') { Write-Host "PASS: horizontal scroll" }
else { Write-Host "WARN: no horizontal scroll (narrow dialog should show)" }

Write-Host "==> done (session $($script:OpenCliSession) / profile $($script:OpenCliProfile), not closed)"
