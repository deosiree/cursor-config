# Feature Skills（执行与原子操作层）

本目录包含执行类的 skills，负责执行具体的配置命令、查询操作、测试验证。

---

## Feature Skills 列表

### 查询类

#### 1. 执行-查询网络状态
**职责**：获取网卡列表、IP 地址、网关、metric 信息。

**命令**：
```powershell
Get-NetAdapter
Get-NetIPAddress
Get-NetIPInterface
```

---

#### 2. 执行-查询路由表
**职责**：执行 `route print` 并解析输出。

**命令**：
```powershell
route print
Get-NetRoute
```

---

### 配置类

#### 3. 执行-添加静态路由
**职责**：为特定网段添加 Windows 静态路由。

**命令**：
```powershell
route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10
```

**核心原理**：更具体的网段规则优先于默认路由。

---

#### 4. 执行-调整网卡跃点数优先级
**职责**：调整网卡 metric（跃点数）来改变优先级。

**命令**：
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
```

**核心原理**：数字越小，优先级越高。

---

#### 5. 执行-配置FlClash
**职责**：修改 FlClash YAML 配置，设置 `interface-name` 和 `inet4-route-exclude-address`。

**配置**：
```yaml
interface-name: WLAN
tun:
  inet4-route-exclude-address:
    - 10.0.0.0/8
```

---

#### 6. 执行-配置系统代理
**职责**：启用/禁用 Windows 系统代理。

**命令**：
```powershell
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1
```

---

#### 7. 执行-重启服务
**职责**：重启 FlClash 和浏览器，让配置生效。

**命令**：
```powershell
Stop-Process -Name "FlClash" -Force
Start-Process "C:\Program Files\FlClash\FlClash.exe"
```

---

### 测试类

#### 8. 执行-连通性测试
**职责**：执行 ping、curl、Test-NetConnection 测试。

**命令**：
```powershell
ping 10.17.196.39
curl https://www.google.com
Test-NetConnection 8.8.8.8
```

---

### 诊断类

#### 9. 故障排查-常见问题决策树
**职责**：根据症状快速定位问题，提供诊断步骤和修复建议。

**覆盖场景**：
- 内网 ping 不通
- 外网 curl 不通
- curl 通但浏览器不通
- 内网和外网都不通
- Kiro AI 地区限制

---

## Feature Skills 设计原则

### 1. 原子性
每个 feature skill 只做一件事：
- ✅ `执行-添加静态路由`：只添加一条路由
- ❌ 不要：`配置网络`：添加路由 + 调 metric + 改 FlClash

### 2. 幂等性
多次执行相同操作，结果一致：
- `执行-添加静态路由`：已存在则跳过或覆盖
- `执行-配置系统代理`：重复启用不报错

### 3. 结构化输入/输出
```yaml
输入：
  interfaceAlias: "WLAN"
  newMetric: 10

输出：
  success: true
  oldMetric: 30
  newMetric: 10
```

### 4. 失败透明
失败时返回明确的错误信息：
```yaml
success: false
error: "接口名称错误，找不到 WLAN2"
suggestion: "使用 Get-NetAdapter 查看正确的接口名"
```

---

## 命名规范

### 格式
```
执行-<动作>-<对象>
```

### 示例
- ✅ `执行-添加静态路由`
- ✅ `执行-调整网卡跃点数优先级`
- ✅ `执行-查询网络状态`
- ✅ `故障排查-常见问题决策树`

### 动词选择
- **查询**：获取信息，不修改状态
- **执行**：执行配置命令，修改状态
- **测试**：验证功能，不修改状态
- **故障排查**：诊断问题，不修改状态

---

## 职责边界

| 职责 | Feature 负责 | Feature 不负责 |
|------|-------------|---------------|
| **执行** | 执行具体命令 | 判断是否需要执行 |
| **参数** | 接收参数 | 决定参数值 |
| **验证** | 验证执行结果 | 决定验证标准 |
| **错误处理** | 返回错误信息 | 决定如何修复 |

---

## 使用示例

### 单独调用
```text
使用 $执行-添加静态路由：
- networkSegment: 10.0.0.0
- subnetMask: 255.0.0.0
- gateway: 10.17.77.1
- interfaceIndex: 10
- metric: 5
```

### 组合调用（由 intention 编排）
```text
使用 $策略-配置方案决策 生成计划：
  步骤 1：$执行-添加静态路由
  步骤 2：$执行-调整网卡跃点数优先级
  步骤 3：$执行-配置FlClash
  步骤 4：$执行-配置系统代理
  步骤 5：$执行-重启服务
```

---

## 扩展指南

### 新增 feature skill
1. 确认是否满足**原子性**（只做一件事）
2. 定义清晰的**输入/输出契约**
3. 实现**幂等性**（可重复执行）
4. 提供**失败模式**说明
5. 添加到本 README

### 示例：新增 "执行-测试代理节点"
```yaml
name: 执行-测试代理节点
description: 测试代理节点的可达性和延迟

输入:
  - proxyHost: "planb.mojcn.com"
  - proxyPort: 16617

输出:
  - reachable: true
  - latency: 76
  - testTime: "2024-01-15 10:30:00"

命令:
  Test-NetConnection -ComputerName planb.mojcn.com -Port 16617
```

---

## 常用 Feature Skills 组合

### 完整配置
```
执行-添加静态路由
  + 执行-调整网卡跃点数优先级
  + 执行-配置FlClash
  + 执行-配置系统代理
  + 执行-重启服务
```

### 验证配置
```
执行-连通性测试
  + 故障排查-常见问题决策树（若失败）
```

### 诊断问题
```
执行-查询网络状态
  + 执行-查询路由表
  + 故障排查-常见问题决策树
```
