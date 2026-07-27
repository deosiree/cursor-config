---
name: 决策-解决方案选择
description: 根据问题类型，选择最优的修复策略
version: 1.0.0
tags: [决策, 策略选择]
parent: vpn和tun模式绕过内网
---

# 目标

根据问题分类结果，选择最优修复策略，优先考虑一次性彻底解决问题的方案。

## 输入契约

接收来自 [[../分析-网络问题类型]] 的输出：

```json
{
  "problemType": "string",
  "details": {
    "hasDnsHijack": boolean,
    "hasRouteHijack": boolean,
    "hasTopologyIssue": boolean
  }
}
```

## 决策表

| 问题类型 | 推荐策略 | 优先级 | 理由 |
|---------|---------|--------|------|
| DNS劫持 | fake-ip-filter | 中 | 只解决 DNS，不解决路由（不推荐单独使用） |
| 路由劫持 | TUN路由排除 | **高** | 彻底排除内网IP，一劳永逸 |
| 拓扑问题 | 静态路由 | 中 | 适合跨网段场景 |
| 复合问题-DNS和路由劫持 | TUN路由排除 | **高** | 路由排除后 DNS 自然正常 |
| 复合问题-路由劫持和跨网段 | TUN路由排除（优先） | **高** | 先尝试 TUN 排除，失败再用静态路由 |
| 非TUN问题 | 无 | - | 返回错误，提示检查服务器 |

## 决策逻辑

### 核心原则

1. **TUN路由排除优先**：一次配置永久生效，VPN 自动管理路由规则
2. **避免 fake-ip-filter 单独使用**：只解决 DNS 不解决路由，不彻底
3. **静态路由作为补充**：需要手动管理，但适合特殊场景（如 TUN 配置不支持）

### 详细决策流程

```python
def select_strategy(problemType, details):
    if problemType == "非TUN问题":
        return {
            "strategy": None,
            "reason": "问题不在 TUN 模式，请检查服务器本身"
        }
    
    # 优先判断是否有路由劫持
    if details["hasRouteHijack"]:
        # 路由劫持是主要问题，TUN 路由排除是最优方案
        primary = "TUN路由排除"
        
        # 如果同时有 DNS 劫持，TUN 排除后会自然解决
        if details["hasDnsHijack"]:
            return {
                "strategy": "TUN路由排除",
                "reason": "路由排除后，DNS 劫持会自然解决（不再将流量发到 TUN）",
                "additionalSteps": []
            }
        
        # 如果是跨网段，先尝试 TUN 排除
        if details["hasTopologyIssue"]:
            return {
                "strategy": "TUN路由排除",
                "reason": "先尝试 TUN 排除，VPN 会自动创建路由规则。如果失败再补充静态路由。",
                "fallback": "静态路由"
            }
        
        # 单纯路由劫持
        return {
            "strategy": "TUN路由排除",
            "reason": "彻底排除内网IP段，一劳永逸"
        }
    
    # 没有路由劫持，只有 DNS 劫持
    if details["hasDnsHijack"]:
        return {
            "strategy": "fake-ip-filter",
            "reason": "只有 DNS 劫持，修改 fake-ip-filter 即可",
            "warning": "如果修复后仍失败，可能还有路由劫持问题，需重新诊断"
        }
    
    # 只有拓扑问题（理论上不应该出现，因为 TUN 会劫持）
    if details["hasTopologyIssue"]:
        return {
            "strategy": "静态路由",
            "reason": "跨网段访问，需要添加静态路由",
            "note": "这种情况罕见，通常伴随路由劫持"
        }
    
    # 无法判断
    return {
        "strategy": None,
        "reason": "未检测到明确问题，可能是服务器本身的问题"
    }
```

## 输出契约

```json
{
  "strategy": "TUN路由排除" | "fake-ip-filter" | "静态路由" | null,
  "reason": "string",
  "priority": "high" | "medium" | "low",
  "fallback": "string | null",
  "additionalSteps": string[],
  "warning": "string | null",
  "estimatedSuccess": number  // 0-100
}
```

## 输出示例

### 示例 1: 最优方案

```json
{
  "strategy": "TUN路由排除",
  "reason": "检测到路由劫持（TUN metric 0 > 物理网卡 metric 256）。TUN路由排除是最优方案：\n1. 彻底排除内网IP段（10.0.0.0/8, 192.168.0.0/16等）\n2. VPN 自动创建路由规则，无需手动管理\n3. 一次配置永久生效",
  "priority": "high",
  "fallback": null,
  "additionalSteps": [],
  "warning": null,
  "estimatedSuccess": 95
}
```

### 示例 2: 有fallback

```json
{
  "strategy": "TUN路由排除",
  "reason": "跨网段访问（10.17.77.0/24 → 10.17.196.0/24）+ 路由劫持。先尝试 TUN 排除，VPN 通常会自动创建合适的路由规则。",
  "priority": "high",
  "fallback": "静态路由",
  "additionalSteps": [
    "如果 TUN 排除后仍失败，说明 VPN 未自动创建跨网段路由",
    "此时需要手动添加静态路由：route add 10.17.196.0 mask 255.255.255.0 10.17.77.1"
  ],
  "warning": null,
  "estimatedSuccess": 85
}
```

### 示例 3: 次优方案

```json
{
  "strategy": "fake-ip-filter",
  "reason": "只检测到 DNS 劫持（fake-ip 模式未过滤 localhost），修改 fake-ip-filter 即可。",
  "priority": "medium",
  "fallback": null,
  "additionalSteps": [],
  "warning": "⚠️ 如果修复后仍无法访问，可能还存在路由劫持问题，需重新诊断。建议直接使用 TUN路由排除（更彻底）。",
  "estimatedSuccess": 70
}
```

### 示例 4: 无法决策

```json
{
  "strategy": null,
  "reason": "TUN 模式未开启，问题不在网络层劫持。请检查：\n1. 目标服务器是否运行（netstat -ano | findstr :8080）\n2. 防火墙是否阻止连接\n3. 服务器监听地址是否正确（应该是 0.0.0.0 或 127.0.0.1）",
  "priority": "low",
  "fallback": null,
  "additionalSteps": [
    "检查服务器进程",
    "检查防火墙规则",
    "查看服务器日志"
  ],
  "warning": "🔴 这不是 VPN 配置问题",
  "estimatedSuccess": 0
}
```

## 成功率估算

| 策略 | 基础成功率 | 调整因素 |
|------|-----------|---------|
| TUN路由排除 | 95% | 支持度高的 VPN 工具（FlClash、Clash Verge） |
| TUN路由排除（跨网段） | 85% | -10% 因为可能需要补充静态路由 |
| fake-ip-filter | 70% | -25% 因为可能遗漏路由劫持问题 |
| 静态路由 | 80% | 需要管理员权限，跨平台差异大 |

## 版本历史

- v1.0.0 (2026-01-27): 初始版本，基于真实案例经验
