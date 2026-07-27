# 成功案例（GREEN）

记录完整的成功配置和验证过程。

---

## ✅ 成功案例：完整四层配置

### 环境信息
```
网络拓扑：
- 以太网：10.17.77.153/24，网关 10.17.77.1，InterfaceIndex 10，Metric 25
- WiFi (WLAN)：172.20.10.5/28，网关 172.20.10.1，InterfaceIndex 9，Metric 30
- FlClash TUN：198.18.0.1/16，无网关，InterfaceIndex 45，Metric 0

目标：
- 内网 10.0.0.0/8 直连（走以太网）
- 外网走代理（TUN + WiFi）
- 浏览器和命令行都能访问外网
```

---

### 第 1 层：OS 静态路由

**命令**：
```powershell
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```

**验证**：
```powershell
PS C:\> route print | findstr "10.0.0.0"
     10.0.0.0      255.0.0.0     10.17.77.1   10.17.77.153      5
```

**效果**：
- 内网网段（10.0.0.0/8）强制走以太网
- Metric 5 虽然高于 TUN metric 0，但**网段匹配度更高**
- Windows 优先匹配最具体的网段规则

**测试**：
```powershell
PS C:\> ping 10.17.196.39
来自 10.17.196.39 的回复: 字节=32 时间<1ms TTL=62  ✅

PS C:\> tracert -d -h 5 10.17.196.39
  1    <1 ms    <1 ms    <1 ms  10.17.77.1      ← 走以太网网关  ✅
  2    <1 ms    <1 ms    <1 ms  10.17.196.39
```

---

### 第 2 层：WiFi Metric 调整

**命令**：
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
```

**验证**：
```powershell
PS C:\> Get-NetIPInterface | Select InterfaceAlias, InterfaceMetric | Sort InterfaceMetric

InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
WLAN            10      ← 已调整，优先级高于以太网  ✅
以太网          25
```

**效果**：
- WiFi 优先级从 30 提升到 10
- 外网流量优先走 WiFi（以太网无外网网关）
- TUN 使用 WiFi 作为出站接口

---

### 第 3 层：FlClash 配置

**配置文件**：`C:\Users\Administrator\.config\clash\profiles\1756186733864.yml`

```yaml
# 顶层添加
interface-name: WLAN  # 强制使用 WiFi 出站

# TUN 配置
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false  # 禁用自动检测
  inet4-route-exclude-address:
    - 10.0.0.0/8  # 排除内网网段
```

**验证**：
```powershell
PS C:\> Select-String -Path "$env:USERPROFILE\.config\clash\profiles\*.yml" -Pattern "interface-name|inet4-route-exclude"

interface-name: WLAN                           ✅
    inet4-route-exclude-address:               ✅
      - 10.0.0.0/8                            ✅
```

**重启 FlClash**：
```powershell
Stop-Process -Name "FlClash" -Force
Start-Process "C:\Program Files\FlClash\FlClash.exe"
```

**效果**：
- TUN 不拦截 10.0.0.0/8 流量
- TUN 使用 WLAN 出站（不会误用以太网）

**测试**：
```powershell
PS C:\> curl https://www.google.com
<!doctype html><html itemscope="" itemtype="http://schema.org/WebPage" lang="ja">...  ✅

PS C:\> Test-NetConnection -ComputerName planb.mojcn.com -Port 16617
ComputerName     : planb.mojcn.com
RemoteAddress    : 103.181.165.120
RemotePort       : 16617
InterfaceAlias   : FlClash                     ← 走 TUN  ✅
SourceAddress    : 198.18.0.1
TcpTestSucceeded : True                        ✅
```

---

### 第 4 层：系统代理

**命令**：
```powershell
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value "127.0.0.1:7890"
```

**验证**：
```powershell
PS C:\> Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer

ProxyEnable  ProxyServer
-----------  -----------
          1  127.0.0.1:7890  ✅
```

**重启浏览器**：
```powershell
taskkill /F /IM chrome.exe
start chrome
```

**效果**：
- 浏览器读取系统代理配置
- 浏览器流量走 HTTP 代理 `127.0.0.1:7890`
- FlClash 接收代理请求并通过 TUN 转发

**测试**：
- 浏览器访问 `https://www.google.com` → ✅ 正常打开
- 浏览器访问 `https://gemini.google.com` → ✅ 正常打开
- Kiro AI 使用 → ✅ 无地区限制错误

---

## 完整验证结果

### 内网连通性
```powershell
PS C:\> ping 10.17.196.39
来自 10.17.196.39 的回复: 字节=32 时间<1ms TTL=62  ✅

PS C:\> ping t-cloud.lanniu.top
正在 Ping t-cloud.lanniu.top [10.17.196.251] 具有 32 字节的数据:
来自 10.17.196.251 的回复: 字节=32 时间<1ms TTL=62  ✅
```

### 外网连通性（命令行）
```powershell
PS C:\> ping 8.8.8.8
来自 8.8.8.8 的回复: 字节=32 时间=76ms TTL=110  ✅

PS C:\> curl https://www.google.com
<!doctype html><html ...>  ✅
```

### 浏览器测试
- `https://www.google.com` → ✅ 正常
- `https://gemini.google.com` → ✅ 正常
- 搜索功能 → ✅ 正常

### 路由追踪验证

**内网路由**：
```powershell
PS C:\> tracert -d -h 5 10.17.196.39
  1    <1 ms    <1 ms    <1 ms  10.17.77.1      ← 以太网网关  ✅
  2    <1 ms    <1 ms    <1 ms  10.17.196.39    ← 内网目标  ✅
```

**外网路由**：
```powershell
PS C:\> Test-NetConnection 8.8.8.8 -TraceRoute
TraceRoute: 198.18.0.1                          ← 先到 TUN  ✅
            172.20.10.1                         ← 再到 WiFi 网关  ✅
            ...
```

---

## 配置总结

| 层级 | 配置项 | 命令/配置 | 效果 |
|------|--------|----------|------|
| **层 1** | OS 静态路由 | `route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10` | 内网走以太网 |
| **层 2** | WiFi Metric | `Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10` | 外网优先 WiFi |
| **层 3** | FlClash 出站接口 | `interface-name: WLAN` | TUN 使用 WiFi |
| **层 3** | FlClash 路由排除 | `inet4-route-exclude-address: [10.0.0.0/8]` | TUN 不拦截内网 |
| **层 4** | 系统代理 | `Set-ItemProperty ... ProxyEnable -Value 1` | 浏览器走代理 |

---

## 关键成功因素

### 1. 四层配合，缺一不可
- 每层解决一个具体问题
- 只配部分会导致内网或外网不通

### 2. 理解路由优先级
- **网段匹配度 > Metric**
- 10.0.0.0/8 静态路由优先于 0.0.0.0/0 默认路由

### 3. 区分命令行和浏览器
- 命令行工具（curl）直接走 TUN
- 浏览器需要系统代理

### 4. 显式指定，不依赖自动检测
- FlClash `interface-name: WLAN`（不用 auto-detect）
- 静态路由显式指定接口索引

---

## 实际使用效果

### 典型工作场景
```
上午 9:00  连接公司以太网 + 手机热点
         启动 FlClash TUN
         验证：内网 ping 通，外网正常

上午 9:30  访问内网 Jenkins：http://10.17.196.39:8080  ✅
         访问内网 Artifactory  ✅
         
上午 10:00 使用 Kiro AI 写代码  ✅ 无地区限制
         浏览 Google 查资料  ✅
         
下午 2:00  参加 Zoom 会议（需要代理）✅
         
下午 5:00  提交代码到内网 GitLab  ✅
```

### 性能指标
```
内网延迟：  < 1ms     ✅ 直连，无额外开销
外网延迟：  76-92ms   ✅ 代理节点延迟
稳定性：    全天无掉线  ✅
```

---

## 维护说明

### 持久化配置
所有配置都是持久化的（重启后保留）：
- 静态路由：`-p` 参数
- WiFi Metric：自动持久化
- FlClash 配置：保存在文件中
- 系统代理：注册表配置

### 需要重启的情况
- FlClash 配置修改后 → 重启 FlClash
- 浏览器代理设置修改后 → 重启浏览器
- OS 路由修改 → **无需**重启

### 故障恢复
若配置出错，回滚步骤：
1. 删除静态路由：`route delete 10.0.0.0`
2. 恢复 WiFi Metric：`Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 30`
3. 恢复 FlClash 配置：`Copy-Item *.yml.backup *.yml`
4. 禁用系统代理：`Set-ItemProperty ... ProxyEnable -Value 0`
