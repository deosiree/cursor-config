---
name: 执行-添加静态路由
description: 为特定网段添加 Windows 静态路由，强制指定网段的流量走特定网关和接口。
---

# 核心任务
使用 `route add` 命令为内网网段（如 10.0.0.0/8）添加静态路由，让内网流量强制走以太网，不被 TUN 拦截。

## 何时使用
- 需要让特定网段（如内网）走指定接口
- TUN metric 0 拦截了所有流量，需要为内网"开绿灯"
- 需要持久化路由配置（重启后仍生效）

## 核心原理

### 为什么静态路由能优先于 TUN？
```
路由匹配优先级：
1. **网段匹配度**（越具体越优先）
   10.0.0.0/8 (静态路由) > 0.0.0.0/0 (TUN 默认路由)

2. 同等匹配度下比较 metric
   静态路由 metric 5 vs TUN metric 0
```

**关键点**：更具体的网段规则优先于默认路由，即使 metric 更高。

### 示例
```
访问 10.17.196.39：
  1. 匹配 10.0.0.0/8 静态路由（精确匹配）→ 走以太网 ✅
  2. 不匹配 TUN 默认路由（虽然 metric 0）

访问 8.8.8.8：
  1. 不匹配 10.0.0.0/8
  2. 匹配 0.0.0.0/0 默认路由 → 走 TUN ✅
```

## 输入契约
- `networkSegment`: 网段（如 "10.0.0.0"）
- `subnetMask`: 子网掩码（如 "255.0.0.0"）
- `gateway`: 网关 IP（如 "10.17.77.1"）
- `interfaceIndex`: 接口索引（如 10）
- `metric`: 路由优先级（推荐 5-10）
- `persistent`: 是否持久化（默认 true，重启后保留）

## 输出契约
- `commandExecuted`: 执行的命令
- `success`: 是否成功
- `verificationResult`: 验证结果
  ```yaml
  routeAdded: true
  destination: "10.0.0.0"
  netmask: "255.0.0.0"
  gateway: "10.17.77.1"
  interface: 10
  metric: 5
  persistent: true
  ```

## 执行步骤

### 1. 获取接口索引和网关
```powershell
# 查看以太网接口索引
Get-NetAdapter | Where-Object {$_.Name -like "*以太网*"} | Select Name, InterfaceIndex

# 查看以太网网关
Get-NetRoute -InterfaceAlias "以太网" | Where-Object {$_.DestinationPrefix -eq "0.0.0.0/0"} | Select NextHop
```

**示例输出**：
```
Name     InterfaceIndex
----     --------------
以太网   10

NextHop
-------
10.17.77.1
```

### 2. 添加静态路由
```powershell
# 临时路由（重启后失效）
route add 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10

# 持久化路由（推荐）
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```

**参数说明**：
- `-p`: 持久化（Persistent），重启后保留
- `10.0.0.0`: 目标网段
- `mask 255.0.0.0`: 子网掩码（/8）
- `10.17.77.1`: 网关 IP
- `metric 5`: 路由优先级（5-10 推荐）
- `if 10`: 接口索引

### 3. 验证路由
```powershell
route print | findstr "10.0.0.0"
```

**预期输出**：
```
     10.0.0.0      255.0.0.0     10.17.77.1   10.17.77.153      5
```

**字段含义**：
- `10.0.0.0`: 目标网段
- `255.0.0.0`: 子网掩码
- `10.17.77.1`: 网关
- `10.17.77.153`: 本机 IP
- `5`: Metric

### 4. 测试路由
```powershell
# Ping 内网 IP，确认走以太网
ping 10.17.196.39

# 查看路由追踪
tracert -d -h 5 10.17.196.39
```

## 使用示例

### 输入
```yaml
networkSegment: "10.0.0.0"
subnetMask: "255.0.0.0"
gateway: "10.17.77.1"
interfaceIndex: 10
metric: 5
persistent: true
```

### 输出
```yaml
commandExecuted: "route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10"
success: true
verificationResult:
  routeExists: true
  destination: "10.0.0.0"
  gateway: "10.17.77.1"
  metric: 5
  persistent: true
  testPing: "10.17.196.39"
  pingResult: "success (1ms)"
```

## 常见网段配置

| 网段 | 子网掩码 | 说明 | 示例 |
|------|---------|------|------|
| 10.0.0.0/8 | 255.0.0.0 | A 类私网（最常用） | 公司内网 |
| 192.168.0.0/16 | 255.255.0.0 | C 类私网 | 家庭网络 |
| 172.16.0.0/12 | 255.240.0.0 | B 类私网 | 企业网络 |
| 10.17.0.0/16 | 255.255.0.0 | 更具体的子网 | 特定部门 |

## 边界
- 只负责添加静态路由，不负责调整网卡 metric
- 不负责验证网关是否可达
- 不负责判断应该添加哪个网段（由上层 intention 决策）

## 失败模式
- ❌ 接口索引错误 → 路由添加失败
  ```powershell
  Get-NetAdapter | Select Name, InterfaceIndex  # 查看正确索引
  ```
- ❌ 网关不可达 → 路由存在但 ping 不通
  ```powershell
  Test-NetConnection 10.17.77.1  # 测试网关
  ```
- ❌ 权限不足 → 需要管理员权限
  ```powershell
  # 以管理员身份运行 PowerShell
  ```

## 回滚
删除静态路由：
```powershell
route delete 10.0.0.0
```

## 与其他配置的关系

```
静态路由 (metric 5) → 强制内网走以太网
    ↑ 必须配合
WiFi metric 调整 (10) → 外网优先走 WiFi
    ↑ 必须配合
FlClash route-exclude → TUN 不拦截内网
```

## 诊断命令
```powershell
# 查看所有路由
route print

# 查看特定网段路由
route print | findstr "10.0.0.0"

# 查看活动路由
Get-NetRoute -AddressFamily IPv4 | Where-Object {$_.DestinationPrefix -like "10.*"}

# 测试路由追踪
tracert -d 10.17.196.39
```

## 持久化说明

### 临时路由（不推荐）
```powershell
route add 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```
- 重启后失效
- 适合临时测试

### 持久化路由（推荐）
```powershell
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```
- 重启后保留
- 写入注册表：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\Tcpip\Parameters\PersistentRoutes`
