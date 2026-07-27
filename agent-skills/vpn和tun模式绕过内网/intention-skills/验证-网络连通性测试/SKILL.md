---
name: 验证-网络连通性测试
description: 执行内网 ping、外网 curl、浏览器访问测试，验证配置是否生效，若失败则定位问题。
---

# 核心任务
执行全面的网络连通性测试，验证内网直连 + 外网代理是否正常工作，若失败则调用故障排查决策树。

## 何时使用
- 配置步骤执行完成后，需要验证是否生效
- 用户报告配置后仍有问题，需要重新测试
- 定期检查网络配置是否正常

## 输入契约
- `testTargets`: 测试目标（可选，有默认值）
  ```yaml
  internal:
    - "10.17.196.39"  # 公司内网服务器
    - "t-cloud.lanniu.top"
  external:
    - "8.8.8.8"
    - "www.google.com"
    - "gemini.google.com"
  ```

## 输出契约
- `verificationResults`: 测试结果
  ```yaml
  tests:
    - category: "internal"
      target: "10.17.196.39"
      method: "ping"
      result: "success"
      latency: "1ms"
      interface: "以太网"
    
    - category: "external"
      target: "www.google.com"
      method: "curl"
      result: "success"
      statusCode: 200
      interface: "FlClash → WLAN"
    
    - category: "browser"
      target: "gemini.google.com"
      method: "manual"  # 需要用户手动确认
      result: "pending"
      instruction: "请在浏览器访问 gemini.google.com 并确认是否正常"
  
  summary:
    totalTests: 6
    passed: 5
    failed: 0
    pending: 1
    overallStatus: "success"
  
  troubleshooting: null  # 若有失败，调用故障排查
  ```

## 执行步骤

### 1. 内网连通性测试
调用 `[[../../feature-skills/执行-连通性测试/SKILL.md]]`

测试项：
```powershell
# Ping 内网 IP
ping 10.17.196.39 -n 4

# Ping 内网域名
ping t-cloud.lanniu.top -n 4

# 检查走的是哪个接口
Get-NetRoute -DestinationPrefix 10.0.0.0/8 | Select InterfaceAlias
```

**预期结果**：
- ✅ Ping 通
- ✅ 延迟 < 10ms
- ✅ 走以太网接口

### 2. 外网连通性测试（命令行）
```powershell
# Curl 外网
curl https://www.google.com

# 测试代理节点
Test-NetConnection -ComputerName planb.mojcn.com -Port 16617

# 检查走的是哪个接口
Get-NetRoute -DestinationPrefix 0.0.0.0/0 | Select InterfaceAlias
```

**预期结果**：
- ✅ Curl 返回 HTML（可能是日文）
- ✅ 代理节点可达
- ✅ 走 FlClash 接口

### 3. 浏览器测试
**测试项**：
1. 打开浏览器，访问 `https://www.google.com`
2. 访问 `https://gemini.google.com`
3. 确认页面正常加载（不是超时或被墙）

**预期结果**：
- ✅ 页面正常打开
- ✅ 没有 "无法访问此网站" 错误

### 4. 若有测试失败
调用 `[[../../feature-skills/故障排查-常见问题决策树/SKILL.md]]`

传入：
```yaml
failedTests:
  - category: "internal"
    target: "10.17.196.39"
    error: "请求超时"
  
  - category: "browser"
    target: "www.google.com"
    error: "无法访问此网站"
```

## 使用示例

### 输入
```yaml
testTargets:
  internal:
    - "10.17.196.39"
  external:
    - "www.google.com"
```

### 输出（全部成功）
```yaml
verificationResults:
  tests:
    - category: "internal"
      target: "10.17.196.39"
      method: "ping"
      result: "success"
      latency: "1ms"
      ttl: 62
      interface: "以太网"
    
    - category: "external"
      target: "www.google.com"
      method: "curl"
      result: "success"
      statusCode: 200
      responseSize: "15KB"
      interface: "FlClash"
  
  summary:
    overallStatus: "success"
    internalConnectivity: "ok"
    externalConnectivity: "ok"
    browserConnectivity: "pending"  # 需要用户确认
  
  nextSteps:
    - "请在浏览器访问 www.google.com 确认是否正常"
    - "若浏览器也正常，配置完成"
```

### 输出（部分失败）
```yaml
verificationResults:
  tests:
    - category: "internal"
      target: "10.17.196.39"
      method: "ping"
      result: "failed"
      error: "请求超时"
    
    - category: "external"
      target: "www.google.com"
      method: "curl"
      result: "success"
  
  summary:
    overallStatus: "partial_failure"
    failedCategories: ["internal"]
  
  troubleshooting:
    likelyIssue: "静态路由未生效"
    diagnosticSteps:
      - "检查路由表：route print | findstr \"10.0.0.0\""
      - "检查以太网网关：ipconfig"
      - "尝试手动添加路由"
```

## 边界
- 只负责执行测试和调用故障排查，不负责修复问题
- 浏览器测试需要用户手动确认
- 不负责深度调试（如抓包分析）

## 常用配套
- `[[../../feature-skills/执行-连通性测试/SKILL.md]]` - 执行 ping/curl
- `[[../../feature-skills/故障排查-常见问题决策树/SKILL.md]]` - 失败时调用

## 测试矩阵

| 类别 | 测试目标 | 方法 | 预期接口 | 预期结果 |
|------|---------|------|---------|---------|
| 内网 IP | 10.17.196.39 | ping | 以太网 | < 10ms |
| 内网域名 | t-cloud.lanniu.top | ping | 以太网 | 可解析 + 通 |
| 外网 IP | 8.8.8.8 | ping | FlClash | < 500ms |
| 外网 HTTP | www.google.com | curl | FlClash | HTTP 200 |
| 代理节点 | planb.mojcn.com:16617 | Test-NetConnection | FlClash | 可达 |
| 浏览器 | gemini.google.com | 手动 | FlClash | 页面正常 |

## 失败模式
- ❌ 内网不通 → 静态路由问题
- ❌ 外网 curl 不通 → FlClash 出站接口问题
- ❌ 浏览器不通（curl 通） → 系统代理问题
