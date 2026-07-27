---
name: 分析-网络问题类型
description: 根据诊断结果，判断问题是 DNS劫持、路由劫持、拓扑问题还是复合问题
version: 1.0.0
tags: [分析, 诊断, 分类]
parent: vpn和tun模式绕过内网
---

# 目标

分析诊断结果，准确判断问题类型，为后续决策提供依据。

## 输入契约

接收来自诊断 feature-skills 的输出：

```json
{
  "networkTopology": {
    "localIP": "string",
    "localSubnet": "string",
    "targetIP": "string",
    "targetSubnet": "string",
    "isCrossSubnet": boolean,
    "gateway": "string"
  },
  "tunStatus": {
    "tunEnabled": boolean,
    "tunMetric": number,
    "physicalMetric": number,
    "tunGateway": "string"
  },
  "dnsConfig": {
    "enhancedMode": "fake-ip" | "redir-host",
    "hasLocalFilter": boolean,
    "fakeIpFilter": string[]
  }
}
```

## 分类逻辑

### 判断树

```
1. 检查 tunEnabled
   ├─ false → 返回 "非TUN问题"
   └─ true → 继续

2. 检查 DNS 配置
   ├─ enhancedMode == "fake-ip" AND hasLocalFilter == false
   │  └─ 标记: hasDnsHijack = true
   └─ 否则 → hasDnsHijack = false

3. 检查路由优先级
   ├─ tunMetric < physicalMetric
   │  └─ 标记: hasRouteHijack = true
   └─ 否则 → hasRouteHijack = false

4. 检查网络拓扑
   ├─ isCrossSubnet == true
   │  └─ 标记: hasTopologyIssue = true
   └─ 否则 → hasTopologyIssue = false

5. 综合判断
   ├─ hasDnsHijack AND hasRouteHijack → "复合问题-DNS和路由劫持"
   ├─ hasRouteHijack AND hasTopologyIssue → "复合问题-路由劫持和跨网段"
   ├─ hasDnsHijack only → "DNS劫持"
   ├─ hasRouteHijack only → "路由劫持"
   └─ hasTopologyIssue only → "拓扑问题"
```

## 输出契约

```json
{
  "problemType": "DNS劫持" | "路由劫持" | "拓扑问题" | "复合问题-DNS和路由劫持" | "复合问题-路由劫持和跨网段" | "非TUN问题",
  "details": {
    "hasDnsHijack": boolean,
    "hasRouteHijack": boolean,
    "hasTopologyIssue": boolean
  },
  "explanation": "string",
  "confidence": "high" | "medium" | "low"
}
```

## 输出示例

### 示例 1: 单纯路由劫持

```json
{
  "problemType": "路由劫持",
  "details": {
    "hasDnsHijack": false,
    "hasRouteHijack": true,
    "hasTopologyIssue": false
  },
  "explanation": "FlClash TUN 虚拟网卡的 metric 为 0，高于物理网卡（metric 256），导致所有流量被劫持到 TUN 网关（198.18.0.2），而 TUN 不知道如何路由到内网 IP。",
  "confidence": "high"
}
```

### 示例 2: 复合问题

```json
{
  "problemType": "复合问题-DNS和路由劫持",
  "details": {
    "hasDnsHijack": true,
    "hasRouteHijack": true,
    "hasTopologyIssue": false
  },
  "explanation": "1. fake-ip 模式将本地地址（127.0.0.1、localhost）解析成虚假 IP（28.x.x.x），fake-ip-filter 中缺少本地地址过滤。2. TUN 劫持了所有流量，包括到虚假 IP 的流量，导致无法访问。",
  "confidence": "high"
}
```

### 示例 3: 跨网段 + 路由劫持

```json
{
  "problemType": "复合问题-路由劫持和跨网段",
  "details": {
    "hasDnsHijack": false,
    "hasRouteHijack": true,
    "hasTopologyIssue": true
  },
  "explanation": "1. 本机在 10.17.77.0/24 网段，目标在 10.17.196.0/24 网段，需要通过网关（10.17.77.1）转发。2. 但 TUN 劫持了流量，发送到 TUN 网关而不是物理网关，导致无法到达目标。",
  "confidence": "high"
}
```

## 置信度判断

- **high**: 所有必需诊断信息都已收集，判断逻辑明确
- **medium**: 部分信息缺失（如未检查 DNS 配置），但主要问题已识别
- **low**: 关键信息缺失（如无法获取路由表），只能做初步判断

## 边界情况

### 情况 1: TUN 未开启

```json
{
  "problemType": "非TUN问题",
  "details": {
    "hasDnsHijack": false,
    "hasRouteHijack": false,
    "hasTopologyIssue": false
  },
  "explanation": "TUN 模式未开启，问题不在网络层劫持。请检查：1. 目标服务器是否运行。2. 防火墙是否阻止。3. 服务器监听地址是否正确。",
  "confidence": "high"
}
```

### 情况 2: 诊断信息不全

```json
{
  "problemType": "路由劫持",
  "details": {
    "hasDnsHijack": null,  // 未检测
    "hasRouteHijack": true,
    "hasTopologyIssue": false
  },
  "explanation": "检测到路由劫持。DNS 配置未检查，可能还存在 DNS 劫持问题。",
  "confidence": "medium"
}
```

## 版本历史

- v1.0.0 (2026-01-27): 初始版本
