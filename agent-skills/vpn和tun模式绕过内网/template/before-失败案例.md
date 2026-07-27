# 失败案例（RED）

记录典型的错误配置和失败尝试，帮助识别问题模式。

---

## ❌ 失败案例 1：只配 FlClash route-exclude，不配 OS 静态路由

### 用户操作
1. 编辑 FlClash 配置，添加：
   ```yaml
   tun:
     inet4-route-exclude-address:
       - 10.0.0.0/8
   ```
2. 重启 FlClash
3. 测试内网连通性

### 症状
```powershell
PS C:\> ping 10.17.196.39
请求超时
```

### 根因
- FlClash `route-exclude` 只是**建议** TUN 不拦截内网
- 但 Windows 路由表仍然优先匹配 TUN (metric 0)
- 内网流量仍被导向 TUN → TUN 拒绝处理 → 超时

### 路由表现状
```
目标            掩码            网关            接口              Metric
0.0.0.0         0.0.0.0         198.18.0.1      198.18.0.1        0       ← TUN 仍是最高优先级
10.17.77.0      255.255.255.0   10.17.77.1      10.17.77.153      281     ← 以太网本地网段
```

**缺少**：
```
10.0.0.0        255.0.0.0       10.17.77.1      10.17.77.153      5       ← 静态路由缺失
```

### 正确做法
**必须**同时配置 OS 静态路由：
```powershell
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```

---

## ❌ 失败案例 2：只配 OS 静态路由，不调 WiFi metric

### 用户操作
1. 添加静态路由：
   ```powershell
   route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
   ```
2. 测试内网：✅ 通
3. 测试外网：❌ 不通

### 症状
```powershell
PS C:\> ping 10.17.196.39
来自 10.17.196.39 的回复: 字节=32 时间<1ms TTL=62  ✅

PS C:\> curl https://www.google.com
curl: (35) schannel: failed to receive handshake, SSL/TLS connection failed  ❌
```

### 根因
- 内网静态路由生效，内网流量走以太网 ✅
- 但**外网流量仍优先走以太网**（metric 25 < WiFi metric 30）
- 以太网已禁用外网网关（只能访问内网）→ curl 失败

### 接口 Metric 现状
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
以太网          25      ← 优先级高于 WiFi
WLAN            30      ← 优先级低，外网流量走不到这里
```

### 路由决策流程
```
访问 www.google.com (142.250.x.x)
    ↓
不匹配 10.0.0.0/8 静态路由
    ↓
匹配默认路由 → TUN (metric 0)
    ↓
TUN 需要出站接口
    ↓
选择 metric 最低的物理接口 → 以太网 (25)  ← 错误！
    ↓
以太网无外网网关 → 失败
```

### 正确做法
**必须**调整 WiFi metric，让 TUN 使用 WiFi 出站：
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
```

**同时**在 FlClash 配置中指定出站接口：
```yaml
interface-name: WLAN
```

---

## ❌ 失败案例 3：curl 通但浏览器不通（系统代理未启用）

### 用户操作
1. 配置了静态路由、WiFi metric、FlClash
2. 测试：
   ```powershell
   curl https://www.google.com  # ✅ 成功
   ```
3. 打开浏览器访问 `https://www.google.com` → ❌ 超时

### 症状
```powershell
PS C:\> curl https://www.google.com
<!doctype html><html ...>  ✅ 成功

PS C:\> Test-NetConnection -ComputerName planb.mojcn.com -Port 16617
TcpTestSucceeded : True  ✅ 代理节点可达
```

**但浏览器**：
```
无法访问此网站
www.google.com 的响应时间过长
ERR_TIMED_OUT
```

### 根因
- `curl` 等命令行工具**直接走 TUN**
- **浏览器不直接走 TUN**，需要读取系统代理设置
- 系统代理未启用 (`ProxyEnable = 0`) → 浏览器直连 → 被墙

### 系统代理状态
```powershell
PS C:\> Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer

ProxyEnable  ProxyServer
-----------  -----------
          0              ← 未启用，浏览器直连
```

### 数据流对比

**curl（成功）**：
```
curl 请求
    ↓
Windows 路由表 → TUN (metric 0)
    ↓
TUN 使用 WLAN 出站
    ↓
代理服务器 → Google  ✅
```

**浏览器（失败）**：
```
浏览器请求
    ↓
检查系统代理 → ProxyEnable = 0
    ↓
直连（不走 TUN）
    ↓
被墙 / 超时  ❌
```

### 正确做法
**必须**启用系统代理：
```powershell
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value "127.0.0.1:7890"
```

**然后重启浏览器**：
```powershell
taskkill /F /IM chrome.exe
start chrome
```

---

## ❌ 失败案例 4：FlClash 未指定 interface-name

### 用户操作
1. 配置了静态路由、WiFi metric
2. FlClash 配置只有：
   ```yaml
   tun:
     enable: true
     auto-detect-interface: true  # 自动检测
   ```
3. 测试外网 → ❌ 不稳定

### 症状
```powershell
PS C:\> curl https://www.google.com
# 有时成功，有时失败
curl: (35) schannel: failed to receive handshake
```

### 根因
- FlClash `auto-detect-interface: true` 会**自动选择**出站接口
- 可能选错（选到以太网而不是 WiFi）
- 以太网无外网网关 → 失败

### 正确做法
**必须**显式指定出站接口：
```yaml
interface-name: WLAN  # 强制使用 WiFi
tun:
  enable: true
  auto-detect-interface: false  # 禁用自动检测
```

---

## ❌ 失败案例 5：静态路由 metric 设置错误

### 用户操作
1. 添加静态路由，但 metric 设为 1：
   ```powershell
   route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 1 if 10
   ```
2. 测试内网 → ❌ 不通

### 症状
```powershell
PS C:\> ping 10.17.196.39
请求超时
```

### 根因
- 静态路由 metric 1 **仍然高于 TUN metric 0**
- Windows 优先匹配 TUN 默认路由
- 虽然 10.0.0.0/8 更具体，但在某些配置下仍被 TUN 拦截

### 正确做法
使用推荐的 metric 5-10：
```powershell
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```

---

## 失败模式总结

| 失败模式 | 症状 | 根因 | 修复 |
|---------|------|------|------|
| 只配 FlClash route-exclude | 内网不通 | OS 路由表仍导向 TUN | 添加静态路由 |
| 只配静态路由 | 外网不通 | TUN 使用以太网出站（无网关） | 调整 WiFi metric + 指定 interface-name |
| 系统代理未启用 | curl 通但浏览器不通 | 浏览器不走 TUN，需要系统代理 | 启用系统代理 |
| 未指定 interface-name | 外网不稳定 | FlClash 自动选择可能选错 | 强制指定 WLAN |
| 静态路由 metric 过低 | 内网不通 | metric 1 仍低于某些默认路由 | 使用 metric 5-10 |

---

## 共同特征

所有失败案例的共同问题：
1. **只配置了四层中的部分**，没有全部配合
2. **对路由优先级机制理解不足**
3. **忽略了浏览器和命令行工具的差异**

**正确方案必须四层配合**：
1. OS 静态路由（强制内网）
2. WiFi metric 调整（外网优先 WiFi）
3. FlClash 配置（出站接口 + 路由排除）
4. 系统代理（浏览器必需）
