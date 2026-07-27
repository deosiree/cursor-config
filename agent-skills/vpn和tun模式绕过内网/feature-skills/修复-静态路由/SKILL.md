---
name: 修复-静态路由
description: 手动添加 Windows/macOS/Linux 静态路由，强制指定网段走物理网关
version: 1.0.0
tags: [修复, 静态路由, route]
parent: vpn和tun模式绕过内网
---

# 目标

在系统路由表中手动添加静态路由，强制指定网段走物理网关，不走 TUN。

## 何时使用

- TUN 配置不支持 `inet4-route-exclude-address`
- 跨网段访问，且 TUN 未自动创建路由
- 作为 TUN路由排除 的补充或备选方案

## ⚠️ 注意

- 需要**管理员/root 权限**
- 路由会在重启后失效（除非添加永久路由）
- 每次 VPN 重启可能需要重新添加

## Windows

### 临时路由

```powershell
# 添加单个网段
route add 10.17.196.0 mask 255.255.255.0 10.17.77.1 metric 5

# 验证
route print | findstr "10.17.196"
```

### 永久路由

```powershell
route add 10.17.196.0 mask 255.255.255.0 10.17.77.1 metric 5 -p
```

### 删除路由

```powershell
route delete 10.17.196.0
```

## macOS

```bash
# 添加路由
sudo route add -net 10.17.196.0/24 10.17.77.1

# 验证
netstat -rn | grep "10.17.196"

# 删除
sudo route delete -net 10.17.196.0/24
```

## Linux

```bash
# 添加路由
sudo ip route add 10.17.196.0/24 via 10.17.77.1

# 验证
ip route | grep "10.17.196"

# 删除
sudo ip route del 10.17.196.0/24
```

## 批量添加脚本

模板见：
- Windows: [[../../template/windows-route.ps1]]
- macOS/Linux: [[../../template/macos-linux-route.sh]]

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
