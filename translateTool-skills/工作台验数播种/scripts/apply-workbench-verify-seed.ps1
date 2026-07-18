# apply-workbench-verify-seed.ps1
# Apply ProjectRoot/db/opt verify seed SQL via docker cp + mysql < file.
# NEVER: PowerShell pipeline / Set-Content as the mysql client stdin for these seeds.
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [ValidateSet("syk_glossary", "adm_matrix", "custom", "admin_retrieval")]
    [string]$SeedProfile = "syk_glossary",
    [string]$ContainerName = "translation-mysql",
    [string]$DbUser = "root",
    [string]$DbPassword = "123456",
    [string]$Database = "translationtool",
    [string]$SeedSqlPath = ""
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    $candidates = @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path (Get-Location) "translationtool"),
        (Get-Location).Path
    )
    foreach ($c in $candidates) {
        if ($c -and (Test-Path (Join-Path $c "docker-compose.yml"))) {
            return (Resolve-Path $c).Path
        }
    }
    throw "Cannot resolve translationtool ProjectRoot. Set -ProjectRoot or TRANSLATIONTOOL_ROOT"
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot

if (-not $SeedSqlPath) {
    if ($SeedProfile -eq "custom") {
        throw "SeedProfile=custom requires -SeedSqlPath (generate via new-custom-seed.ps1 or copy template/custom-seed.example.sql)"
    }
    $map = @{
        syk_glossary     = "db\opt\seed-verify-syk-admin-product.sql"
        adm_matrix       = "db\opt\seed-verify-term-syk.sql"
        admin_retrieval  = "db\opt\seed-verify-admin-retrieval.sql"
    }
    $SeedSqlPath = Join-Path $ProjectRoot $map[$SeedProfile]
} elseif (-not [System.IO.Path]::IsPathRooted($SeedSqlPath)) {
    $SeedSqlPath = Join-Path $ProjectRoot $SeedSqlPath
}

if (-not (Test-Path $SeedSqlPath)) {
    throw "Seed SQL not found: $SeedSqlPath"
}

$SeedSqlPath = (Resolve-Path $SeedSqlPath).Path
$remote = "/tmp/workbench_verify_seed.sql"

Write-Host "ProjectRoot : $ProjectRoot"
Write-Host "SeedProfile : $SeedProfile"
Write-Host "SeedSqlPath : $SeedSqlPath"
Write-Host "Method      : docker cp + mysql < file"

& docker cp $SeedSqlPath "${ContainerName}:${remote}"
if ($LASTEXITCODE -ne 0) { throw "docker cp failed" }

& docker exec $ContainerName sh -c "mysql -u$DbUser -p$DbPassword --default-character-set=utf8mb4 $Database < $remote"
if ($LASTEXITCODE -ne 0) { throw "mysql apply failed" }

Write-Host "OK: seed applied. Run 验证-翻译阶段就绪 next."
exit 0
