# reset-adm-matrix.ps1
# ADM 矩阵验收数据还原：cleanup → fix_adm → verify strict
param(
    [string]$ProjectRoot = $env:TRANSLATIONTOOL_ROOT,
    [switch]$DryRun,
    [switch]$Apply
)

$ErrorActionPreference = "Stop"

function Resolve-ProjectRoot {
    param([string]$Root)
    if ($Root -and (Test-Path $Root)) { return (Resolve-Path $Root).Path }
    $candidates = @(
        "F:\Documents\Repertory\Sieyuan\translationtool",
        (Join-Path $PSScriptRoot "..\..\..\..\..\Repertory\Sieyuan\translationtool"),
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

if ($Apply -and $DryRun) {
    throw "Use either -DryRun or -Apply, not both"
}
if (-not $Apply -and -not $DryRun) {
    $DryRun = $true
}

$ProjectRoot = Resolve-ProjectRoot -Root $ProjectRoot
$AgentRoot = Join-Path $ProjectRoot "terminology-agent"
if (-not (Test-Path $AgentRoot)) {
    throw "terminology-agent not found under: $ProjectRoot"
}

Push-Location $AgentRoot
try {
    Write-Host "=== ADM matrix reset (ProjectRoot=$ProjectRoot) ==="

    if ($DryRun) {
        Write-Host "[1/2] cleanup preview (dry-run)"
        python -m devtools.cleanup_adm_test_data --dry-run
        if ($LASTEXITCODE -ne 0) { throw "cleanup dry-run failed with exit $LASTEXITCODE" }
        Write-Host ""
        Write-Host "Dry-run complete. Re-run with -Apply to execute full chain."
        exit 0
    }

    Write-Host "[1/4] cleanup apply"
    python -m devtools.cleanup_adm_test_data --apply
    if ($LASTEXITCODE -ne 0) { throw "cleanup apply failed with exit $LASTEXITCODE" }

    Write-Host ""
    Write-Host "[2/4] fix_adm seed"
    python -m devtools.fix_adm_test_data --apply
    if ($LASTEXITCODE -ne 0) { throw "fix_adm_test_data failed with exit $LASTEXITCODE" }

    Write-Host ""
    Write-Host "[3/4] verify_adm_data --strict"
    python -m devtools.verify_adm_data --strict
    if ($LASTEXITCODE -ne 0) { throw "verify_adm_data failed with exit $LASTEXITCODE" }

    Write-Host ""
    Write-Host "[4/4] verify_adm_pretranslate --strict"
    python -m devtools.verify_adm_pretranslate --strict
    if ($LASTEXITCODE -ne 0) { throw "verify_adm_pretranslate failed with exit $LASTEXITCODE" }

    Write-Host ""
    Write-Host "ADM matrix reset complete. UI: clear local Mock, restart Agent, re-run pretranslate once per scenario."
}
finally {
    Pop-Location
}
