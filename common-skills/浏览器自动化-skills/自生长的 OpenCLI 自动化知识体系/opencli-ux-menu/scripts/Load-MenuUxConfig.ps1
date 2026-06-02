# 读取 opencli-ux-menu 配置，导出 $MenuUxSession / $MenuUxConfig 等变量
# 用法: . .\scripts\Load-MenuUxConfig.ps1 -Profile local-subapp

param(
    [string]$Profile = "local-subapp"
)

$configPath = Join-Path $PSScriptRoot "..\config\ux-test.config.json"
$localPath = Join-Path $PSScriptRoot "..\config\ux-test.config.local.json"

$config = Get-Content $configPath -Raw -Encoding UTF8 | ConvertFrom-Json
if (Test-Path $localPath) {
    $local = Get-Content $localPath -Raw -Encoding UTF8 | ConvertFrom-Json
    if ($local.sessionName) { $config.sessionName = $local.sessionName }
    if ($local.menuData) {
        foreach ($p in $local.menuData.PSObject.Properties) {
            $config.menuData | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value -Force
        }
    }
    if ($local.profiles -and $local.profiles.$Profile) {
        foreach ($p in $local.profiles.$Profile.PSObject.Properties) {
            $config.profiles.$Profile | Add-Member -NotePropertyName $p.Name -NotePropertyValue $p.Value -Force
        }
    }
}

$profileCfg = $config.profiles.$Profile
if (-not $profileCfg) { throw "未知 profile: $Profile" }

$script:MenuUxSession = $config.sessionName
$script:MenuUxProfile = $Profile
$script:MenuUxBaseUrl = $profileCfg.baseUrl.TrimEnd("/")
$script:MenuUxMenuUrl = "$($script:MenuUxBaseUrl)$($config.menuPath)"
$script:MenuUxLoginUrl = "$($script:MenuUxBaseUrl)$($profileCfg.loginPath)"
$script:MenuUxAuthMode = $profileCfg.authMode
$script:MenuUxProjectDup = $config.menuData.projectDuplicateIn
$script:MenuUxProjectCross = $config.menuData.projectCrossProject
$script:MenuUxRoutePath = $config.menuData.duplicateRoutePath
$script:MenuUxDupError = $config.menuData.duplicateErrorText
$script:MenuUxAccount = $profileCfg.account
