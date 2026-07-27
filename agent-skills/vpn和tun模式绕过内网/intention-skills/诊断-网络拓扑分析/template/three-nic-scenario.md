# 三张网卡场景处理指南

## 场景描述

用户环境有 **3 张及以上网卡**，包括：
- 1 张内网接口（以太网）
- 2 张及以上外网接口（WiFi、USB 网卡、移动热点等）

---

## 典型拓扑

```
┌─────────────┐
│   用户电脑   │
└─────┬───────┘
      │
      ├───── 以太网（内网）→ 公司网络 10.17.77.0/24
      │
      ├───── WiFi（外网 1）→ 手机热点 172.20.10.0/28
      │
      └───── USB 网卡（外网 2）→ 备用热点 192.168.42.0/24
```

---

## 处理流程

### 第 1 步：识别网卡类型

调用 `[[../../feature-skills/执行-查询网络状态/SKILL.md]]`，输出：

```yaml
interfaces:
  - name: "以太网"
    ip: "10.17.77.153"
    gateway: "10.17.77.1"
    metric: 25
    type: "internal"  # 内网

  - name: "WLAN"
    ip: "172.20.10.5"
    gateway: "172.20.10.1"
    metric: 30
    type: "external"  # 外网 1

  - name: "USB Ethernet"
    ip: "192.168.42.129"
    gateway: "192.168.42.129"
    metric: 35
    type: "external"  # 外网 2

  - name: "FlClash"
    ip: "198.18.0.1"
    metric: 0
    type: "tun"
```

---

### 第 2 步：🔴 停下来，询问用户

**问题**：检测到多张外网接口，无法自动判断哪张是主外网。

**确认内容**：
```yaml
userConfirmation:
  type: "manual_selection"
  prompt: |
    检测到以下外网接口：
    1. WLAN (172.20.10.5) - WiFi 手机热点
       - 网关：172.20.10.1
       - Metric：30
       - 状态：已连接
    
    2. USB Ethernet (192.168.42.129) - USB 网卡
       - 网关：192.168.42.129
       - Metric：35
       - 状态：已连接
    
    请选择 **主外网接口**（用于 FlClash TUN 出站）：
  
  options:
    - value: "WLAN"
      label: "WLAN（推荐：稳定性高，延迟低）"
      recommended: true
    
    - value: "USB Ethernet"
      label: "USB Ethernet（备用）"
  
  required: true
  
  additionalQuestion: |
    是否需要配置 **备用外网接口**？
    （主外网断开时自动切换到备用）
  
  fallbackOptions:
    - value: "auto"
      label: "自动切换（推荐）"
    - value: "manual"
      label: "手动切换"
    - value: "none"
      label: "不配置备用"
```

---

### 第 3 步：调整 Metric 优先级

根据用户选择，配置 metric：

#### 方案 A：单主外网（不配备用）
```yaml
配置目标：
  - 内网接口：metric 保持原样（25）
  - 主外网接口：metric 10（高优先级）
  - 备用外网接口：metric 保持原样或提高（40）

命令：
  - Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
```

**结果**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0               ← TUN 最高优先级
WLAN            10              ← 主外网（用户选择）
以太网          25              ← 内网
USB Ethernet    35              ← 备用外网（不使用）
```

#### 方案 B：主外网 + 备用自动切换
```yaml
配置目标：
  - 主外网：metric 10
  - 备用外网：metric 15（比主外网略低）
  - 内网：metric 25

命令：
  - Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 10
  - Set-NetIPInterface -InterfaceAlias "USB Ethernet" -InterfaceMetric 15
```

**结果**：
```
InterfaceAlias  InterfaceMetric
--------------  ---------------
FlClash         0
WLAN            10              ← 主外网（优先）
USB Ethernet    15              ← 备用外网（主断开时自动切换）
以太网          25
```

**切换机制**：
- WLAN 正常时：TUN 使用 WLAN 出站
- WLAN 断开时：Windows 自动选择 USB Ethernet（metric 15 次优先）

---

### 第 4 步：配置 FlClash

#### 方案 A：固定主外网
```yaml
interface-name: WLAN  # 固定使用 WLAN
tun:
  auto-detect-interface: false
  inet4-route-exclude-address:
    - 10.0.0.0/8
```

**优点**：配置简单，行为可预测  
**缺点**：WLAN 断开时无法自动切换

#### 方案 B：自动切换（推荐）
```yaml
# 不指定 interface-name，允许 FlClash 根据 metric 自动选择
tun:
  auto-detect-interface: true
  inet4-route-exclude-address:
    - 10.0.0.0/8
```

**优点**：主外网断开时自动切换到备用  
**缺点**：行为稍复杂，依赖 FlClash 自动检测

---

### 第 5 步：验证配置

#### 测试主外网
```powershell
# 确认主外网接口生效
Test-NetConnection 8.8.8.8 -TraceRoute

# 预期：经过 WLAN 网关 172.20.10.1
```

#### 测试自动切换（方案 B）
```powershell
# 1. 禁用主外网
Disable-NetAdapter -Name "WLAN"

# 2. 测试外网连通性
curl https://www.google.com

# 3. 检查是否切换到备用
Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select InterfaceAlias

# 预期：InterfaceAlias = USB Ethernet

# 4. 恢复主外网
Enable-NetAdapter -Name "WLAN"
```

---

## 边缘场景

### 场景 1：两个外网接口 IP 在同一网段
```yaml
问题：
  - WLAN: 172.20.10.5/28
  - USB Ethernet: 172.20.10.10/28
  - 两者在同一子网

处理：
  - 🔴 STOP：警告用户配置异常
  - 建议：断开其中一个接口
  - 原因：同一子网不应有多个接口
```

### 场景 2：四张及以上网卡
```yaml
问题：
  - 1 张内网
  - 3 张外网

处理：
  - 只询问用户选择 **主外网** 和 **第一备用**
  - 其他外网接口 metric 设为 50+（低优先级）
```

### 场景 3：用户选择的主外网无网关
```yaml
问题：
  - 用户选择 "USB Ethernet" 为主外网
  - 但 USB Ethernet 无网关

处理：
  - 🔴 STOP：警告用户该接口无网关
  - 建议：重新选择或检查 USB 网卡配置
```

---

## 回滚

若配置后发现选错主外网：

```powershell
# 1. 恢复所有接口 metric 为默认值
Set-NetIPInterface -InterfaceAlias "WLAN" -InterfaceMetric 30
Set-NetIPInterface -InterfaceAlias "USB Ethernet" -InterfaceMetric 35

# 2. 重新执行诊断流程
```

---

## 与标准双网卡的差异

| 项目 | 双网卡 | 三张网卡 |
|------|--------|---------|
| **主外网识别** | 自动（唯一外网接口）| 需用户确认 |
| **Metric 调整** | 单一调整（WiFi → 10）| 需调整主外网 + 备用 |
| **FlClash 配置** | 固定 interface-name | 可自动切换或固定 |
| **验证复杂度** | 简单（内网 + 外网）| 需测试切换逻辑 |
| **用户确认点** | 0 个 | 1-2 个 |

---

## 总结

**三张网卡场景的关键差异**：
1. **必须询问用户**：无法自动判断主外网
2. **Metric 需分层**：主外网 < 备用外网 < 内网
3. **可选自动切换**：方案 B 提供高可用性
4. **验证更复杂**：需测试主/备切换逻辑

**推荐方案**：
- 主外网 metric 10
- 备用外网 metric 15（自动切换）
- FlClash `auto-detect-interface: true`
