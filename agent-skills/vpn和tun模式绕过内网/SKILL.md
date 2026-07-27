---
name: vpn和tun模式绕过内网
description: Windows 多网卡环境（内网以太网 + 外网 WiFi）+ FlClash TUN 模式，实现内网直连 + 外网代理的完整诊断、决策、配置流程。
version: 1.0.0
tags: [network, vpn, tun, windows, routing, multi-nic, proxy, metric]
metadata:
  hermes:
    category: system-configuration
    related_skills: [network-troubleshooting, windows-routing]
---

# 目标
在 Windows 多网卡环境下，通过诊断 → 分析 → 决策 → 执行 → 验证的流程，实现内网直连 + 外网代理的网络配置。

## 何时使用
- Windows 系统有多张网卡（公司内网以太网 + 手机热点 WiFi）
- 使用 FlClash TUN 模式代理（如 Kiro AI 需要代理避免地区检测）
- 需要内网流量直连（10.0.0.0/8）+ 外网流量走代理
- 遇到"内网访问不了" / "外网访问不了" / "浏览器访问不了"等问题

## 何时不要使用
- 单网卡环境（不涉及路由优先级问题）
- 不使用 TUN 模式（普通 HTTP/SOCKS 代理）
- 已经配置好，只需微调参数

## 典型场景

### 场景 A：内网访问不了
```
症状：ping 10.17.196.39 不通，但外网正常
原因：TUN 拦截了内网流量，缺少静态路由
```

### 场景 B：外网访问不了
```
症状：curl https://www.google.com 失败
原因：以太网无外网网关，WiFi metric 过低
```

### 场景 C：curl 通但浏览器不通
```
症状：curl 能访问 Google，浏览器打不开
原因：系统代理未启用（ProxyEnable=0）
```

### 场景 D：Kiro AI 报错地区限制
```
症状：Too many requests / 地区检测失败
原因：FlClash 未指定出站接口或代理未生效
```

### 场景 E：三张及以上网卡（边缘场景）
```
症状：检测到多张外网接口，不知道配置哪张
原因：无法自动判断主外网接口
处理：停下来询问用户选择主外网 + 备用外网
参考：[[intention-skills/诊断-网络拓扑分析/template/three-nic-scenario.md]]
```

## 输入契约
- 用户问题描述（症状）
- 当前网络环境（可选，会自动诊断）
- FlClash 配置路径（可选，默认 `~/.config/clash/profiles/`）

## 核心流程

### 第 1 阶段：诊断
→ `[[intention-skills/诊断-网络拓扑分析/SKILL.md]]`

**目标**：识别有几张网卡、哪张内网、哪张外网、是否有 TUN

**输出**：
```yaml
网络拓扑:
  - 以太网 (10.17.77.x) → 内网
  - WiFi (172.20.10.x) → 手机热点（外网）
  - FlClash TUN (198.18.0.x) → 代理接口
```

### 第 2 阶段：分析
→ `[[intention-skills/分析-路由表与优先级/SKILL.md]]`

**目标**：分析当前 metric、接口优先级、是否有静态路由

**输出**：
```yaml
问题诊断:
  - FlClash TUN metric 0（最高优先级，拦截所有流量）
  - 以太网 metric 25，WiFi metric 30
  - 没有 10.0.0.0/8 的静态路由
  - 系统代理 ProxyEnable = 0
```

### 第 3 阶段：决策
→ `[[intention-skills/策略-配置方案决策/SKILL.md]]`

**目标**：根据诊断结果决定需要执行哪些配置步骤

**输出**：
```yaml
配置决策:
  - ✅ 配置 FlClash（interface-name: WLAN + inet4-route-exclude-address）
  - ✅ 添加静态路由（10.0.0.0/8 → 以太网 metric 5）
  - ✅ 调整 WiFi metric（30 → 10，提高优先级）
  - ✅ 启用系统代理（ProxyEnable = 1）
  - ✅ 重启 FlClash + 浏览器
```

### 第 4 阶段：执行
根据决策动态组合调用 feature skills：

- `[[feature-skills/执行-配置FlClash/SKILL.md]]`
- `[[feature-skills/执行-添加静态路由/SKILL.md]]`
- `[[feature-skills/执行-调整网卡跃点数优先级/SKILL.md]]`
- `[[feature-skills/执行-配置系统代理/SKILL.md]]`
- `[[feature-skills/执行-重启服务/SKILL.md]]`

### 第 5 阶段：验证
→ `[[intention-skills/验证-网络连通性测试/SKILL.md]]`

**测试项**：
1. 内网测试：`ping 10.17.196.39` → ✅ 通
2. 外网测试：`curl https://www.google.com` → ✅ 通
3. 浏览器测试：访问 `gemini.google.com` → ✅ 通

若失败：
→ `[[feature-skills/故障排查-常见问题决策树/SKILL.md]]`

## 完整流程图

```
用户报告问题
    ↓
【诊断阶段】
诊断-网络拓扑分析
    ├→ 执行-查询网络状态
    ├→ 执行-查询路由表
    ↓
【分析阶段】
分析-路由表与优先级
    ├→ 识别 metric 冲突
    ├→ 识别缺失的静态路由
    ↓
【决策阶段】
策略-配置方案决策
    ├→ 判断需要哪些配置步骤
    ↓
【执行阶段】
动态组合调用 feature skills
    ├→ 执行-配置FlClash
    ├→ 执行-添加静态路由
    ├→ 执行-调整网卡跃点数优先级
    ├→ 执行-配置系统代理
    ├→ 执行-重启服务
    ↓
【验证阶段】
验证-网络连通性测试
    ├→ 执行-连通性测试
    └→ 若失败：故障排查-常见问题决策树
```

## 🛟 失败模式与 fallback

| 症状 | 一线修复 | 仍失败兜底 |
|------|---------|-----------|
| 内网 ping 不通 | 检查静态路由是否生效 | 手动 `route print \| findstr "10.0.0.0"` 验证 |
| 外网 curl 不通 | 检查 FlClash 出站接口 | 检查 WiFi 是否有网，手动 `Test-NetConnection 8.8.8.8` |
| 浏览器不通（curl 通） | 检查系统代理是否启用 | 手动配置浏览器代理 `127.0.0.1:7890` |
| FlClash 无法启动 | 检查 yml 配置语法 | 恢复备份配置 |

## 🚫 反模式

| 反模式 | 为什么错 | 正确做法 |
|--------|---------|---------|
| 跳过诊断直接配置 | 不知道当前状态就盲目配置 | 先进入诊断阶段 |
| 只配 FlClash 不配 OS 路由 | TUN 仍拦截内网流量 | 必须四层配合 |
| 只配静态路由不调 WiFi metric | 外网流量走以太网（无网关） | 提高 WiFi 优先级 |
| curl 通就认为配置完成 | 浏览器可能仍不通 | 必须测试浏览器 |

## 输出契约
- `networkTopology`: 网络拓扑结构
- `problemDiagnosis`: 问题诊断报告
- `configurationPlan`: 配置决策清单
- `executionResults`: 各步骤执行结果
- `verificationResults`: 验证测试结果
- `troubleshootingAdvice`: 故障排查建议（若有问题）

## 使用示例

### 示例 1：完整配置流程
```text
使用 $vpn和tun模式绕过内网 帮我配置：
- 内网 10.0.0.0/8 直连
- 外网走 FlClash TUN 代理
- 手机热点是 WiFi，公司网络是以太网
```

### 示例 2：问题排查
```text
使用 $vpn和tun模式绕过内网 排查问题：
我配置了 FlClash TUN 后，内网 ping 不通了，但外网正常。
```

### 示例 3：验证配置
```text
使用 $vpn和tun模式绕过内网 验证：
帮我测试内网和外网是否都正常。
```

## 相关文档
- `[[README.md]]` - 核心原理、跃点数机制、时序图
- `[[template/snapshot-完整配置命令.md]]` - 完整命令参考
- `[[template/故障排查决策树.md]]` - 常见问题快速定位
