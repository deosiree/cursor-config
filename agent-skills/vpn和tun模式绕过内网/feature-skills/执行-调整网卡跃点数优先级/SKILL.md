---
name: 执行-调整网卡跃点数优先级
description: 通过调整 Windows 网卡的 metric（跃点数）来改变网卡优先级，数字越小优先级越高。
---

# 核心任务
使用 `Set-NetIPInterface` 命令调整指定网卡的 InterfaceMetric，从而改变 Windows 路由决策中该网卡的优先级。

## 何时使用
- 需要让某张网卡（如 WiFi）优先处理外网流量
- 当前网卡 metric 过高，导致流量走了其他接口
- 需要配合静态路由调整整体路由策略

## 核心原理

### Metric（跃点数）是什么？
- Windows 路由表中的**优先级数字**
- **数字越小，优先级越高**
- 同一目标有多条路由时，选择 metric 最小的

### 示例对比
```
修改前：
网卡          Metric
以太网        25
WiFi          30      ← 优先级低于以太网

修改后：
网卡          Metric
以太网        25
WiFi          10      ← 优先级高于以太网
```

**效果**：外网流量优先走 WiFi，内网流量走以太网（通过静态路由强制）

## 输入契约
- `interfaceAlias`: 网卡名称（如 "WLAN"、"以太网"）
- `newMetric`: 新的跃点数（推荐范围：1-50，越小越优先）

## 输出契约
- `commandExecuted`: 执行的 PowerShell 命令
- `success`: 是否成功
- `verificationResult`: 修改后的 metric 值
  ```yaml
  interfaceAlias: "WLAN"
  oldMetric: 30
  newMetric: 10
  success: true
  ```

## 执行步骤

### 1. 查询当前 metric
```powershell
Get-NetIPInterface -InterfaceAlias "WLAN" | Select InterfaceAlias, InterfaceMetric
```

**输出示例**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
WLAN            30
```

### 2. 调整 metric
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
```

**注意事项**：
- 需要管理员权限
- 立即生效，无需重启
- 修改是持久化的（重启后仍保留）

### 3. 验证修改
```powershell
Get-NetIPInterface -InterfaceAlias "WLAN" | Select InterfaceAlias, InterfaceMetric
```

**预期输出**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
WLAN            10              ← 已修改
```

## 使用示例

### 输入
```yaml
interfaceAlias: "WLAN"
newMetric: 10
```

### 输出
```yaml
commandExecuted: "Set-NetIPInterface -InterfaceAlias \"WLAN\" -InterfaceMetric 10"
success: true
verificationResult:
  interfaceAlias: "WLAN"
  oldMetric: 30
  newMetric: 10
  effectiveImmediately: true
```

## 常见 Metric 值参考

| 场景 | 推荐 Metric | 说明 | 示例 |
|------|------------|------|------|
| TUN 虚拟接口 | 0 | 最高优先级，拦截所有流量 | FlClash TUN |
| 静态路由（内网） | 5-10 | 高于 TUN（通过更具体的网段规则） | `route add 10.0.0.0 ... metric 5` |
| 主外网接口 | 10-20 | 优先处理外网 | WiFi (metric 10) |
| 内网接口 | 25-35 | 默认值 | 以太网 (metric 25) |
| 备用接口 | 50+ | 仅在其他不可用时使用 | 备用 VPN |

## 边界
- 只负责调整网卡 metric，不负责添加静态路由
- 不负责判断应该设置为多少（由上层 intention 决策）
- 修改立即生效，无需重启

## 失败模式
- ❌ 网卡名称错误 → 提示找不到接口
  ```powershell
  Get-NetAdapter | Select Name  # 查看所有网卡名称
  ```
- ❌ metric 设置为 0 但已有 TUN → 可能冲突
- ❌ 只调 metric 不配静态路由 → 内网可能仍不通

## 与其他配置的关系

```
静态路由 (metric 5) → 强制内网走以太网
    ↓
WiFi metric 调整 (10) → 外网优先走 WiFi
    ↓
FlClash interface-name: WLAN → TUN 使用 WiFi 出站
```

**配合使用才能实现内网直连 + 外网代理**

## 回滚
若需恢复原 metric：
```powershell
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 30
```

## 诊断命令
```powershell
# 查看所有接口 metric
Get-NetIPInterface | Select InterfaceAlias, InterfaceMetric | Sort InterfaceMetric

# 查看路由表（包含 metric）
route print

# 测试是否生效
Test-NetConnection 8.8.8.8 -TraceRoute
```
