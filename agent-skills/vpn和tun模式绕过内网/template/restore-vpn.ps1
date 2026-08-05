#Requires -Version 5.1
<#
.SYNOPSIS
  一键恢复 FlClash + 双网卡环境：跃点、内网静态路由、系统代理。

.DESCRIPTION
  幂等脚本，可重复执行。对应 skill「vpn和tun模式绕过内网」quick-reference 四步走。

.PARAMETER Status
  只读诊断，不修改系统。

.PARAMETER SkipMetric
  跳过接口跃点修复。

.PARAMETER SkipRoute
  跳过内网静态路由。

.PARAMETER SkipProxy
  跳过系统代理启用。

.NOTES
  不要做什么（反例）:
  - 不要在 FlClash 未运行时期望外网恢复（脚本只修系统层，不启动 FlClash）
  - 不要把 ProxyOverride 清空（脚本保留现有绕过列表，清空会导致内网也走代理）
  - 不要手动把 WLAN metric 设为 0（会与 TUN 冲突，脚本默认 10）
  - 不要删除以太网的 AutomaticMetric=Disabled（否则重连后跃点回弹）
  - 不要在未插网线时强制添加 10.0.0.0/8 路由（网关不可达会导致黑洞路由）

.EXAMPLE
  .\restore-vpn.ps1
  # 完整修复：跃点 + 路由 + 代理 + 验收

.EXAMPLE
  .\restore-vpn.ps1 -Status
  # 只读诊断，不改系统

.EXAMPLE
  .\restore-vpn.ps1 -SkipMetric -SkipRoute
  # 仅修系统代理（无需管理员）
#>
[CmdletBinding(SupportsShouldProcess)]
param(
    [switch]$Status,
    [switch]$SkipMetric,
    [switch]$SkipRoute,
    [switch]$SkipProxy
)

$Config = @{
    WlanAlias       = 'WLAN'
    EthAlias        = '以太网'
    WlanMetric      = 10
    EthMetric       = 25
    IntranetNet     = '10.0.0.0'
    IntranetMask    = '255.0.0.0'
    EthGateway      = '10.17.77.1'
    RouteMetric     = 5
    ProxyServer     = '127.0.0.1:7890'
    FlClashPort     = 7890
    TestIntranet    = '10.17.196.39'
    TestIntranetUrl = 'https://t-cloud.lanniu.top/'
    TestInternet    = 'https://www.google.com/generate_204'
}

$ProxyRegPath = 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings'

function Write-Step {
    param([string]$Text)
    Write-Host ""
    Write-Host "== $Text ==" -ForegroundColor Cyan
}

function Test-IsAdmin {
    $principal = New-Object Security.Principal.WindowsPrincipal(
        [Security.Principal.WindowsIdentity]::GetCurrent()
    )
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-EthAdapter {
    $eth = Get-NetAdapter -Name $Config.EthAlias -ErrorAction SilentlyContinue |
        Where-Object { $_.Status -eq 'Up' } |
        Select-Object -First 1

    if ($eth) { return $eth }

    return Get-NetAdapter -Physical -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Status -eq 'Up' -and
            $_.Name -notin @($Config.WlanAlias, 'FlClash', 'Tailscale') -and
            $_.InterfaceDescription -notmatch 'Hyper-V|Virtual|VPN|TAP|TUN|Bluetooth'
        } |
        Select-Object -First 1
}

function Get-EthGateway {
    param([int]$IfIndex)

    $gw = (Get-NetIPConfiguration -InterfaceIndex $IfIndex -ErrorAction SilentlyContinue).IPv4DefaultGateway.NextHop
    if ($gw) { return $gw }
    return $Config.EthGateway
}

function Invoke-ProxyRefresh {
    Add-Type -Namespace WinInet -Name Native -ErrorAction SilentlyContinue -MemberDefinition @"
[System.Runtime.InteropServices.DllImport("wininet.dll", SetLastError=true)]
public static extern bool InternetSetOption(System.IntPtr hInternet, int dwOption, System.IntPtr lpBuffer, int dwBufferLength);
"@
    [void][WinInet.Native]::InternetSetOption([IntPtr]::Zero, 39, [IntPtr]::Zero, 0)
    [void][WinInet.Native]::InternetSetOption([IntPtr]::Zero, 37, [IntPtr]::Zero, 0)
}

function Test-FlClashPort {
  $conn = Get-NetTCPConnection -LocalPort $Config.FlClashPort -State Listen -ErrorAction SilentlyContinue |
      Select-Object -First 1
  return [bool]$conn
}

function Get-DiagSnapshot {
    $proxy = Get-ItemProperty -Path $ProxyRegPath -ErrorAction SilentlyContinue
    $wlanIf = Get-NetIPInterface -InterfaceAlias $Config.WlanAlias -AddressFamily IPv4 -ErrorAction SilentlyContinue
    $eth = Get-EthAdapter
    $ethIf = $null
    $ethGw = $Config.EthGateway
    if ($eth) {
        $ethIf = Get-NetIPInterface -InterfaceIndex $eth.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue
        $ethGw = Get-EthGateway -IfIndex $eth.ifIndex
    }
    $route = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '10.0.0.0/8' -ErrorAction SilentlyContinue |
        Select-Object -First 1

    return [PSCustomObject]@{
        ProxyEnable   = $proxy.ProxyEnable
        ProxyServer   = $proxy.ProxyServer
        WlanMetric    = $wlanIf.InterfaceMetric
        WlanAutoMet   = $wlanIf.AutomaticMetric
        EthAlias      = if ($eth) { $eth.Name } else { $null }
        EthIfIndex    = if ($eth) { $eth.ifIndex } else { $null }
        EthMetric     = $ethIf.InterfaceMetric
        EthAutoMet    = $ethIf.AutomaticMetric
        EthGateway    = $ethGw
        HasIntranetRt  = [bool]$route
        RouteNextHop  = $route.NextHop
        FlClashListen = Test-FlClashPort
        FlClashProc   = [bool](Get-Process FlClashCore -ErrorAction SilentlyContinue)
    }
}

function Show-Diag {
    param($Snap)
    Write-Step "当前状态"
    Write-Host ("系统代理: ProxyEnable={0}  ProxyServer={1}" -f $Snap.ProxyEnable, $Snap.ProxyServer)
    Write-Host ("WLAN: metric={0}  autoMetric={1}" -f $Snap.WlanMetric, $Snap.WlanAutoMet)
    if ($Snap.EthAlias) {
        Write-Host ("以太网 [{0}] idx={1} metric={2} autoMetric={3} gw={4}" -f `
                $Snap.EthAlias, $Snap.EthIfIndex, $Snap.EthMetric, $Snap.EthAutoMet, $Snap.EthGateway)
    } else {
        Write-Host "以太网: 未检测到 Up 的物理网卡" -ForegroundColor Yellow
    }
  if ($Snap.HasIntranetRt) {
        Write-Host ("内网路由 10.0.0.0/8 -> {0}" -f $Snap.RouteNextHop) -ForegroundColor Green
    } else {
        Write-Host "内网路由 10.0.0.0/8: 缺失" -ForegroundColor Red
    }
    Write-Host ("FlClash 进程: {0}  端口 {1}: {2}" -f `
            $(if ($Snap.FlClashProc) { '运行中' } else { '未运行' }), `
            $Config.FlClashPort, `
            $(if ($Snap.FlClashListen) { '监听' } else { '未监听' }))
}

function Set-IfMetric {
    param(
        [string]$Alias,
        [int]$Metric
    )
    $if = Get-NetIPInterface -InterfaceAlias $Alias -AddressFamily IPv4 -ErrorAction SilentlyContinue
    if (-not $if) {
        Write-Host "跳过跃点: 找不到接口 $Alias" -ForegroundColor Yellow
        return
    }
    if ($if.InterfaceMetric -eq $Metric -and $if.AutomaticMetric -eq 'Disabled') {
        Write-Host "跃点已正确: $Alias metric=$Metric" -ForegroundColor DarkGray
        return
    }
    if ($PSCmdlet.ShouldProcess("$Alias metric=$Metric", "Set-NetIPInterface")) {
        Set-NetIPInterface -InterfaceAlias $Alias -AddressFamily IPv4 -AutomaticMetric Disabled -InterfaceMetric $Metric
        Write-Host "已设置: $Alias metric=$Metric (AutomaticMetric=Disabled)" -ForegroundColor Green
    }
}

function Ensure-IntranetRoute {
    param(
        [int]$IfIndex,
        [string]$Gateway
    )
    $existing = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '10.0.0.0/8' -ErrorAction SilentlyContinue |
        Select-Object -First 1
    if ($existing -and $existing.ifIndex -eq $IfIndex -and $existing.NextHop -eq $Gateway) {
        Write-Host "内网路由已存在: 10.0.0.0/8 -> $Gateway if $IfIndex" -ForegroundColor DarkGray
        return
    }
    if ($existing) {
        Write-Host "删除旧路由 10.0.0.0/8 (if=$($existing.ifIndex) gw=$($existing.NextHop))" -ForegroundColor Yellow
        route delete $Config.IntranetNet | Out-Null
    }
    $cmd = "route add -p $($Config.IntranetNet) mask $($Config.IntranetMask) $Gateway metric $($Config.RouteMetric) if $IfIndex"
    Write-Host "执行: $cmd"
    cmd /c $cmd | Out-Host
    if ($LASTEXITCODE -ne 0) {
        throw "添加静态路由失败 (exit=$LASTEXITCODE)"
    }
    Write-Host "已添加持久路由: 10.0.0.0/8 -> $Gateway if $IfIndex" -ForegroundColor Green
}

function Enable-SystemProxy {
    $proxy = Get-ItemProperty -Path $ProxyRegPath -ErrorAction SilentlyContinue
    if ($proxy.ProxyEnable -eq 1 -and $proxy.ProxyServer -eq $Config.ProxyServer) {
        Write-Host "系统代理已启用: $($Config.ProxyServer)" -ForegroundColor DarkGray
    } else {
        Set-ItemProperty -Path $ProxyRegPath -Name ProxyEnable -Value 1 -Type DWord
        Set-ItemProperty -Path $ProxyRegPath -Name ProxyServer -Value $Config.ProxyServer -Type String
        Write-Host "已启用系统代理: $($Config.ProxyServer)" -ForegroundColor Green
    }
    Invoke-ProxyRefresh
    Write-Host "已通知 WinINet 刷新（Chrome 可感知）" -ForegroundColor Green
}

function Test-HttpStatus {
    param(
        [string]$Url,
        [string]$Proxy = $null,
        [int]$TimeoutSec = 12
    )
    if ($Proxy) {
        $outFile = Join-Path $env:TEMP ("rvpn-" + [guid]::NewGuid().ToString('N') + '.tmp')
        $curlArgs = @('-4', '-sS', '-o', $outFile, '-w', '%{http_code}',
                      '--connect-timeout', "$TimeoutSec", '-x', $Proxy, $Url)
        try {
            $code = & curl.exe @curlArgs 2>$null
            if ($code -match '^\d{3}$') { return [int]$code }
        } catch { }
        finally { Remove-Item -LiteralPath $outFile -Force -ErrorAction SilentlyContinue }
        return 0
    }

    try {
        $resp = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        return [int]$resp.StatusCode
    } catch {
        $inner = $_.Exception.Response
        if ($inner -and $inner.StatusCode) { return [int]$inner.StatusCode }
    }
    return 0
}

function Run-Verification {
    $results = @()

    $proxy = Get-ItemProperty -Path $ProxyRegPath -ErrorAction SilentlyContinue
    $okProxy = ($proxy.ProxyEnable -eq 1)
    $results += [PSCustomObject]@{
        Name    = '系统代理'
        Pass    = $okProxy
        Detail  = "ProxyEnable=$($proxy.ProxyEnable)"
        Hint    = 'FlClash 仪表盘打开「系统代理」，或重新运行本脚本'
    }

    $okPort = Test-FlClashPort
    $results += [PSCustomObject]@{
        Name    = "FlClash 端口 $($Config.FlClashPort)"
        Pass    = $okPort
        Detail  = $(if ($okPort) { 'Listen' } else { '未监听' })
        Hint    = '先启动 FlClash，确认 mixed-port 为 7890'
    }

    $route = Get-NetRoute -AddressFamily IPv4 -DestinationPrefix '10.0.0.0/8' -ErrorAction SilentlyContinue |
        Select-Object -First 1
    $okRoute = [bool]$route
    $results += [PSCustomObject]@{
        Name    = '内网路由 10.0.0.0/8'
        Pass    = $okRoute
        Detail  = $(if ($route) { "-> $($route.NextHop) if $($route.ifIndex)" } else { '缺失' })
        Hint    = '以管理员运行本脚本添加持久路由'
    }

    $intraCode = Test-HttpStatus -Url $Config.TestIntranetUrl
    $okIntra = ($intraCode -ge 200 -and $intraCode -lt 500)
    $results += [PSCustomObject]@{
        Name    = '内网 HTTPS'
        Pass    = $okIntra
        Detail  = "$($Config.TestIntranetUrl) HTTP $intraCode"
        Hint    = '检查以太网是否 Up、网关与 10.0.0.0/8 路由'
    }

    $extCode = Test-HttpStatus -Url $Config.TestInternet -Proxy "http://$($Config.ProxyServer)"
    $okExt = ($extCode -eq 204 -or ($extCode -ge 200 -and $extCode -lt 400))
    $results += [PSCustomObject]@{
        Name    = '外网（经代理）'
        Pass    = $okExt
        Detail  = "Google generate_204 HTTP $extCode"
        Hint    = 'FlClash 选国外节点；Chrome 需重开或 chrome://net-internals/#proxy'
    }

    Write-Step "验收摘要"
    foreach ($r in $results) {
        $color = if ($r.Pass) { 'Green' } else { 'Red' }
        $mark = if ($r.Pass) { 'PASS' } else { 'FAIL' }
        Write-Host ("[{0}] {1} — {2}" -f $mark, $r.Name, $r.Detail) -ForegroundColor $color
        if (-not $r.Pass) {
            Write-Host ("      提示: {0}" -f $r.Hint) -ForegroundColor Yellow
        }
    }

    $failCount = @($results | Where-Object { -not $_.Pass }).Count
    Write-Host ""
    if ($failCount -eq 0) {
        Write-Host "全部通过。若 Chrome 仍异常，请完全退出后重开。" -ForegroundColor Green
    } else {
        Write-Host "$failCount 项未通过，请按提示排查。" -ForegroundColor Yellow
    }
    return ($failCount -eq 0)
}

# --- main ---
Write-Host "VPN 一键恢复 (restore-vpn.ps1)" -ForegroundColor Cyan
$snap = Get-DiagSnapshot
Show-Diag -Snap $snap

if ($Status) {
    Write-Step "只读模式 (-Status)，未修改系统"
    Run-Verification | Out-Null
    exit 0
}

$needAdmin = (-not $SkipMetric) -or (-not $SkipRoute)
if ($needAdmin -and -not (Test-IsAdmin)) {
    Write-Host ""
    Write-Host "跃点/静态路由需要管理员权限。请双击 restore-vpn.bat，或以管理员运行 PowerShell。" -ForegroundColor Red
    Write-Host "若只修系统代理（无需管理员），请运行: .\restore-vpn.ps1 -SkipMetric -SkipRoute" -ForegroundColor Yellow
    exit 1
}

# 前置：FlClash 进程检查
if (-not (Get-Process FlClashCore -ErrorAction SilentlyContinue)) {
    Write-Host ""
    Write-Host "警告: FlClash 未运行。代理修复后仍需 FlClash 才能上外网。" -ForegroundColor Yellow
    Write-Host "  如果只需修内网路由/跃点，可继续；外网验收会 FAIL。" -ForegroundColor Yellow
}

$stepErrors = @()

if (-not $SkipMetric) {
    Write-Step "1/3 接口跃点"
    try {
        Set-IfMetric -Alias $Config.WlanAlias -Metric $Config.WlanMetric
    } catch {
        $stepErrors += "WLAN 跃点: $_"
        Write-Host "跃点设置失败: $_" -ForegroundColor Red
    }
    $eth = Get-EthAdapter
    if ($eth) {
        try {
            Set-IfMetric -Alias $eth.Name -Metric $Config.EthMetric
        } catch {
            $stepErrors += "以太网跃点: $_"
            Write-Host "以太网跃点设置失败: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "以太网未连接，跳过以太网跃点" -ForegroundColor Yellow
    }
}

if (-not $SkipRoute) {
    Write-Step "2/3 内网静态路由"
    $eth = Get-EthAdapter
    if (-not $eth) {
        Write-Host "以太网未连接，跳过 10.0.0.0/8 路由（插网线后可再运行）" -ForegroundColor Yellow
    } else {
        try {
            $gw = Get-EthGateway -IfIndex $eth.ifIndex
            Ensure-IntranetRoute -IfIndex $eth.ifIndex -Gateway $gw
        } catch {
            $stepErrors += "静态路由: $_"
            Write-Host "静态路由添加失败: $_" -ForegroundColor Red
            Write-Host "  手动修复: route add -p 10.0.0.0 mask 255.0.0.0 $($Config.EthGateway) metric $($Config.RouteMetric)" -ForegroundColor Yellow
        }
    }
}

if (-not $SkipProxy) {
    Write-Step "3/3 系统代理"
    try {
        Enable-SystemProxy
    } catch {
        $stepErrors += "系统代理: $_"
        Write-Host "系统代理启用失败: $_" -ForegroundColor Red
    }
}

if ($stepErrors.Count -gt 0) {
    Write-Host ""
    Write-Host ("共 {0} 步执行出错（见上方红字），继续验收..." -f $stepErrors.Count) -ForegroundColor Yellow
}

$allOk = Run-Verification
exit $(if ($allOk) { 0 } else { 1 })
