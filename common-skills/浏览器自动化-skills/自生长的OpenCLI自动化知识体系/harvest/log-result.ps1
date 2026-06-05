# log-result.ps1 — 自动追加实跑结果到 evals/实跑记录.tsv（PowerShell 版）
#
# 用法（在 run-e2e.ps1 末尾调用）：
#   & "$PSScriptRoot\..\harvest\log-result.ps1" -Result "PASS" -Notes "滚动断言 PASS" -Skill "opencli-ux-api-whitelist"

param(
  [string]$Result = "PARTIAL",
  [string]$Notes = "",
  [string]$Skill = ""
)

$KnowledgeRoot = Resolve-Path "$PSScriptRoot\.."
$TsvPath = "$KnowledgeRoot\evals\实跑记录.tsv"

# 自动检测 skill 名
if (-not $Skill) {
  $CwdSkill = (Get-Item .).Name
  if ($CwdSkill -match "^opencli-ux-") {
    $Skill = $CwdSkill
  } else {
    $Skill = $CwdSkill
  }
}

$Date = Get-Date -Format "yyyy-MM-dd"
$Env = if ($env:UX_PROFILE) { $env:UX_PROFILE } else { "local" }

# 如果 TSV 不存在，写入表头
if (-not (Test-Path $TsvPath)) {
  "date`tskill`tresult`tenv`tnotes" | Out-File -FilePath $TsvPath -Encoding utf8
}

# 追加一行
"${Date}`t${Skill}`t${Result}`t${Env}`t${Notes}" | Out-File -FilePath $TsvPath -Encoding utf8 -Append
Write-Host "✅ 实跑已记录: ${Skill} ${Result} (${Env})"
