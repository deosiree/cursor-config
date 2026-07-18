# new-custom-seed.ps1
# Copy template/custom-seed.example.sql → ProjectRoot/db/opt/seed-verify-custom-<Slug>.sql with vars filled.
param(
    [Parameter(Mandatory = $true)][string]$Slug,
    [Parameter(Mandatory = $true)][string]$ProductId,
    [Parameter(Mandatory = $true)][string]$TaskId,
    [string]$TaskName = "",
    [string]$UserId = "d37d01e4-2df1-4681-b7bf-8a5f97f06495",
    [string]$Department = "通用平台部",
    [string]$TranslateType = "英文",
    [string]$Personnel = "admin",
    [string]$IdPrefix = "",
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [string]$OutPath = "",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
$skillRoot = Split-Path $PSScriptRoot -Parent
$template = Join-Path $skillRoot "template\custom-seed.example.sql"
if (-not (Test-Path $template)) { throw "template not found: $template" }

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    foreach ($c in @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path (Get-Location) "translationtool"),
        (Get-Location).Path
    )) {
        if ($c -and (Test-Path (Join-Path $c "docker-compose.yml"))) {
            return (Resolve-Path $c).Path
        }
    }
    throw "Cannot resolve ProjectRoot"
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
if (-not $TaskName) { $TaskName = "verify-custom-$Slug" }
if (-not $IdPrefix) { $IdPrefix = "verify-custom-$Slug" }

if (-not $OutPath) {
    $OutPath = Join-Path $ProjectRoot "db\opt\seed-verify-custom-$Slug.sql"
} elseif (-not [IO.Path]::IsPathRooted($OutPath)) {
    $OutPath = Join-Path $ProjectRoot $OutPath
}

if ((Test-Path $OutPath) -and -not $Force) {
    throw "Exists: $OutPath (pass -Force to overwrite)"
}

$dir = Split-Path $OutPath -Parent
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$text = [IO.File]::ReadAllText($template)
$text = $text.Replace('__PRODUCT_ID__', $ProductId)
$text = $text.Replace('__TASK_ID__', $TaskId)
$text = $text.Replace('__TASK_NAME__', $TaskName.Replace("'", "''"))
$text = $text.Replace('__USER_ID__', $UserId)
$text = $text -replace "SET @id_prefix = 'verify-custom';", "SET @id_prefix = '$IdPrefix';"
$text = $text -replace "SET @department = '通用平台部';", "SET @department = '$($Department.Replace("'","''"))';"
$text = $text -replace "SET @translate_type = '英文';", "SET @translate_type = '$($TranslateType.Replace("'","''"))';"
$text = $text -replace "SET @personnel = 'admin';", "SET @personnel = '$($Personnel.Replace("'","''"))';"

$utf8 = New-Object System.Text.UTF8Encoding $false
[IO.File]::WriteAllText($OutPath, $text, $utf8)

Write-Host "Wrote: $OutPath"
Write-Host "Next: edit matrix rows if needed, then:"
Write-Host "  apply-workbench-verify-seed.ps1 -SeedProfile custom -SeedSqlPath `"$OutPath`""
Write-Host "  verify-workbench-translate-ready.ps1 -TaskId $TaskId -ProductId $ProductId -ExpectedEntryCount 3"
exit 0
