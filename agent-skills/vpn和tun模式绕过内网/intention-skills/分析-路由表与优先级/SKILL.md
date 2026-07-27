---
name: 分析-路由表与优先级
description: 分析当前路由表，识别 metric 冲突、缺失的静态路由、接口优先级问题，诊断网络故障根因。
---

# 核心任务
基于网络拓扑和路由表，分析 metric 优先级冲突、缺失的静态路由、系统代理状态，输出问题诊断报告。

## 何时使用
- 已识别网络拓扑，需要分析为什么内网/外网不通
- 需要判断是否缺少静态路由
- 需要分析接口 metric 是否配置合理

## 输入契约
- `networkTopology`: 来自 `[[../诊断-网络拓扑分析/SKILL.md]]` 的输出
- `userSymptoms`: 用户描述的症状（可选）

## 输出契约
- `problemDiagnosis`: 问题诊断报告
  ```yaml
  routingIssues:
    - type: "missing_static_route"
      description: "没有 10.0.0.0/8 的静态路由"
      impact: "内网流量被 TUN 拦截"
      fix: "添加静态路由 10.0.0.0/8 → 以太网 metric 5"
    
    - type: "metric_conflict"
      description: "WiFi metric 30 低于以太网 25"
      impact: "外网流量优先走以太网（无网关）"
      fix: "调整 WiFi metric 为 10"
    
    - type: "proxy_disabled"
      description: "系统代理 ProxyEnable = 0"
      impact: "curl 通但浏览器不通"
      fix: "启用系统代理"
  
  currentState:
    staticRoutes: []
    interfaceMetrics:
      - interface: "FlClash"
        metric: 0
      - interface: "以太网"
        metric: 25
      - interface: "WLAN"
        metric: 30
    proxyEnabled: false
  ```

## 执行步骤

### 1. 查询路由表
调用 `[[../../feature-skills/执行-查询路由表/SKILL.md]]`

### 2. 识别缺失的静态路由
检查是否存在内网网段（10.0.0.0/8）的静态路由：
```powershell
route print | findstr "10.0.0.0"
```

若不存在 → 问题：内网流量被 TUN 拦截

### 3. 分析 Metric 冲突

#### 冲突 A：TUN metric 0 拦截所有流量
- **症状**：内网和外网都不通，或只有外网通
- **原因**：TUN metric 0 是最高优先级，拦截所有流量
- **修复**：需要静态路由（更具体的网段规则优先）

#### 冲突 B：WiFi metric 低于以太网
- **症状**：外网不通，curl 失败
- **原因**：外网流量优先走以太网，但以太网无外网网关
- **修复**：提高 WiFi metric（降低数字）

### 4. 检查系统代理状态
```powershell
Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable
```

若 `ProxyEnable = 0` → 问题：浏览器不走代理

### 5. 检查 FlClash 配置
读取 `~/.config/clash/profiles/*.yml`，检查：
- `interface-name` 是否指定为 `WLAN`
- `inet4-route-exclude-address` 是否包含 `10.0.0.0/8`

## 使用示例

### 输入
```yaml
networkTopology:
  interfaces:
    - name: "以太网"
      ip: "10.17.77.153"
      gateway: "10.17.77.1"
      metric: 25
      type: "internal"
    - name: "WLAN"
      ip: "172.20.10.5"
      gateway: "172.20.10.1"
      metric: 30
      type: "external"
    - name: "FlClash"
      ip: "198.18.0.1"
      metric: 0
      type: "tun"

userSymptoms: "内网 ping 不通，外网可以访问"
```

### 输出
```yaml
problemDiagnosis:
  rootCause: "TUN 拦截内网流量，缺少静态路由"
  
  issues:
    - type: "missing_static_route"
      severity: "high"
      description: "没有 10.0.0.0/8 的静态路由"
      currentBehavior: "内网流量被 TUN (metric 0) 拦截"
      expectedBehavior: "内网流量走以太网直连"
      fix: "route add 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10"
    
    - type: "metric_conflict"
      severity: "medium"
      description: "WiFi metric 30 低于以太网 25"
      currentBehavior: "外网流量可能优先走以太网"
      expectedBehavior: "外网流量走 WiFi"
      fix: "Set-NetIPInterface -InterfaceAlias \"WLAN\" -InterfaceMetric 10"
  
  currentState:
    staticRoutes: []
    tunMetric: 0
    wifiMetric: 30
    ethMetric: 25
    proxyEnabled: "unknown"  # 需要检查
```

## 边界
- 只负责分析问题，不负责决策具体修复步骤的顺序
- 配置决策由 `[[../策略-配置方案决策/SKILL.md]]` 负责
- 不负责执行具体的配置命令

## 常用配套
- `[[../../feature-skills/执行-查询路由表/SKILL.md]]` - 获取路由表
- `[[../策略-配置方案决策/SKILL.md]]` - 后续配置决策

## 失败模式
- ❌ route print 输出解析失败 → 需要人工检查
- ❌ FlClash 配置文件路径不存在 → 需要用户提供路径
