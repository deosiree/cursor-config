---
name: 诊断-TUN状态
description: 检查 TUN 虚拟网卡状态、路由表、metric优先级
version: 1.0.0
tags: [诊断, TUN, 路由表]
parent: vpn和tun模式绕过内网
---

# 目标

检查 TUN 虚拟网卡是否劫持了流量，分析路由表优先级。

## 执行命令

### Windows

```powershell
# 检查网络适配器
Get-NetAdapter | Where-Object {$_.Status -eq 'Up'}

# 检查路由表（关注 metric）
route print -4 | Select-String "0.0.0.0"
```

### macOS/Linux

```bash
# 检查网络接口
ifconfig | grep -A 4 tun

# 检查路由表
netstat -rn | grep default
```

## 输出格式

```json
{
  "tunAdapter": {
    "name": "FlClash",
    "ip": "198.18.0.1",
    "gateway": "198.18.0.2",
    "status": "Up"
  },
  "physicalAdapter": {
    "name": "WLAN",
    "ip": "10.17.77.106",
    "gateway": "10.17.77.1",
    "status": "Up"
  },
  "routeTable": {
    "tunMetric": 0,
    "physicalMetric": 256
  },
  "isHijacking": true,
  "reason": "TUN metric (0) 低于物理网卡 (256)，会劫持所有流量"
}
```

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
