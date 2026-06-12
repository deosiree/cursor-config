# Resolve OpenCLI Chrome profile and browser session dynamically.
# Usage: . "$PSScriptRoot\..\lib\resolve-opencli-context.ps1"

function Get-OpenCliConnectedProfileIds {
  $lines = & opencli profile list 2>&1
  $connected = @()
  foreach ($line in $lines) {
    if ($line -match 'not connected') { continue }
    if ($line -notmatch 'connected') { continue }
    if ($line -match '^\s+(\S+)\s+.*\bdefault\b.*connected') {
      return @($Matches[1])
    }
    if ($line -match '^\s+(\S+)\s+') {
      $id = $Matches[1]
      if ($id -notin @('Connected', 'Disconnected')) {
        $connected += $id
      }
    }
  }
  return $connected
}

function Test-OpenCliProfileConnected {
  param([string]$ProfileId)
  $lines = & opencli profile list 2>&1
  foreach ($line in $lines) {
    if ($line -match "^\s+$([regex]::Escape($ProfileId))\s+.*not connected") { return $false }
    if ($line -match "^\s+$([regex]::Escape($ProfileId))\s+.*connected") { return $true }
  }
  return $false
}

function Write-OpenCliHumanIdPrompt {
  param([string]$Reason = "cannot auto-resolve OpenCLI context")
  Write-Host ""
  Write-Host "[ERROR] $Reason" -ForegroundColor Red
  Write-Host ""
  Write-Host "Fix one of the following, then retry:"
  Write-Host "  1. Open OpenCLI extension in Chrome; ensure at least one profile is connected"
  Write-Host "  2. Run: opencli profile list"
  Write-Host "  3. Tell Agent the connected profile ID, or set env vars:"
  Write-Host '       $env:OPENCLI_CHROME_PROFILE = "<profile-id>"'
  Write-Host '       $env:OPENCLI_BROWSER_SESSION = "<session-name>"'
  Write-Host "  4. Before bind, focus the target tab in that Chrome window (not about:blank)"
  Write-Host ""
  & opencli profile list 2>&1
}

function Resolve-OpenCliChromeProfile {
  param([string]$ConfigHint = "")
  if ($env:OPENCLI_CHROME_PROFILE) {
    if (Test-OpenCliProfileConnected -ProfileId $env:OPENCLI_CHROME_PROFILE) {
      return $env:OPENCLI_CHROME_PROFILE
    }
    Write-OpenCliHumanIdPrompt "OPENCLI_CHROME_PROFILE=$($env:OPENCLI_CHROME_PROFILE) is not connected"
    exit 1
  }
  if ($ConfigHint -and (Test-OpenCliProfileConnected -ProfileId $ConfigHint)) {
    return $ConfigHint
  }
  $ids = @(Get-OpenCliConnectedProfileIds)
  if ($ids.Count -eq 0) {
    Write-OpenCliHumanIdPrompt "no connected profile in: opencli profile list"
    exit 1
  }
  return $ids[0]
}

function Resolve-OpenCliBrowserSession {
  param(
    [string]$ConfigSession = "",
    [string]$ProfileId = ""
  )
  if ($env:OPENCLI_BROWSER_SESSION) { return $env:OPENCLI_BROWSER_SESSION }
  if ($ConfigSession) { return $ConfigSession }
  if ($ProfileId) { return $ProfileId }
  Write-OpenCliHumanIdPrompt "cannot determine browser session name"
  exit 1
}

function Initialize-OpenCliContext {
  param(
    [string]$ConfigSession = "",
    [string]$ConfigProfile = ""
  )
  if ($script:OpenCliContextInitialized -and $script:OpenCliProfile -and $script:OpenCliSession) {
    return
  }
  $profile = Resolve-OpenCliChromeProfile -ConfigHint $ConfigProfile
  $session = Resolve-OpenCliBrowserSession -ConfigSession $ConfigSession -ProfileId $profile
  $script:OpenCliProfile = $profile
  $script:OpenCliSession = $session
  $script:OpenCliContextInitialized = $true
  Write-Host "==> OpenCLI context: profile=$profile session=$session (auto-resolved)"
}

function Invoke-OpenCliOc {
  param(
    [string]$ConfigSession = "",
    [string]$ConfigProfile = "",
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$OcCommandArgs
  )
  Initialize-OpenCliContext -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile
  $raw = & opencli --profile $script:OpenCliProfile @OcCommandArgs 2>&1
  foreach ($line in $raw) {
    if ($line -is [System.Management.Automation.ErrorRecord]) {
      $msg = $line.Exception.Message
      if ($msg) { Write-Host $msg }
    } else {
      Write-Host $line
    }
  }
  return ($raw | Out-String)
}

function Invoke-OpenCliBindWithUrlCheck {
  param(
    [string]$UrlPattern = "",
    [string]$ConfigSession = "",
    [string]$ConfigProfile = ""
  )
  Initialize-OpenCliContext -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile
  [void](Invoke-OpenCliOc -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile -OcCommandArgs @("browser", $script:OpenCliSession, "bind"))
  $urlOut = Invoke-OpenCliOc -ConfigSession $ConfigSession -ConfigProfile $ConfigProfile -OcCommandArgs @("browser", $script:OpenCliSession, "get", "url")
  $url = if ($urlOut -match "(https?://[^\s]+)") { $Matches[1].Trim() } else { $urlOut.Trim() }

  if (-not $url -or $url -eq "about:blank" -or $url -like "chrome://*" -or $url -like "chrome-extension://*") {
    $shown = if ($url) { $url } else { "<empty>" }
    Write-OpenCliHumanIdPrompt "bind landed on invalid page: $shown; focus target tab before bind"
    exit 1
  }
  if ($UrlPattern -and $url -notlike "*$UrlPattern*") {
    Write-Host "WARN: bind URL ($url) does not match expected (*$UrlPattern*)"
  }
  return $url
}
