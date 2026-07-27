---
name: 诊断-网络拓扑分析
description: 识别当前系统有几张网卡、哪张是内网、哪张是外网、是否有 TUN 虚拟接口，为后续配置提供基础信息。
---

# 核心任务
通过查询网卡列表、IP 地址、网关信息，识别网络拓扑结构，为后续路由配置提供基础。

## 何时使用
- 用户报告网络问题，但不清楚当前网络结构
- 需要确认有几张物理网卡、哪张用于内网、哪张用于外网
- 需要确认是否已安装 FlClash TUN 虚拟接口

## 输入契约
- 用户问题描述（可选）
- 无需其他输入（会自动查询系统信息）

## 输出契约
- `networkTopology`: 网络拓扑结构
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
      type: "external"  # 外网
    - name: "FlClash"
      ip: "198.18.0.1"
      gateway: null
      metric: 0
      type: "tun"  # TUN 虚拟接口
  ```
- `userConfirmationNeeded`: 是否需要用户确认（三张网卡场景）
  ```yaml
  userConfirmationNeeded:
    required: true
    reason: "检测到 3 张外网接口，需用户选择主外网"
    prompt: "请选择主外网接口：1) WLAN  2) USB Ethernet"
    guide: "[[template/three-nic-scenario.md]]"
  ```

## 执行步骤

### 1. 查询网卡列表
调用 `[[../../feature-skills/执行-查询网络状态/SKILL.md]]`

### 2. 识别网卡类型
根据以下规则判断：
- **内网**：IP 在 `10.0.0.0/8` 或 `192.168.0.0/16` 范围内
- **外网**：其他 IP 范围（通常是手机热点的 `172.20.x.x`）
- **TUN**：接口名包含 "FlClash" / "Clash" / "TUN"，或 IP 在 `198.18.0.0/16`

### 3. 识别问题网卡
- 没有网关的接口 → 可能无法访问外网
- Metric 为 0 的 TUN → 会拦截所有流量
- 多个外网接口 → 需要确认哪个是主接口

## 使用示例

### 输入
```yaml
用户问题: "我配置了 FlClash 后内网访问不了"
```

### 输出（标准双网卡）
```yaml
networkTopology:
  interfaces:
    - name: "以太网"
      ip: "10.17.77.153"
      gateway: "10.17.77.1"
      metric: 25
      type: "internal"
      interfaceIndex: 10
    - name: "WLAN"
      ip: "172.20.10.5"
      gateway: "172.20.10.1"
      metric: 30
      type: "external"
      interfaceIndex: 9
    - name: "FlClash"
      ip: "198.18.0.1"
      gateway: null
      metric: 0
      type: "tun"
      interfaceIndex: 45
  
  summary:
    internalInterface: "以太网"
    externalInterface: "WLAN"
    tunInterface: "FlClash"
    potentialIssues:
      - "TUN metric 0 会拦截所有流量，包括内网"
      - "没有静态路由让内网走以太网"
  
  userConfirmationNeeded:
    required: false
```

### 输出（三张网卡场景）
```yaml
networkTopology:
  interfaces:
    - name: "以太网"
      type: "internal"
    - name: "WLAN"
      ip: "172.20.10.5"
      gateway: "172.20.10.1"
      metric: 30
      type: "external"
    - name: "USB Ethernet"
      ip: "192.168.42.129"
      gateway: "192.168.42.129"
      metric: 35
      type: "external"
    - name: "FlClash"
      type: "tun"
  
  summary:
    internalInterface: "以太网"
    externalInterfaces: ["WLAN", "USB Ethernet"]  # 多个外网接口
    tunInterface: "FlClash"
    potentialIssues:
      - "检测到多张外网接口，无法自动判断主外网"
  
  userConfirmationNeeded:
    required: true  # 🔴 停下来询问用户
    reason: "多张外网接口"
    prompt: |
      检测到以下外网接口：
      1. WLAN (172.20.10.5) - WiFi 手机热点
      2. USB Ethernet (192.168.42.129) - USB 网卡
      
      请选择主外网接口（用于 FlClash TUN 出站）：
    options:
      - value: "WLAN"
        label: "WLAN（推荐）"
        recommended: true
      - value: "USB Ethernet"
        label: "USB Ethernet"
    
    additionalGuide: "详见 [[template/three-nic-scenario.md]]"
```

## 边界
- 只负责识别网络拓扑，不负责分析路由表
- 不负责决策需要哪些配置，只提供事实信息
- 路由表分析由 `[[../分析-路由表与优先级/SKILL.md]]` 负责

## 常用配套
- `[[../../feature-skills/执行-查询网络状态/SKILL.md]]` - 获取网卡信息
- `[[../分析-路由表与优先级/SKILL.md]]` - 后续分析路由表

## 失败模式
- ❌ 无法识别 TUN 接口 → 检查 FlClash 是否启动
- ❌ 多个内网接口 → 需要用户手动确认哪个是主接口
- ❌ 没有外网接口 → 需要用户确认手机热点是否开启
