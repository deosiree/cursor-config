[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$Task,
    [string]$PlanPath,
    [string]$Scheme,
    [string]$Title,
    [string]$ReasoningEffort,
    [string]$ServiceTier,
    [string]$Isolation,
    [string]$Mode,
    [string]$Role,
    [string]$InteractionMode,
    [string]$RuntimeMode,
    [string]$ClientRequestId,
    [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

try {
    if ([string]::IsNullOrWhiteSpace($Task)) {
        throw '-Task 参数不能为空。'
    }

    $registryPath = Join-Path $PSScriptRoot '..\assets\schemes-registry.json'
    $registry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json -Depth 30
    if ([string]::IsNullOrWhiteSpace($Scheme)) {
        $Scheme = $registry.defaultSchemeId
    }
    $schemeEntry = $registry.schemes | Where-Object { $_.id -eq $Scheme } | Select-Object -First 1
    if ($null -eq $schemeEntry) {
        throw "未找到委派方案: $Scheme"
    }

    $defaults = $schemeEntry.delegation
    $validValues = @{
        ReasoningEffort = @('low', 'medium', 'high', 'xhigh', 'max', 'ultra')
        ServiceTier = @('default', 'priority')
        Isolation = @('shared', 'worktree')
        Mode = @('async', 'wait')
        Role = @('implementation', 'research', 'review', 'design', 'test', 'general')
        InteractionMode = @('inherit', 'default', 'plan')
        RuntimeMode = @('inherit', 'approval-required', 'auto-accept-edits', 'auto', 'full-access')
    }
    foreach ($parameterName in $validValues.Keys) {
        $parameterValue = Get-Variable -Name $parameterName -ValueOnly
        if (-not [string]::IsNullOrWhiteSpace($parameterValue) -and $validValues[$parameterName] -notcontains $parameterValue) {
            throw "-$parameterName 参数值无效。"
        }
    }

    $targetOptions = @()
    foreach ($option in $defaults.options) {
        $targetOptions += [ordered]@{ id = $option.id; value = $option.value }
    }
    foreach ($override in @(
        [ordered]@{ id = 'reasoningEffort'; value = $ReasoningEffort }
        [ordered]@{ id = 'serviceTier'; value = $ServiceTier }
    )) {
        if ([string]::IsNullOrWhiteSpace($override.value)) {
            continue
        }
        $found = $false
        for ($index = 0; $index -lt $targetOptions.Count; $index++) {
            if ($targetOptions[$index].id -eq $override.id) {
                $targetOptions[$index].value = $override.value
                $found = $true
                break
            }
        }
        if (-not $found) {
            $targetOptions += [ordered]@{ id = $override.id; value = $override.value }
        }
    }

    $fullTask = if ([string]::IsNullOrWhiteSpace($PlanPath)) {
        $Task
    }
    else {
        @(
            '请严格按照以下计划文件执行，并在完成后回报改动文件清单与测试验证结果：'
            "计划文件: $PlanPath"
            ''
            '具体执行要求：'
            $Task
        ) -join "`n"
    }
    if ([string]::IsNullOrWhiteSpace($ClientRequestId)) {
        $ClientRequestId = 'muti-agents-{0}-{1}' -f (Get-Date -Format 'yyyyMMddHHmmss'), ([guid]::NewGuid().ToString('N').Substring(0, 8))
    }

    $payload = [ordered]@{
        task = $fullTask
        role = $(if ($Role) { $Role } else { $defaults.role })
        interactionMode = $(if ($InteractionMode) { $InteractionMode } else { $defaults.interactionMode })
        isolation = $(if ($Isolation) { $Isolation } else { $defaults.isolation })
        mode = $(if ($Mode) { $Mode } else { $defaults.mode })
        clientRequestId = $ClientRequestId
        target = [ordered]@{
            providerInstanceId = $defaults.providerInstanceId
            model = $defaults.model
            options = $targetOptions
        }
    }
    if (-not [string]::IsNullOrWhiteSpace($Title)) {
        $payload['title'] = $Title
    }
    if (-not [string]::IsNullOrWhiteSpace($RuntimeMode)) {
        $payload['runtimeMode'] = $RuntimeMode
    }

    $rawJson = $payload | ConvertTo-Json -Depth 30 -Compress
    $asciiBuilder = New-Object System.Text.StringBuilder
    foreach ($character in $rawJson.ToCharArray()) {
        $code = [int][char]$character
        if ($code -gt 0x7F) {
            [void]$asciiBuilder.AppendFormat([Globalization.CultureInfo]::InvariantCulture, '\u{0:x4}', $code)
        }
        else {
            [void]$asciiBuilder.Append($character)
        }
    }
    $asciiJson = $asciiBuilder.ToString()

    if ($DryRun) {
        Write-Output $asciiJson
        exit 0
    }

    $mcpCall = $env:T3_ACP_MCP_CALL
    if ([string]::IsNullOrWhiteSpace($mcpCall)) {
        [Console]::Error.WriteLine('未检测到 T3_ACP_MCP_CALL；拒绝静默降级。')
        exit 2
    }
    $commandExists = Test-Path -LiteralPath $mcpCall -PathType Leaf
    if (-not $commandExists) {
        $commandExists = $null -ne (Get-Command -Name $mcpCall -ErrorAction SilentlyContinue)
    }
    if (-not $commandExists) {
        [Console]::Error.WriteLine('T3_ACP_MCP_CALL 指向的可执行文件不存在。')
        exit 3
    }

    $asciiJson | & $mcpCall delegate_task -
    $invocationSucceeded = $?
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) {
        $exitCode = if ($invocationSucceeded) { 0 } else { 1 }
    }
    if ($exitCode -ne 0) {
        [Console]::Error.WriteLine("delegate_task 调用失败，退出码: $exitCode")
    }
    exit $exitCode
}
catch {
    [Console]::Error.WriteLine($_.Exception.Message)
    exit 1
}
