# extract-database-from-all-dump.ps1
# Extract a single database section from mysqldump --all-databases into a standalone .sql
# Safe for local restore: never imports mysql/sys/performance_schema.
param(
    [Parameter(Mandatory = $true)][string]$DumpPath,
    [string]$Database = "translationtool",
    [string]$OutPath = "",
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT
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

if (-not (Test-Path $DumpPath)) { throw "Dump not found: $DumpPath" }
$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
if (-not $OutPath) {
    $outDir = Join-Path $ProjectRoot "db\backups"
    if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }
    $OutPath = Join-Path $outDir ("extracted_{0}_{1}.sql" -f $Database, (Get-Date -Format "yyyyMMdd_HHmmss"))
}

$pyPath = Join-Path $PSScriptRoot "lib\extract_db_from_all_dump.py"
Write-Host "Extracting $Database from $DumpPath ..."
$json = python $pyPath $DumpPath $Database $OutPath
if ($LASTEXITCODE -ne 0) { throw "extract failed" }
$json
$obj = $json | ConvertFrom-Json
Write-Host "Wrote $($obj.outPath) ($($obj.sizeHumanMB) MB)"
