$ErrorActionPreference = 'Stop'

$scriptPath = Join-Path $PSScriptRoot 'Compress-LocalProject.ps1'
$testRoot = Join-Path ([System.IO.Path]::GetTempPath()) ('local-project-zip-test-' + [guid]::NewGuid().ToString('N'))
$sourceRoot = Join-Path $testRoot '项目 with spaces'
$sourceName = Split-Path -Leaf $sourceRoot
$archivePath = Join-Path $testRoot 'fixture.zip'
$confirmedArchivePath = Join-Path $testRoot 'confirmed.zip'

function Assert-True {
    param([bool]$Condition, [string]$Message)
    if (-not $Condition) {
        throw $Message
    }
}

function Invoke-PackScript {
    param([string[]]$Arguments)

    $previousPreference = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $output = & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath @Arguments 2>&1
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $previousPreference
    return [pscustomobject]@{
        ExitCode = $exitCode
        Output = ($output | Out-String)
    }
}

try {
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'node_modules\pkg') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'frontend\node_modules\pkg') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'vendor\pkg') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot '.venv\Lib\site-packages') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot '.git\objects') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'tmp') -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path $sourceRoot 'empty-output') -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $sourceRoot 'package.json') -Value '{"name":"fixture"}'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'pnpm-lock.yaml') -Value 'lockfileVersion: 9.0'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'go.mod') -Value 'module fixture'
    Set-Content -LiteralPath (Join-Path $sourceRoot '.env') -Value 'TOKEN=local'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'tmp\result.txt') -Value 'keep by default'
    Set-Content -LiteralPath (Join-Path $sourceRoot '.git\objects\marker') -Value 'git data'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'node_modules\pkg\marker') -Value 'dependency'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'frontend\node_modules\pkg\marker') -Value 'nested dependency'
    Set-Content -LiteralPath (Join-Path $sourceRoot 'vendor\pkg\marker') -Value 'go dependency'
    Set-Content -LiteralPath (Join-Path $sourceRoot '.venv\Lib\site-packages\marker') -Value 'python dependency'

    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $archivePath)
    Assert-True ($result.ExitCode -eq 0) ('Default archive failed: ' + $result.Output)

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::OpenRead($archivePath)
    try {
        $names = @($archive.Entries | ForEach-Object { $_.FullName })
        Assert-True ($names -contains ($sourceName + '/.env')) 'Default archive omitted .env.'
        Assert-True ($names -contains ($sourceName + '/.git/objects/marker')) 'Default archive omitted .git content.'
        Assert-True ($names -contains ($sourceName + '/tmp/result.txt')) 'Default archive omitted local temp file.'
        Assert-True ($names -contains ($sourceName + '/empty-output/')) 'Default archive omitted empty directory.'
        Assert-True ($names -contains ($sourceName + '/package.json')) 'Default archive omitted package manifest.'
        Assert-True ($names -contains ($sourceName + '/pnpm-lock.yaml')) 'Default archive omitted lock file.'
        Assert-True ($names -contains ($sourceName + '/go.mod')) 'Default archive omitted go.mod.'
        Assert-True (-not ($names | Where-Object { $_ -match '/(node_modules|vendor|\.venv)(/|$)' })) 'Default archive included installed dependencies.'
    }
    finally {
        $archive.Dispose()
    }

    $previewPath = Join-Path $testRoot 'preview.zip'
    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $previewPath, '-ExcludeLocalFiles', '-PreviewLocalExclusions')
    Assert-True ($result.ExitCode -eq 0) ('Local exclusion preview failed: ' + $result.Output)
    Assert-True ($result.Output.Contains('.git')) ('Preview did not show .git exclusion candidate: ' + $result.Output)
    Assert-True (-not (Test-Path -LiteralPath $previewPath)) 'Preview mode should not create a ZIP.'

    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $confirmedArchivePath, '-ExcludeLocalFiles')
    Assert-True ($result.ExitCode -ne 0) 'Packing should stop without local exclusion confirmation.'
    Assert-True (-not (Test-Path -LiteralPath $confirmedArchivePath)) 'Unconfirmed local exclusions created a ZIP.'

    $result = Invoke-PackScript -Arguments @('-SourcePath', '.', '-DestinationPath', (Join-Path $testRoot 'relative.zip'))
    Assert-True ($result.ExitCode -ne 0) 'Relative source paths should be rejected.'

    $insideArchive = Join-Path $sourceRoot 'inside.zip'
    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $insideArchive)
    Assert-True ($result.ExitCode -ne 0) 'An archive destination inside the source should be rejected.'
    Assert-True (-not (Test-Path -LiteralPath $insideArchive)) 'Invalid archive destination created a ZIP.'

    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $archivePath)
    Assert-True ($result.ExitCode -ne 0) 'An existing archive destination should be rejected.'

    $result = Invoke-PackScript -Arguments @('-SourcePath', $sourceRoot, '-DestinationPath', $confirmedArchivePath, '-ExcludeLocalFiles', '-ConfirmLocalExclusions')
    Assert-True ($result.ExitCode -eq 0) ('Confirmed local exclusion archive failed: ' + $result.Output)
    $archive = [System.IO.Compression.ZipFile]::OpenRead($confirmedArchivePath)
    try {
        $names = @($archive.Entries | ForEach-Object { $_.FullName })
        $retainedLocalState = @($names | Where-Object { $_ -match '/(\.git|tmp)(/|$)' })
        Assert-True ($retainedLocalState.Count -eq 0) ('Confirmed archive retained local state files: ' + ($retainedLocalState -join ', '))
        Assert-True ($names -contains ($sourceName + '/package.json')) 'Local exclusion removed dependency manifest.'
        Assert-True ($names -contains ($sourceName + '/pnpm-lock.yaml')) 'Local exclusion removed lock file.'
    }
    finally {
        $archive.Dispose()
    }

    Write-Output 'PASS: default local-file retention, nested dependency exclusion, empty directories, and preview-confirm flow.'
}
finally {
    if (Test-Path -LiteralPath $testRoot) {
        Remove-Item -LiteralPath $testRoot -Recurse -Force
    }
}
