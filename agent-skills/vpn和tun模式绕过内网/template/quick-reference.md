# 快速参考卡片（5 分钟速查）

本文档提供最常用的命令和配置，适合快速查阅和复制粘贴。

---

## 🚀 核心配置四步走

```powershell
# 1️⃣ 添加静态路由（内网走以太网）
route add -p 10.0.0.0 mask 255.0.0.0 <内网网关IP> metric 5 if <以太网接口索引>
# 示例：route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10

# 2️⃣ 调整 WiFi 优先级（外网优先 WiFi）
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10

# 3️⃣ 启用系统代理（浏览器必需）
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1

# 4️⃣ FlClash 配置（在 yml 文件中添加）
# interface-name: WLAN
# tun:
#   inet4-route-exclude-address:
#     - 10.0.0.0/8
```

---

## 🔍 快速诊断命令

```powershell
# 查看网卡信息
Get-NetAdapter | Select Name, InterfaceIndex, Status

# 查看 metric（越小越优先）
Get-NetIPInterface | Select InterfaceAlias, InterfaceMetric | Sort InterfaceMetric

# 查看路由表
route print

# 查看静态路由是否存在
route print | findstr "10.0.0.0"

# 查看系统代理状态
Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer
```

---

## 🧪 快速测试命令

```powershell
# 测试内网
ping 10.17.196.39

# 测试外网（命令行）
curl https://www.google.com

# 测试代理节点
Test-NetConnection <代理服务器> -Port <端口>
# 示例：Test-NetConnection planb.mojcn.com -Port 16617

# 浏览器测试
# 手动访问 https://www.google.com
```

---

## ❌ 常见问题快速定位

| 症状 | 原因 | 快速修复 |
|------|------|---------|
| 内网不通 | 缺静态路由 | `route add -p 10.0.0.0 mask 255.0.0.0 <网关> metric 5 if <接口>` |
| 外网 curl 不通 | WiFi metric 过高 | `Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10` |
| 浏览器不通（curl 通）| 系统代理未启用 | `Set-ItemProperty ... ProxyEnable -Value 1` |

---

## 🎯 关键原理速记

### Metric（跃点数）= 优先级
- **数字越小，优先级越高**
- TUN (0) > WiFi (10) > 以太网 (25)

### 路由匹配规则
- **网段匹配度 > Metric**
- 10.0.0.0/8 静态路由优先于 0.0.0.0/0 默认路由

### 四层配合
```
静态路由 (metric 5) → 内网走以太网
    ↓
WiFi metric (10) → 外网优先 WiFi
    ↓
FlClash (interface-name: WLAN) → TUN 使用 WiFi 出站
    ↓
系统代理 (ProxyEnable=1) → 浏览器走代理
```

---

## 🔧 常用参数速查

### 网段 / 子网掩码对照
| 网段 | 子网掩码 | CIDR | 说明 |
|------|---------|------|------|
| 10.0.0.0 | 255.0.0.0 | /8 | A 类私网（最常用）|
| 192.168.0.0 | 255.255.0.0 | /16 | C 类私网 |
| 172.16.0.0 | 255.240.0.0 | /12 | B 类私网 |

### Metric 推荐值
| 接口类型 | 推荐 Metric | 说明 |
|---------|------------|------|
| TUN 虚拟接口 | 0 | 默认值，最高优先级 |
| 静态路由（内网）| 5-10 | 比 TUN 具体 |
| 主外网接口（WiFi）| 10-20 | 高优先级 |
| 内网接口（以太网）| 25-35 | 默认值 |

---

## 🛠️ 回滚命令

```powershell
# 删除静态路由
route delete 10.0.0.0

# 恢复 WiFi metric
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 30

# 禁用系统代理
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 0
```

---

## 📞 需要帮助？

- **完整文档**：`README.md`（含原理和时序图）
- **详细命令**：`template/snapshot-完整配置命令.md`
- **故障排查**：`template/故障排查决策树.md`
- **失败案例**：`template/before-失败案例.md`
- **成功案例**：`template/after-成功案例.md`
