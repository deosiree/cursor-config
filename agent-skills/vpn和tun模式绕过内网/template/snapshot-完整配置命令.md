# 完整配置命令手册

本文档提供从 0 到完成的所有配置命令，可直接复制执行。

## 环境信息示例

```
网络拓扑：
- 以太网：10.17.77.153/24，网关 10.17.77.1，InterfaceIndex 10
- WiFi (WLAN)：172.20.10.5/28，网关 172.20.10.1，InterfaceIndex 9
- FlClash TUN：198.18.0.1/16，无网关，InterfaceIndex 45

目标：
- 内网 10.0.0.0/8 直连（走以太网）
- 外网走代理（TUN + WiFi）
```

---

## 步骤 0：诊断当前状态

### 查看网卡信息
```powershell
# 查看所有网卡
Get-NetAdapter | Select Name, InterfaceIndex, Status

# 查看 IP 和网关
Get-NetIPConfiguration | Select InterfaceAlias, IPv4Address, IPv4DefaultGateway

# 查看 metric
Get-NetIPInterface | Select InterfaceAlias, InterfaceMetric | Sort InterfaceMetric
```

**预期输出**：
```
Name          InterfaceIndex  Status
----          --------------  ------
以太网        10              Up
WLAN          9               Up
FlClash       45              Up

InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
WLAN            30
以太网          25
```

### 查看路由表
```powershell
route print
```

---

## 步骤 1：备份配置

### 备份 FlClash 配置
```powershell
$configPath = "$env:USERPROFILE\.config\clash\profiles"
$latestConfig = Get-ChildItem "$configPath\*.yml" | Sort LastWriteTime -Descending | Select -First 1
Copy-Item $latestConfig.FullName "$($latestConfig.FullName).backup"

Write-Host "已备份：$($latestConfig.FullName).backup"
```

---

## 步骤 2：添加静态路由

### 原理
- Windows 使用 **metric（跃点数）** 决定路由优先级
- **数字越小，优先级越高**
- **更具体的网段规则优先于默认路由**（即使 metric 更高）

**配置前**：
```
目标            掩码            网关            接口              Metric
0.0.0.0         0.0.0.0         198.18.0.1      198.18.0.1        0       ← TUN 拦截所有
```

**配置后**：
```
目标            掩码            网关            接口              Metric
10.0.0.0        255.0.0.0       10.17.77.1      10.17.77.153      5       ← 内网走这条
0.0.0.0         0.0.0.0         198.18.0.1      198.18.0.1        0       ← 其他走 TUN
```

### 命令
```powershell
# 添加持久化静态路由
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10

# 验证
route print | findstr "10.0.0.0"
```

**预期输出**：
```
     10.0.0.0      255.0.0.0     10.17.77.1   10.17.77.153      5
```

**参数说明**：
- `-p`: 持久化（Persistent），重启后保留
- `10.0.0.0`: 目标网段（内网 A 类）
- `mask 255.0.0.0`: 子网掩码（/8）
- `10.17.77.1`: 以太网网关
- `metric 5`: 路由优先级（比 TUN 的 0 具体，但数字更高）
- `if 10`: 以太网接口索引

---

## 步骤 3：调整 WiFi 跃点数优先级

### 原理
- **跃点数（metric）越小，网卡优先级越高**
- 当前 WiFi metric 30 低于以太网 25
- 需要提升 WiFi 到 10，让外网流量优先走 WiFi

**配置前**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
以太网          25      ← 优先级高于 WiFi
WLAN            30      ← 优先级低
```

**配置后**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
WLAN            10      ← 优先级提升
以太网          25
```

### 命令
```powershell
# 查看当前 metric
Get-NetIPInterface -InterfaceAlias "WLAN" | Select InterfaceAlias, InterfaceMetric

# 调整 WiFi metric 为 10（提高优先级）
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10

# 验证
Get-NetIPInterface -InterfaceAlias "WLAN" | Select InterfaceAlias, InterfaceMetric
```

**预期输出**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
WLAN            10              ← 已修改
```

---

## 步骤 4：配置 FlClash

### 原理
- **interface-name**: 强制 TUN 使用指定网卡出站
- **inet4-route-exclude-address**: 让 TUN 不拦截特定网段

### 定位配置文件
```powershell
# 查找配置文件
Get-ChildItem "$env:USERPROFILE\.config\clash\profiles\*.yml" | Select FullName, LastWriteTime
```

### 修改配置
编辑 `C:\Users\Administrator\.config\clash\profiles\<数字>.yml`：

```yaml
# 在顶层添加（与 proxies、rules 同级）
interface-name: WLAN  # 强制使用 WiFi 出站

# 在 tun 部分修改
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false  # 禁用自动检测，强制使用 interface-name
  inet4-route-exclude-address:
    - 10.0.0.0/8  # 排除内网网段
```

**完整示例**：
```yaml
port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
external-controller: 127.0.0.1:9090

# ↓↓↓ 新增：强制使用 WiFi
interface-name: WLAN

proxies:
  - name: "香港节点"
    type: trojan
    server: planb.mojcn.com
    port: 16617
    password: "your-password"
    skip-cert-verify: false

tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false  # ↓↓↓ 新增：禁用自动检测
  # ↓↓↓ 新增：排除内网
  inet4-route-exclude-address:
    - 10.0.0.0/8

rules:
  - DOMAIN-SUFFIX,google.com,PROXY
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

### 验证配置
```powershell
# 检查配置是否包含关键字段
Select-String -Path "$env:USERPROFILE\.config\clash\profiles\*.yml" -Pattern "interface-name|inet4-route-exclude"
```

**预期输出**：
```
interface-name: WLAN
    inet4-route-exclude-address:
      - 10.0.0.0/8
```

---

## 步骤 5：启用系统代理

### 原理
- **curl** 等命令行工具直接走 TUN
- **浏览器**需要读取系统代理设置
- FlClash 提供 HTTP 代理：`127.0.0.1:7890`

### 命令
```powershell
# 检查当前代理状态
Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer

# 启用系统代理
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1

# 设置代理服务器地址
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value "127.0.0.1:7890"

# 验证
Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer
```

**预期输出**：
```
ProxyEnable  ProxyServer
-----------  -----------
          1  127.0.0.1:7890
```

---

## 步骤 6：重启服务

### 重启 FlClash
```powershell
# 关闭 FlClash（替换为实际进程名）
Stop-Process -Name "FlClash" -Force

# 手动启动 FlClash（或使用快捷方式）
Start-Process "C:\Program Files\FlClash\FlClash.exe"
```

### 重启浏览器
```powershell
# 关闭 Chrome
taskkill /F /IM chrome.exe

# 启动 Chrome
start chrome
```

---

## 步骤 7：验证配置

### 测试内网连通性
```powershell
# Ping 内网 IP
ping 10.17.196.39 -n 4

# Ping 内网域名
ping t-cloud.lanniu.top -n 4
```

**预期结果**：
```
来自 10.17.196.39 的回复: 字节=32 时间<1ms TTL=62  ✅
```

### 测试外网连通性（命令行）
```powershell
# Curl 外网
curl https://www.google.com

# 测试代理节点
Test-NetConnection -ComputerName planb.mojcn.com -Port 16617

# 测试 Google DNS
Test-NetConnection 8.8.8.8
```

**预期结果**：
```
curl: 返回 HTML 内容（可能是日文）  ✅
TcpTestSucceeded: True  ✅
PingSucceeded: True  ✅
```

### 测试浏览器
1. 打开浏览器
2. 访问 `https://www.google.com`
3. 访问 `https://gemini.google.com`

**预期结果**：页面正常打开 ✅

---

## 步骤 8：验证路由走向

### 查看内网路由
```powershell
# 查看 10.0.0.0/8 的路由
Get-NetRoute -DestinationPrefix 10.0.0.0/8 | Select InterfaceAlias, NextHop, RouteMetric

# 路由追踪
tracert -d -h 5 10.17.196.39
```

**预期输出**：
```
InterfaceAlias  NextHop      RouteMetric
--------------  -------      -----------
以太网          10.17.77.1   5           ✅ 走以太网
```

### 查看外网路由
```powershell
# 查看默认路由
Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select InterfaceAlias, NextHop, RouteMetric

# 路由追踪（外网）
tracert -d -h 5 8.8.8.8
```

**预期输出**：
```
InterfaceAlias  NextHop        RouteMetric
--------------  -------        -----------
FlClash         198.18.0.1     0           ✅ 走 TUN
```

---

## 完整配置总结

| 配置项 | 命令 | 预期结果 |
|--------|------|---------|
| **静态路由** | `route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10` | 内网走以太网 |
| **WiFi metric** | `Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10` | WiFi 优先级提升 |
| **FlClash 出站接口** | `interface-name: WLAN` | TUN 使用 WiFi |
| **FlClash 路由排除** | `inet4-route-exclude-address: [10.0.0.0/8]` | TUN 不拦截内网 |
| **系统代理** | `Set-ItemProperty ... ProxyEnable -Value 1` | 浏览器走代理 |

---

## 回滚命令

### 删除静态路由
```powershell
route delete 10.0.0.0
```

### 恢复 WiFi metric
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 30
```

### 恢复 FlClash 配置
```powershell
$configPath = "$env:USERPROFILE\.config\clash\profiles"
$latestConfig = Get-ChildItem "$configPath\*.yml" | Sort LastWriteTime -Descending | Select -First 1
Copy-Item "$($latestConfig.FullName).backup" $latestConfig.FullName
```

### 禁用系统代理
```powershell
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 0
```
