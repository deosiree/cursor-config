---
name: 故障排查-常见问题决策树
description: 根据症状快速定位问题原因，提供诊断步骤和修复建议。
---

# 核心任务
基于用户报告的症状或测试失败结果，快速定位问题根因，提供诊断命令和修复建议。

## 何时使用
- 配置后仍有问题
- 验证测试失败
- 用户报告新症状

## 输入契约
- `symptoms`: 症状列表
  ```yaml
  - category: "internal"
    issue: "ping 不通"
    target: "10.17.196.39"
  
  - category: "browser"
    issue: "无法访问"
    target: "www.google.com"
  ```

## 输出契约
- `diagnosis`: 诊断结果
  ```yaml
  likelyIssue: "静态路由未生效"
  rootCause: "路由表中没有 10.0.0.0/8 的记录"
  diagnosticSteps: [...]
  fixSuggestions: [...]
  ```

## 决策树

### 症状 A：内网 ping 不通

```
内网 ping 不通
    ↓
检查静态路由是否存在
    ├─ 不存在 → 添加静态路由
    └─ 存在 ↓
        检查以太网网关是否可达
            ├─ 不可达 → 检查以太网连接
            └─ 可达 ↓
                检查 FlClash 是否排除了内网
                    ├─ 未排除 → 修改 FlClash 配置
                    └─ 已排除 → 检查防火墙
```

**诊断命令**：
```powershell
# 1. 检查静态路由
route print | findstr "10.0.0.0"

# 2. 检查以太网网关
Test-NetConnection 10.17.77.1

# 3. 检查 FlClash 配置
Select-String -Path "$env:USERPROFILE\.config\clash\profiles\*.yml" -Pattern "inet4-route-exclude"

# 4. 测试路由追踪
tracert -d -h 5 10.17.196.39
```

### 症状 B：外网 curl 不通

```
外网 curl 不通
    ↓
检查 FlClash 是否运行
    ├─ 未运行 → 启动 FlClash
    └─ 运行中 ↓
        检查 FlClash interface-name
            ├─ 未设置或错误 → 修改为 WLAN
            └─ 正确 ↓
                检查 WiFi metric
                    ├─ 过高 → 降低到 10
                    └─ 正常 ↓
                        检查 WiFi 是否有网
                            ├─ 无网 → 检查手机热点
                            └─ 有网 → 检查代理节点
```

**诊断命令**：
```powershell
# 1. 检查 FlClash 进程
Get-Process | Where-Object {$_.Name -like "*clash*"}

# 2. 检查 interface-name
Select-String -Path "$env:USERPROFILE\.config\clash\profiles\*.yml" -Pattern "interface-name"

# 3. 检查 WiFi metric
Get-NetIPInterface -InterfaceAlias "WLAN" | Select InterfaceMetric

# 4. 测试 WiFi 连通性
Test-NetConnection 8.8.8.8

# 5. 测试代理节点
Test-NetConnection planb.mojcn.com -Port 16617
```

### 症状 C：curl 通但浏览器不通

```
curl 通但浏览器不通
    ↓
检查系统代理是否启用
    ├─ 未启用 (ProxyEnable=0) → 启用系统代理
    └─ 已启用 ↓
        检查代理地址是否正确
            ├─ 错误 → 修改为 127.0.0.1:7890
            └─ 正确 ↓
                检查浏览器代理设置
                    ├─ 被覆盖 → 改为"使用系统代理"
                    └─ 正常 ↓
                        重启浏览器
```

**诊断命令**：
```powershell
# 1. 检查系统代理
Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' | Select ProxyEnable, ProxyServer

# 2. 启用系统代理
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyEnable -Value 1

# 3. 设置代理地址
Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name ProxyServer -Value "127.0.0.1:7890"

# 4. 重启浏览器
taskkill /F /IM chrome.exe
start chrome
```

### 症状 D：内网和外网都不通

```
全部不通
    ↓
检查 TUN 是否运行
    ├─ 未运行 → 启动 FlClash
    └─ 运行中 ↓
        检查网卡是否全部断开
            ├─ 是 → 检查物理连接
            └─ 否 ↓
                按照症状 A 和 B 依次排查
```

## 使用示例

### 输入
```yaml
symptoms:
  - category: "internal"
    target: "10.17.196.39"
    method: "ping"
    error: "请求超时"
    interface: "FlClash"  # 应该走以太网
```

### 输出
```yaml
diagnosis:
  likelyIssue: "静态路由未生效，内网流量被 TUN 拦截"
  rootCause: "route print 中没有 10.0.0.0/8 的记录"
  
  diagnosticSteps:
    - command: "route print | findstr \"10.0.0.0\""
      expectedOutput: "应显示 10.0.0.0 的路由记录"
      actualOutput: "无输出"
      conclusion: "静态路由缺失"
    
    - command: "Test-NetConnection 10.17.77.1"
      expectedOutput: "PingSucceeded: True"
      actualOutput: "PingSucceeded: True"
      conclusion: "以太网网关可达"
  
  fixSuggestions:
    - step: 1
      action: "添加静态路由"
      command: "route add -p 10.0.0.0 mask 255.0.0.0 10.17.77.1 metric 5 if 10"
    
    - step: 2
      action: "验证路由"
      command: "route print | findstr \"10.0.0.0\""
    
    - step: 3
      action: "测试内网连通性"
      command: "ping 10.17.196.39"
```

## 快速诊断表

| 症状 | 可能原因 | 快速检查 | 修复 |
|------|---------|---------|------|
| 内网不通 | 缺少静态路由 | `route print \| findstr "10.0.0.0"` | 添加静态路由 |
| 外网 curl 不通 | FlClash 出站接口错误 | 检查 `interface-name` | 改为 WLAN |
| 外网 curl 不通 | WiFi metric 过低 | `Get-NetIPInterface \| Select InterfaceAlias, InterfaceMetric` | 降低 WiFi metric |
| 浏览器不通 | 系统代理未启用 | 查看 `ProxyEnable` | 启用系统代理 |
| 全部不通 | TUN 未运行 | `Get-Process \| Where-Object {$_.Name -like "*clash*"}` | 启动 FlClash |

## 边界
- 只负责诊断和建议，不负责自动修复
- 不负责深度网络调试（如抓包分析）
- 复杂问题需要人工介入

## 常用配套
- `[[../执行-添加静态路由/SKILL.md]]`
- `[[../执行-调整网卡跃点数优先级/SKILL.md]]`
- `[[../执行-配置系统代理/SKILL.md]]`
