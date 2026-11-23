[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$SourcePath,

    [string]$DestinationPath,

    [switch]$ExcludeLocalFiles,

    [switch]$PreviewLocalExclusions,

    [switch]$ConfirmLocalExclusions
)

$ErrorActionPreference = 'Stop'
$includeLocalFiles = -not $ExcludeLocalFiles

$dependencyDirectoryNames = @(
    'node_modules', 'vendor', '.venv', 'venv', 'env',
    'bower_components', 'Pods', '__pypackages__'
)

$dependencyManifestNames = @(
    'package.json', 'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lock', 'bun.lockb',
    'go.mod', 'go.sum', 'Cargo.toml', 'Cargo.lock', 'requirements.txt', 'requirements-dev.txt',
    'pyproject.toml', 'poetry.lock', 'uv.lock', 'Pipfile', 'Pipfile.lock', 'composer.json',
    'composer.lock', 'Gemfile', 'Gemfile.lock', 'mix.exs', 'mix.lock'
)

$commonLocalNames = @(
    '.git', '.idea', '.vscode', '.cache', '.pytest_cache', '.mypy_cache', '.ruff_cache',
    '.next', '.nuxt', '.output', '.turbo', '.vite', 'coverage', 'tmp', 'temp', 'logs', 'log'
)

function Get-NormalizedRelativePath {
    param(
        [string]$Root,
        [string]$FullName
    )

    $relative = $FullName.Substring($Root.Length).TrimStart([char[]]@('\', '/'))
    return $relative.Replace('\', '/')
}

function Test-IsDependencyManifest {
    param([string]$RelativePath)

    $leafName = [System.IO.Path]::GetFileName($RelativePath)
    return $dependencyManifestNames -contains $leafName
}

function Test-IsDependencyDirectory {
    param([string]$DirectoryName)

    return $dependencyDirectoryNames -contains $DirectoryName
}

function Get-GitIgnoredCandidates {
    param([string]$Root)

    $gitCommand = Get-Command git -ErrorAction SilentlyContinue
    if ($null -eq $gitCommand) {
        Write-Warning '未找到 git，无法读取 .gitignore 规则；仍会列出常见本地状态路径。'
        return @()
    }

    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = $gitCommand.Source
    $startInfo.Arguments = '-C "' + $Root + '" ls-files --others --ignored --exclude-standard -z'
    $startInfo.UseShellExecute = $false
    $startInfo.RedirectStandardOutput = $true
    $startInfo.RedirectStandardError = $true
    $startInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $startInfo
    [void]$process.Start()
    $stdoutTask = $process.StandardOutput.ReadToEndAsync()
    $stderrTask = $process.StandardError.ReadToEndAsync()
    $process.WaitForExit()
    $stdout = $stdoutTask.GetAwaiter().GetResult()
    $stderr = $stderrTask.GetAwaiter().GetResult()

    if ($process.ExitCode -ne 0) {
        if ($stderr) {
            Write-Warning ('git 忽略规则读取失败：' + $stderr.Trim())
        }
        return @()
    }

    return @($stdout.Split([char]0) | Where-Object { $_ })
}

function Get-LocalExclusionCandidates {
    param([string]$Root)

    $candidates = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    foreach ($relativePath in (Get-GitIgnoredCandidates -Root $Root)) {
        $normalized = $relativePath.Replace('\', '/')
        $containsDependencyDirectory = $false
        foreach ($segment in $normalized.Split('/')) {
            if (Test-IsDependencyDirectory -DirectoryName $segment) {
                $containsDependencyDirectory = $true
                break
            }
        }
        if (-not $containsDependencyDirectory -and -not (Test-IsDependencyManifest -RelativePath $normalized)) {
            [void]$candidates.Add($normalized)
        }
    }

    $pending = New-Object 'System.Collections.Generic.Stack[System.IO.DirectoryInfo]'
    $pending.Push((Get-Item -LiteralPath $Root))
    while ($pending.Count -gt 0) {
        $directory = $pending.Pop()
        foreach ($child in (Get-ChildItem -LiteralPath $directory.FullName -Force)) {
            $relativePath = Get-NormalizedRelativePath -Root $Root -FullName $child.FullName
            $segments = $relativePath.Split('/')
            if (Test-IsDependencyManifest -RelativePath $relativePath) {
                continue
            }

            $isCommonLocalPath = $commonLocalNames -contains $child.Name
            if ($isCommonLocalPath) {
                [void]$candidates.Add($relativePath)
            }
            elseif (-not $child.PSIsContainer -and ($child.Name -eq '.env' -or $child.Name -like '.env.*' -or $child.Extension -in @('.log', '.tmp', '.temp', '.bak'))) {
                [void]$candidates.Add($relativePath)
            }

            if ($child.PSIsContainer -and -not $isCommonLocalPath -and -not (Test-IsDependencyDirectory -DirectoryName $child.Name)) {
                $pending.Push($child)
            }
        }
    }

    return @($candidates | Sort-Object)
}

function Test-IsExcludedPath {
    param(
        [string]$RelativePath,
        [System.Collections.Generic.HashSet[string]]$ExcludedPaths
    )

    $candidate = $RelativePath.TrimEnd('/')
    while ($candidate) {
        if ($ExcludedPaths.Contains($candidate)) {
            return $true
        }

        $separator = $candidate.LastIndexOf('/')
        if ($separator -lt 0) {
            break
        }
        $candidate = $candidate.Substring(0, $separator)
    }

    return $false
}

function Add-DirectoryEntry {
    param(
        [System.IO.Compression.ZipArchive]$Archive,
        [string]$EntryName
    )

    $entry = $Archive.CreateEntry($EntryName + '/')
    $entry.LastWriteTime = [DateTimeOffset]::Now
}

function Add-ProjectToArchive {
    param(
        [string]$Root,
        [string]$TemporaryArchive,
        [bool]$KeepLocalFiles,
        [System.Collections.Generic.HashSet[string]]$ExcludedPaths
    )

    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $archive = [System.IO.Compression.ZipFile]::Open($TemporaryArchive, [System.IO.Compression.ZipArchiveMode]::Create)
    $fileCount = 0
    $excludedDependencyDirectories = 0
    $rootName = (Get-Item -LiteralPath $Root).Name
    $pending = New-Object 'System.Collections.Generic.Stack[System.IO.DirectoryInfo]'
    $pending.Push((Get-Item -LiteralPath $Root))

    try {
        while ($pending.Count -gt 0) {
            $directory = $pending.Pop()
            foreach ($child in (Get-ChildItem -LiteralPath $directory.FullName -Force)) {
                $relativePath = Get-NormalizedRelativePath -Root $Root -FullName $child.FullName
                if (-not $KeepLocalFiles -and (Test-IsExcludedPath -RelativePath $relativePath -ExcludedPaths $ExcludedPaths)) {
                    continue
                }

                if (($child.Attributes -band [System.IO.FileAttributes]::ReparsePoint) -ne 0) {
                    throw ('检测到符号链接或 reparse point，已停止以避免归档语义变化：' + $child.FullName)
                }

                if ($child.PSIsContainer) {
                    if (Test-IsDependencyDirectory -DirectoryName $child.Name) {
                        $excludedDependencyDirectories++
                        continue
                    }

                    $entryName = $rootName + '/' + $relativePath
                    Add-DirectoryEntry -Archive $archive -EntryName $entryName
                    $children = Get-ChildItem -LiteralPath $child.FullName -Force
                    if ($children.Count -gt 0) {
                        $pending.Push($child)
                    }
                    continue
                }

                $entryName = $rootName + '/' + $relativePath
                [void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $child.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal)
                $fileCount++
            }
        }
    }
    finally {
        $archive.Dispose()
    }

    return [pscustomobject]@{
        FileCount = $fileCount
        ExcludedDependencyDirectories = $excludedDependencyDirectories
    }
}

try {
    if (-not [System.IO.Path]::IsPathRooted($SourcePath)) {
        throw 'SourcePath 必须是绝对路径。'
    }

    $resolvedSource = (Resolve-Path -LiteralPath $SourcePath).Path.TrimEnd([char[]]@('\', '/'))
    if (-not (Test-Path -LiteralPath $resolvedSource -PathType Container)) {
        throw ('SourcePath 不是目录：' + $resolvedSource)
    }

    if (-not $DestinationPath) {
        $DestinationPath = Join-Path (Split-Path -Parent $resolvedSource) ((Split-Path -Leaf $resolvedSource) + '.zip')
    }
    elseif (-not [System.IO.Path]::IsPathRooted($DestinationPath)) {
        throw 'DestinationPath 必须是绝对路径。'
    }

    $destinationFullPath = [System.IO.Path]::GetFullPath($DestinationPath)
    $destinationParent = Split-Path -Parent $destinationFullPath
    if (-not (Test-Path -LiteralPath $destinationParent -PathType Container)) {
        throw ('输出目录不存在：' + $destinationParent)
    }

    $sourcePrefix = $resolvedSource.TrimEnd([char[]]@('\', '/')) + [System.IO.Path]::DirectorySeparatorChar
    if ($destinationFullPath.StartsWith($sourcePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw '输出 ZIP 不能放在源目录内部。'
    }
    if (Test-Path -LiteralPath $destinationFullPath) {
        throw ('输出文件已存在，为避免覆盖已停止：' + $destinationFullPath)
    }

    $excludedPaths = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
    if (-not $includeLocalFiles) {
        $localCandidates = @(Get-LocalExclusionCandidates -Root $resolvedSource)
        Write-Output '本地文件排除候选清单：'
        if ($localCandidates.Count -eq 0) {
            Write-Output '（无候选项）'
        }
        else {
            $localCandidates | ForEach-Object { Write-Output ('  ' + $_) }
        }

        if ($PreviewLocalExclusions) {
            Write-Output '仅完成预览，没有创建 ZIP。'
            exit 0
        }
        if (-not $ConfirmLocalExclusions) {
            throw '未创建 ZIP。请检查清单；确认后重新运行并添加 -ConfirmLocalExclusions。'
        }
        foreach ($candidate in $localCandidates) {
            [void]$excludedPaths.Add($candidate)
        }
    }
    $temporaryArchive = Join-Path $destinationParent ('.' + [System.IO.Path]::GetFileNameWithoutExtension($destinationFullPath) + '.' + [guid]::NewGuid().ToString('N') + '.tmp.zip')
    try {
        $result = Add-ProjectToArchive -Root $resolvedSource -TemporaryArchive $temporaryArchive -KeepLocalFiles $includeLocalFiles -ExcludedPaths $excludedPaths
        $checkArchive = [System.IO.Compression.ZipFile]::OpenRead($temporaryArchive)
        try {
            if ($checkArchive.Entries.Count -eq 0) {
                throw '生成的 ZIP 没有文件或目录条目。'
            }
        }
        finally {
            $checkArchive.Dispose()
        }

        Move-Item -LiteralPath $temporaryArchive -Destination $destinationFullPath
    }
    finally {
        if (Test-Path -LiteralPath $temporaryArchive) {
            Remove-Item -LiteralPath $temporaryArchive -Force
        }
    }

    $archiveItem = Get-Item -LiteralPath $destinationFullPath
    [pscustomobject]@{
        ArchivePath = $destinationFullPath
        ArchiveSizeBytes = $archiveItem.Length
        FilesArchived = $result.FileCount
        DependencyDirectoriesExcluded = $result.ExcludedDependencyDirectories
        IncludeLocalFiles = $includeLocalFiles
    }
}
catch {
    Write-Error $_.Exception.Message
    exit 1
}
