---
name: 诊断-网络拓扑
description: 检查本机IP、目标IP、网段关系、网关信息，判断是否跨网段访问
version: 1.0.0
tags: [诊断, 网络拓扑, 网段]
parent: vpn和tun模式绕过内网
---

# 目标

收集网络拓扑信息，判断是同网段访问还是跨网段访问，为后续决策提供依据。

## 执行命令

### Windows

```powershell
# 获取本机IP地址
Get-NetIPAddress -AddressFamily IPv4 | 
    Where-Object {$_.IPAddress -notlike '169.254.*'} | 
    Select-Object InterfaceAlias, IPAddress, PrefixLength

# 获取默认网关
Get-NetRoute -DestinationPrefix '0.0.0.0/0' | 
    Select-Object InterfaceAlias, NextHop, RouteMetric
```

### macOS/Linux

```bash
# 获取本机IP
ifconfig | grep "inet " | grep -v 127.0.0.1

# 获取默认网关
netstat -rn | grep default
```

## 输出格式

```json
{
  "localInterfaces": [
    {
      "name": "WLAN",
      "ip": "10.17.77.106",
      "subnet": "10.17.77.0/24",
      "gateway": "10.17.77.1"
    }
  ],
  "targetIP": "10.17.196.39",
  "targetSubnet": "10.17.196.0/24",
  "isSameSubnet": false,
  "isCrossSubnet": true,
  "analysis": "本机在 10.17.77.0/24，目标在 10.17.196.0/24，需要通过网关转发"
}
```

## 网段判断逻辑

```python
def is_same_subnet(ip1, ip2, prefix_length):
    import ipaddress
    
    network1 = ipaddress.IPv4Network(f"{ip1}/{prefix_length}", strict=False)
    network2 = ipaddress.IPv4Network(f"{ip2}/{prefix_length}", strict=False)
    
    return network1 == network2
```

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
