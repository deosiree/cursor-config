---
name: 验证-访问测试
description: 通过 ping、路由表检查、实际访问测试验证修复是否成功
version: 1.0.0
tags: [验证, 测试, ping]
parent: vpn和tun模式绕过内网
---

# 目标

验证修复是否成功，确保本地地址和局域网地址能够正常访问。

## 测试步骤

### 1. Ping 测试

```powershell
# Windows
ping 127.0.0.1 -n 4
ping $targetIP -n 4

# macOS/Linux
ping -c 4 127.0.0.1
ping -c 4 $targetIP
```

**成功标准**：
- ✅ 响应时间 < 10ms（本地回环应 < 1ms）
- ✅ 丢包率 0%

### 2. 路由表检查

```powershell
# Windows
route print | findstr "$targetSubnet"

# macOS/Linux
netstat -rn | grep "$targetSubnet"
```

**成功标准**：
- ✅ 存在到目标网段的路由
- ✅ 网关是物理网关（不是 TUN 网关）
- ✅ Metric 低于 TUN 默认路由

### 3. 实际访问测试

```powershell
# HTTP 测试
curl http://$targetIP:$port -I -s --max-time 5

# 或使用 Test-NetConnection (Windows)
Test-NetConnection -ComputerName $targetIP -Port $port
```

**成功标准**：
- ✅ 连接成功（HTTP 200 或 TCP 连接建立）
- ✅ 响应时间 < 1000ms

## 输出格式

```json
{
  "pingTest": {
    "localhost": {
      "success": true,
      "avgResponseTime": "< 1ms",
      "packetLoss": "0%"
    },
    "targetIP": {
      "success": true,
      "avgResponseTime": "5ms",
      "packetLoss": "0%"
    }
  },
  "routeCheck": {
    "routeExists": true,
    "gateway": "10.17.77.1",
    "interface": "WLAN",
    "metric": 40,
    "isBypassingTUN": true
  },
  "httpTest": {
    "success": true,
    "statusCode": 200,
    "responseTime": "150ms"
  },
  "overallResult": "PASS",
  "summary": "所有测试通过，访问正常"
}
```

## 失败分析

| 测试项 | 失败原因 | 处理方式 |
|--------|---------|---------|
| Ping失败 | 服务器未运行/防火墙阻止 | 检查服务器和防火墙 |
| 路由不存在 | 配置未生效/VPN未重启 | 重启VPN |
| Metric错误 | TUN仍在劫持 | 检查配置是否正确 |
| HTTP失败但Ping成功 | 服务器监听地址错误 | 检查服务器配置 |

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
