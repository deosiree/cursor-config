# Windows 静态路由添加脚本
# 用途：手动添加静态路由，让指定网段绕过 TUN

# ==========================================
# 配置参数（修改这里）
# ==========================================

# 目标网段（你要访问的内网网段）
$targetSubnet = "10.17.196.0"
$subnetMask = "255.255.255.0"

# 物理网关（你的路由器 IP）
$gateway = "10.17.77.1"

# 路由优先级（小于 TUN 的 metric，通常 5-10 即可）
$metric = 5

# ==========================================
# 脚本主体（不要修改）
# ==========================================

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "   需要管理员权限" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "请以管理员身份运行此脚本：" -ForegroundColor Yellow
    Write-Host "  1. 右键点击 PowerShell" -ForegroundColor White
    Write-Host "  2. 选择「以管理员身份运行」" -ForegroundColor White
    Write-Host ""
    Write-Host "或手动运行以下命令：" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "route add $targetSubnet mask $subnetMask $gateway metric $metric" -ForegroundColor Green
    Write-Host ""
    pause
    exit 1
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Windows 静态路由添加" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查路由是否已存在
$existingRoute = route print -4 | Select-String -Pattern "$targetSubnet"

if ($existingRoute) {
    Write-Host "⚠️  路由已存在：" -ForegroundColor Yellow
    Write-Host $existingRoute
    Write-Host ""
    $confirm = Read-Host "是否删除并重新添加？(y/n)"
    
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        route delete $targetSubnet
        Write-Host "✅ 已删除旧路由" -ForegroundColor Green
    } else {
        Write-Host "操作已取消" -ForegroundColor Yellow
        pause
        exit 0
    }
}

# 添加路由
Write-Host "正在添加路由..." -ForegroundColor Cyan
Write-Host "  目标网段: $targetSubnet/$subnetMask" -ForegroundColor White
Write-Host "  网关:     $gateway" -ForegroundColor White
Write-Host "  Metric:   $metric" -ForegroundColor White
Write-Host ""

$result = route add $targetSubnet mask $subnetMask $gateway metric $metric 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 路由添加成功！" -ForegroundColor Green
    Write-Host ""
    
    # 验证
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   验证路由" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $newRoute = route print -4 | Select-String -Pattern "$targetSubnet"
    Write-Host $newRoute -ForegroundColor Green
    Write-Host ""
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   测试访问" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # 提取目标 IP（去掉 /24 等后缀）
    $targetIP = $targetSubnet -replace '\.0$', '.1'  # 假设 .1 是常见的主机
    
    Write-Host "Ping 测试 $targetIP..." -ForegroundColor Cyan
    $pingResult = Test-Connection -ComputerName $targetIP -Count 2 -ErrorAction SilentlyContinue
    
    if ($pingResult) {
        Write-Host "✅ Ping 成功！" -ForegroundColor Green
        Write-Host "  平均响应时间: $($pingResult.ResponseTime | Measure-Object -Average | Select-Object -ExpandProperty Average)ms" -ForegroundColor White
    } else {
        Write-Host "⚠️  Ping 失败，但路由已添加" -ForegroundColor Yellow
        Write-Host "  可能原因：" -ForegroundColor White
        Write-Host "    - 目标设备未开机" -ForegroundColor Gray
        Write-Host "    - 防火墙阻止 ICMP" -ForegroundColor Gray
        Write-Host "    - 目标 IP 不正确" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   注意事项" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  此路由在系统重启后会失效" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "如需永久路由，请运行：" -ForegroundColor White
    Write-Host "route add $targetSubnet mask $subnetMask $gateway metric $metric -p" -ForegroundColor Green
    Write-Host ""
    
} else {
    Write-Host "❌ 路由添加失败：" -ForegroundColor Red
    Write-Host $result -ForegroundColor Red
    Write-Host ""
    Write-Host "可能原因：" -ForegroundColor Yellow
    Write-Host "  1. 网关 IP 不正确" -ForegroundColor White
    Write-Host "  2. 网络接口不存在" -ForegroundColor White
    Write-Host "  3. 路由表已满" -ForegroundColor White
}

Write-Host ""
pause
