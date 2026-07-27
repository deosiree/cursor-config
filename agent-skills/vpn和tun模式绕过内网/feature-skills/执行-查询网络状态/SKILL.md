---
name: 执行-查询网络状态
description: 获取系统所有网卡的列表、IP 地址、网关、metric（跃点数）等信息。
---

# 核心任务
执行 PowerShell 命令获取网卡信息，解析输出，返回结构化数据。

## 何时使用
- 需要了解当前系统有哪些网卡
- 需要获取每张网卡的 IP、网关、metric 信息
- 诊断网络问题的第一步

## 输入契约
- 无需输入

## 输出契约
- `interfaces`: 网卡列表
  ```yaml
  - name: "以太网"
    alias: "Ethernet"
    index: 10
    ip: "10.17.77.153"
    subnet: "255.255.255.0"
    gateway: "10.17.77.1"
    metric: 25
    status: "Up"
    macAddress: "00:15:5D:XX:XX:XX"
  
  - name: "WLAN"
    alias: "Wi-Fi"
    index: 9
    ip: "172.20.10.5"
    subnet: "255.255.255.240"
    gateway: "172.20.10.1"
    metric: 30
    status: "Up"
    macAddress: "A4:83:E7:XX:XX:XX"
  
  - name: "FlClash"
    alias: "FlClash"
    index: 45
    ip: "198.18.0.1"
    subnet: "255.255.0.0"
    gateway: null
    metric: 0
    status: "Up"
    macAddress: null
  ```

## 执行步骤

### 1. 获取网卡基本信息
```powershell
Get-NetAdapter | Select Name, InterfaceIndex, Status, MacAddress
```

### 2. 获取 IP 配置
```powershell
Get-NetIPAddress | Select InterfaceAlias, InterfaceIndex, IPAddress, PrefixLength
```

### 3. 获取网关信息
```powershell
Get-NetRoute -AddressFamily IPv4 | Where-Object {$_.DestinationPrefix -eq '0.0.0.0/0'} | Select InterfaceAlias, InterfaceIndex, NextHop
```

### 4. 获取 Metric
```powershell
Get-NetIPInterface | Select InterfaceAlias, InterfaceIndex, InterfaceMetric
```

### 5. 合并数据
将上述信息按 `InterfaceIndex` 合并为完整的网卡信息。

## 使用示例

### 输出
```yaml
interfaces:
  - name: "以太网"
    index: 10
    ip: "10.17.77.153"
    gateway: "10.17.77.1"
    metric: 25
    status: "Up"
  
  - name: "WLAN"
    index: 9
    ip: "172.20.10.5"
    gateway: "172.20.10.1"
    metric: 30
    status: "Up"
  
  - name: "FlClash"
    index: 45
    ip: "198.18.0.1"
    gateway: null
    metric: 0
    status: "Up"

summary:
  totalInterfaces: 3
  activeInterfaces: 3
  tunInterface: "FlClash"
```

## 边界
- 只负责获取信息，不负责分析或决策
- 不负责修改网卡配置
- 只返回 IPv4 信息（暂不支持 IPv6）

## 失败模式
- ❌ PowerShell 命令执行失败 → 检查权限
- ❌ 输出解析失败 → 返回原始文本，需人工检查
