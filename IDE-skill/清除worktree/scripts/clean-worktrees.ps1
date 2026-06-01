#Requires -Version 5.1
<#
.SYNOPSIS
  Scan temp git worktrees under workspaceRoot; filter by age; dry-run or remove.

.PARAMETER WorkspaceRoot
  Multi-root workspace top directory (absolute path).

.PARAMETER OlderThanDays
  Remove dirs with LastWriteTime before cutoff; 0 = all candidates.

.PARAMETER Execute
  Actually run git worktree remove; default is preview only.
#>
param(
  [Parameter(Mandatory = $true)]
  [string]$WorkspaceRoot,

  [int]$OlderThanDays = 3,

  [switch]$Execute
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$SkipDirNames = @(
  'node_modules', '.git', 'dist', 'dist-ssr', '.vite', '.cache',
  '.turbo', '.parcel-cache', 'coverage', '.next', 'vendor'
)

function Resolve-FullPath([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw "Path not found: $Path"
  }
  return (Resolve-Path -LiteralPath $Path).Path
}

function Test-IsGitRoot([string]$Dir) {
  $gitPath = Join-Path $Dir '.git'
  return Test-Path -LiteralPath $gitPath
}

function Find-GitRoots {
  param(
    [string]$Root,
    [int]$MaxDepth = 3
  )

  $results = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  $queue = [System.Collections.Generic.Queue[object]]::new()
  $queue.Enqueue(@{ Path = $Root; Depth = 0 })

  while ($queue.Count -gt 0) {
    $item = $queue.Dequeue()
    $dir = $item.Path
    $depth = $item.Depth

    if (Test-IsGitRoot $dir) {
      [void]$results.Add($dir)
      # Nested git roots (e.g. nebula wrapper + apex_dev/microfb sub-repos)
      try {
        Get-ChildItem -LiteralPath $dir -Directory -ErrorAction Stop | ForEach-Object {
          if (Test-IsGitRoot $_.FullName) {
            [void]$results.Add($_.FullName)
          }
        }
      } catch {
        Write-Warning "Skip nested scan: $dir - $($_.Exception.Message)"
      }
      continue
    }

    if ($depth -ge $MaxDepth) { continue }

    try {
      Get-ChildItem -LiteralPath $dir -Directory -ErrorAction Stop | ForEach-Object {
        if ($SkipDirNames -contains $_.Name) { return }
        $queue.Enqueue(@{ Path = $_.FullName; Depth = $depth + 1 })
      }
    } catch {
      Write-Warning "Skip unreadable dir: $dir - $($_.Exception.Message)"
    }
  }

  return @($results | Sort-Object)
}

function Get-RegisteredWorktreePaths([string]$GitRoot) {
  $paths = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
  try {
    Push-Location $GitRoot
    $lines = git worktree list --porcelain 2>$null
    if (-not $lines) { return @() }
    foreach ($line in $lines) {
      if ($line -match '^worktree\s+(.+)$') {
        $p = Resolve-FullPath $Matches[1]
        [void]$paths.Add($p)
      }
    }
  } catch {
    Write-Warning "Cannot read worktree list: $GitRoot"
  } finally {
    Pop-Location
  }
  return @($paths)
}

function Get-TempWorktreeCandidates([string]$GitRoot) {
  $candidates = @()

  $patterns = @(
    @{ Root = Join-Path (Join-Path $GitRoot '.claude') 'worktrees'; Filter = 'agent-*' },
    @{ Root = Join-Path $GitRoot '.worktrees'; Filter = '*' },
    @{ Root = Join-Path $GitRoot 'worktrees'; Filter = '*' }
  )

  foreach ($spec in $patterns) {
    if (-not (Test-Path -LiteralPath $spec.Root)) { continue }
    Get-ChildItem -LiteralPath $spec.Root -Directory -Filter $spec.Filter -ErrorAction SilentlyContinue |
      ForEach-Object { $candidates += $_.FullName }
  }

  return $candidates | Sort-Object -Unique
}

function Test-IsExpired([string]$Path, [datetime]$Cutoff, [int]$OlderThanDays) {
  if ($OlderThanDays -le 0) { return $true }
  $lastWrite = (Get-Item -LiteralPath $Path).LastWriteTime
  return $lastWrite -lt $Cutoff
}

function Get-AgeDays([string]$Path) {
  $lastWrite = (Get-Item -LiteralPath $Path).LastWriteTime
  return [math]::Floor(((Get-Date) - $lastWrite).TotalDays)
}

$workspace = Resolve-FullPath $WorkspaceRoot
$cutoff = (Get-Date).AddDays(-1 * [math]::Max(0, $OlderThanDays))
$currentTop = $null
try {
  $currentTop = (git rev-parse --show-toplevel 2>$null)
  if ($currentTop) { $currentTop = (Resolve-Path -LiteralPath $currentTop).Path }
} catch { }

Write-Host ''
Write-Host '=== Clean temp worktrees ===' -ForegroundColor Cyan
Write-Host "WorkspaceRoot : $workspace"
Write-Host "OlderThanDays : $OlderThanDays"
Write-Host "Cutoff (LastWriteTime <) : $($cutoff.ToString('yyyy-MM-dd HH:mm:ss'))"
Write-Host "Mode          : $(if ($Execute) { 'EXECUTE' } else { 'DRY-RUN' })"
Write-Host ''

$gitRoots = @(Find-GitRoots -Root $workspace)
if ($gitRoots.Length -eq 0) {
  Write-Host 'No git repository roots found.' -ForegroundColor Yellow
  exit 0
}

$rows = @()
$stats = @{ Preview = 0; Removed = 0; Skipped = 0; Failed = 0 }

foreach ($gitRoot in $gitRoots) {
  $registered = Get-RegisteredWorktreePaths $gitRoot
  $mainCheckout = (Resolve-FullPath $gitRoot)

  foreach ($wtPath in (Get-TempWorktreeCandidates $gitRoot)) {
    $wtResolved = (Resolve-FullPath $wtPath)
    $ageDays = Get-AgeDays $wtResolved
    $lastWrite = (Get-Item -LiteralPath $wtResolved).LastWriteTime.ToString('yyyy-MM-dd HH:mm:ss')

    $action = 'preview'
    $reason = ''

    if ($wtResolved -eq $mainCheckout) {
      $action = 'skip'
      $reason = 'main checkout'
      $stats.Skipped++
    } elseif ($currentTop -and ($wtResolved -eq $currentTop -or $PWD.Path.StartsWith($wtResolved, [StringComparison]::OrdinalIgnoreCase))) {
      $action = 'skip'
      $reason = 'in use'
      $stats.Skipped++
    } elseif ($registered -notcontains $wtResolved) {
      $action = 'skip'
      $reason = 'not registered in git worktree'
      $stats.Skipped++
    } elseif (-not (Test-IsExpired $wtResolved $cutoff $OlderThanDays)) {
      $action = 'skip'
      $reason = "not expired (< ${OlderThanDays}d)"
      $stats.Skipped++
    } elseif (-not $Execute) {
      $action = 'dry-run'
      $stats.Preview++
    } else {
      try {
        Push-Location $gitRoot
        git worktree remove --force --force "$wtResolved" 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "git worktree remove exit code $LASTEXITCODE" }
        $action = 'removed'
        $stats.Removed++
      } catch {
        $action = 'failed'
        $reason = $_.Exception.Message
        $stats.Failed++
      } finally {
        Pop-Location
      }
    }

    $rows += [PSCustomObject]@{
      GitRoot      = $gitRoot
      WorktreePath = $wtResolved
      LastWrite    = $lastWrite
      AgeDays      = $ageDays
      Action       = $action
      Reason       = $reason
    }
  }

  if ($Execute) {
    try {
      Push-Location $gitRoot
      git worktree prune 2>&1 | Out-Null
    } catch {
      Write-Warning "prune failed: $gitRoot - $($_.Exception.Message)"
    } finally {
      Pop-Location
    }
  }
}

if ($rows.Length -eq 0) {
  Write-Host 'No temp worktrees under whitelist.' -ForegroundColor Yellow
  exit 0
}

$rows | Format-Table -AutoSize GitRoot, WorktreePath, LastWrite, AgeDays, Action, Reason

Write-Host ''
Write-Host "Summary: preview=$($stats.Preview) removed=$($stats.Removed) skipped=$($stats.Skipped) failed=$($stats.Failed)" -ForegroundColor Cyan

if (-not $Execute -and $stats.Preview -gt 0) {
  Write-Host ''
  Write-Host 'Dry-run only. Re-run with -Execute after confirmation.' -ForegroundColor Yellow
}

exit $(if ($stats.Failed -gt 0) { 1 } else { 0 })
