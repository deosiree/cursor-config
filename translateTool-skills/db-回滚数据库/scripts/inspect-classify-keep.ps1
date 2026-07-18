# inspect-classify-keep.ps1
# Inspect classify subtree / entry counts for keep_classify_restore mode.
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [string]$Department = "通用平台部",
    [string[]]$ClassifyNames = @("mon-cn-1.9.0", "develop")
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    $candidates = @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path $PSScriptRoot "..\..\..\..\..\Repertory\Sieyuan\translationtool"),
        (Get-Location).Path
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path (Join-Path $c "docker-compose.yml"))) {
            return (Resolve-Path $c).Path
        }
    }
    throw "Cannot resolve ProjectRoot"
}
$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot

$py = Join-Path $PSScriptRoot "lib\keep_classify_ops.py"
$names = ($ClassifyNames -join ",")
Write-Host "Inspect $Database department=$Department names=$names"
python $py inspect $ContainerName $DbUser $DbPassword $Database $Department $names
if ($LASTEXITCODE -ne 0) { throw "inspect failed" }
