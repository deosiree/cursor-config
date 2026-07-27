---
name: 编排-完整修复流程
description: 串联诊断→分类→决策→修复→验证的完整闭环，自动处理 VPN TUN 模式下无法访问内网的问题
version: 1.0.0
tags: [编排, orchestrator, 诊断, 修复, 验证]
parent: vpn和tun模式绕过内网
---

# 目标

自动串联完整的诊断修复流程，从问题识别到验证通过，无需用户手动选择子 skill。

## 何时使用

- 用户首次遇到 TUN 模式访问内网问题，不确定具体原因
- 需要完整的诊断报告，了解问题根本原因
- 希望自动选择最优修复方案，不想手动判断
- 需要验证修复是否成功

## 何时不要使用

- 用户已经明确知道问题类型（如"就是 fake-ip 劫持"） → 直接用对应 feature-skill
- 只想验证当前配置是否生效 → 直接用验证-访问测试
- 服务器本身没有运行 → 不是网络问题

## 输入契约

**必需**：
- `accessTarget`: 无法访问的目标地址
- `tunEnabled`: TUN 模式是否开启

**可选**：
- `vpnTool`: VPN 工具名称
- `configPath`: 配置文件路径
- `localIP`: 本机 IP（未提供则自动检测）

## 执行流程

### 阶段 1: 诊断（Diagnose）

```
→ [[../../feature-skills/诊断-网络拓扑]]
   输出: networkTopology (本机IP、目标IP、网段关系)

→ [[../../feature-skills/诊断-TUN状态]]
   输出: tunStatus (虚拟网卡、路由表、metric)

→ [[../../feature-skills/诊断-DNS配置]]
   输出: dnsConfig (fake-ip 模式、filter 列表)
```

**诊断输出示例**：
```json
{
  "networkTopology": {
    "localIP": "10.17.77.106",
    "localSubnet": "10.17.77.0/24",
    "targetIP": "10.17.196.39",
    "targetSubnet": "10.17.196.0/24",
    "isCrossSubnet": true,
    "gateway": "10.17.77.1"
  },
  "tunStatus": {
    "tunEnabled": true,
    "tunAdapter": "FlClash",
    "tunIP": "198.18.0.1",
    "tunGateway": "198.18.0.2",
    "tunMetric": 0,
    "physicalMetric": 256
  },
  "dnsConfig": {
    "enhancedMode": "fake-ip",
    "fakeIpRange": "28.0.0.1/8",
    "fakeIpFilter": ["*.lan", "*.local"],
    "hasLocalFilter": false
  }
}
```

### 阶段 2: 分类（Classify）

```
→ [[../分析-网络问题类型]]
   输入: 诊断结果
   输出: problemType (DNS劫持/路由劫持/拓扑问题/复合问题)
```

**分类逻辑**：
```
if (dnsConfig.enhancedMode == "fake-ip" AND dnsConfig.hasLocalFilter == false):
    → DNS劫持问题

if (tunStatus.tunMetric < physicalMetric):
    → 路由劫持问题

if (networkTopology.isCrossSubnet == true):
    → 拓扑问题（需要静态路由）

if (DNS劫持 AND 路由劫持):
    → 复合问题（需要双重修复）
```

### 阶段 3: 决策（Decide）

```
→ [[../决策-解决方案选择]]
   输入: problemType
   输出: strategy (修复策略)
```

**决策表**：

| 问题类型 | 修复策略 | 优先级 |
|---------|---------|--------|
| 单纯DNS劫持 | fake-ip-filter | 中 |
| 单纯路由劫持 | TUN路由排除 | 高 |
| 拓扑问题 | 静态路由 | 中 |
| 复合问题（DNS+路由） | TUN路由排除 | 高（一次性解决） |
| 跨网段+路由劫持 | TUN路由排除 + 静态路由 | 高 |

**推荐原则**：
1. **TUN路由排除** 是最优方案（彻底解决，不需手动添加路由）
2. **fake-ip-filter** 只解决 DNS，路由仍会被劫持（不推荐单独使用）
3. **静态路由** 适合跨网段且 TUN 配置不支持的场景

### 阶段 4: 修复（Fix）

根据决策结果，调用对应 feature-skill：

```python
if strategy == "TUN路由排除":
    → [[../../feature-skills/修复-TUN路由排除]]
    
elif strategy == "fake-ip-filter":
    → [[../../feature-skills/修复-fake-ip过滤]]
    
elif strategy == "静态路由":
    → [[../../feature-skills/修复-静态路由]]
    
elif strategy == "TUN路由排除 + fake-ip-filter":
    → 先 [[../../feature-skills/修复-TUN路由排除]]
    → 再 [[../../feature-skills/修复-fake-ip过滤]]
    
elif strategy == "TUN路由排除 + 静态路由":
    → 先 [[../../feature-skills/修复-TUN路由排除]]
    → 再 [[../../feature-skills/修复-静态路由]]（如果仍失败）
```

### 阶段 5: 验证（Verify）

```
→ [[../../feature-skills/验证-访问测试]]
   输入: accessTarget
   输出: verificationResult (成功/失败)
```

**验证步骤**：
1. Ping 测试（127.0.0.1、目标IP）
2. 路由表检查（确认排除规则生效）
3. 实际访问测试（HTTP 请求）

**验证通过条件**：
- ✅ Ping 成功
- ✅ 路由表中存在排除规则
- ✅ HTTP 访问返回 200 或连接成功

**验证失败处理**：
- 失败 1 次：重新诊断，可能是配置未生效（需重启 VPN）
- 失败 2 次：尝试备选方案（如静态路由）
- 失败 3 次：🔴 STOP，提示用户检查服务器本身

## 输出报告

### 成功输出示例

```markdown
## 诊断报告

**问题类型**: 路由劫持 + 跨网段访问

**根本原因**:
- FlClash TUN 虚拟网卡 metric 为 0（最高优先级）
- 劫持了到 10.17.196.39 的流量，发送到 TUN 网关（198.18.0.2）
- TUN 网关不知道如何路由到跨网段的内网 IP

**网络拓扑**:
- 本机: 10.17.77.106/24 (WLAN)
- 目标: 10.17.196.39 (跨网段)
- 网关: 10.17.77.1

---

## 修复方案

**选择策略**: TUN路由排除

**配置修改**:
文件: C:\Users\Administrator\AppData\Roaming\com.follow\clash\profiles\1779161022583.yaml

添加配置:
```yaml
tun:
  inet4-route-exclude-address:
    - 10.0.0.0/8
    - 127.0.0.0/8
    - 192.168.0.0/16
    - 172.16.0.0/12
```

**操作步骤**:
1. ✅ 配置已修改
2. ⚠️  请完全退出 FlClash 并重启
3. ⏳ 等待 FlClash 自动创建路由规则

---

## 验证结果

✅ **修复成功！**

- ✅ Ping 127.0.0.1: 响应时间 < 1ms
- ✅ Ping 10.17.196.39: 响应时间 5ms
- ✅ 路由表: 10.17.196.0/24 -> 10.17.77.1 (metric 40)
- ✅ HTTP 访问: http://10.17.196.39:8080 返回 200 OK

**FlClash 自动创建的路由**:
```
网段:          10.17.196.0/24
网关:          10.17.77.1
接口:          10.17.77.106 (WLAN)
Metric:        40
```

---

## 下一步建议

1. ✅ 配置已永久生效，以后重启 FlClash 会自动应用
2. 📝 建议备份配置文件，防止订阅更新覆盖
3. 🔄 如果订阅更新后失效，重新应用本配置即可
```

### 失败输出示例

```markdown
## 诊断报告

**问题类型**: 复合问题（DNS劫持 + 路由劫持）

**根本原因**:
1. fake-ip 模式将 127.0.0.1 解析成虚假 IP（28.0.0.1）
2. TUN 劫持了所有流量，包括本地回环

---

## 修复尝试

**尝试 1**: TUN路由排除
- 状态: ⚠️ 部分成功（路由劫持已解决）
- 但 DNS 仍被劫持，127.0.0.1 解析为 28.0.0.1

**尝试 2**: 追加 fake-ip-filter
- 状态: ✅ 配置已修改
- 等待验证...

---

## 验证结果

❌ **修复失败**（第 2 次尝试）

- ✅ Ping 127.0.0.1: 成功
- ❌ HTTP 访问: 连接被拒绝

**可能原因**:
1. 目标服务器本身没有运行
2. 服务器监听地址配置错误（如只监听 10.17.77.106）
3. 防火墙阻止了访问

---

## 下一步建议

🔴 **请先检查服务器本身**:

```bash
# 检查服务是否运行
netstat -ano | findstr :8080

# 检查监听地址
# 应该看到 0.0.0.0:8080 或 127.0.0.1:8080
```

如果服务器正常运行，请提供更多信息：
- 服务器日志
- 防火墙规则
- 浏览器具体错误信息
```

## 异常处理

### 异常 1: 配置文件无法定位

```
→ 🔴 CHECKPOINT
→ 询问用户提供配置文件路径
→ 或提供手动修改指南
```

### 异常 2: 需要管理员权限

```
→ 🔴 CHECKPOINT
→ 提示用户以管理员身份运行
→ 或提供手动命令（用户自行运行）
```

### 异常 3: 验证失败 3 次

```
→ 🔴 STOP
→ 输出当前诊断结果
→ 提示检查服务器本身
→ 不再继续尝试
```

## 性能优化

- 并行诊断：网络拓扑、TUN状态、DNS配置可并行执行
- 快速失败：如果 tunEnabled == false，立即返回
- 增量验证：每次修复后立即验证，而不是全部修复完再验证

## 版本历史

- v1.0.0 (2026-01-27): 初始版本，基于真实案例沉淀
