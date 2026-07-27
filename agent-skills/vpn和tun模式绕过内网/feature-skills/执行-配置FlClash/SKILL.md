---
name: 执行-配置FlClash
description: 修改 FlClash 配置文件，设置出站接口（interface-name）和路由排除（inet4-route-exclude-address）。
---

# 核心任务
修改 FlClash 的 YAML 配置文件，添加或更新 `interface-name` 和 `inet4-route-exclude-address`，让 TUN 使用指定网卡出站并排除内网流量。

## 何时使用
- FlClash TUN 未指定出站接口，导致选错网卡
- 需要让 TUN 排除内网流量（不代理内网）
- 需要强制 TUN 使用 WiFi 而不是以太网出站

## 核心原理

### interface-name（出站接口）
- **作用**：指定 TUN 使用哪张网卡发送流量
- **为什么需要**：TUN 可能自动选择以太网（无外网网关）→ 外网不通
- **配置**：`interface-name: WLAN`（使用 WiFi）

### inet4-route-exclude-address（路由排除）
- **作用**：让 TUN 不拦截特定网段的流量
- **为什么需要**：配合 OS 静态路由，让内网流量直连
- **配置**：`inet4-route-exclude-address: [10.0.0.0/8]`

## 输入契约
- `configPath`: FlClash 配置文件路径（如 `C:\Users\Administrator\.config\clash\profiles\1756186733864.yml`）
- `interfaceName`: 出站接口名称（如 "WLAN"）
- `routeExclude`: 路由排除网段列表（如 `["10.0.0.0/8"]`）
- `backupConfig`: 是否备份原配置（默认 true）

## 输出契约
- `configModified`: 是否修改成功
- `backupPath`: 备份文件路径
- `changes`: 修改内容
  ```yaml
  configPath: "C:\\Users\\Administrator\\.config\\clash\\profiles\\1756186733864.yml"
  backupPath: "C:\\Users\\Administrator\\.config\\clash\\profiles\\1756186733864.yml.backup"
  changes:
    - field: "interface-name"
      oldValue: null
      newValue: "WLAN"
    - field: "tun.inet4-route-exclude-address"
      oldValue: null
      newValue: ["10.0.0.0/8"]
  requiresRestart: true
  ```

## 执行步骤

### 1. 定位配置文件
默认路径：
```
C:\Users\<用户名>\.config\clash\profiles\<数字>.yml
```

查找命令：
```powershell
Get-ChildItem "$env:USERPROFILE\.config\clash\profiles\*.yml" | Select FullName, LastWriteTime
```

### 2. 备份配置
```powershell
Copy-Item "C:\Users\Administrator\.config\clash\profiles\1756186733864.yml" "C:\Users\Administrator\.config\clash\profiles\1756186733864.yml.backup"
```

### 3. 修改配置

**目标配置**：
```yaml
# 在顶层添加（与 proxies、rules 同级）
interface-name: WLAN

# 在 tun 部分添加
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false  # 禁用自动检测，强制使用 interface-name
  inet4-route-exclude-address:
    - 10.0.0.0/8  # 排除内网
```

**修改方式**：
1. 读取 YAML 文件
2. 添加或更新 `interface-name` 字段
3. 在 `tun` 部分添加或更新 `inet4-route-exclude-address`
4. 写回文件

### 4. 验证配置
```powershell
# 检查配置语法
Select-String -Path "C:\Users\Administrator\.config\clash\profiles\1756186733864.yml" -Pattern "interface-name|inet4-route-exclude"
```

**预期输出**：
```
interface-name: WLAN
    inet4-route-exclude-address:
      - 10.0.0.0/8
```

## 使用示例

### 输入
```yaml
configPath: "C:\\Users\\Administrator\\.config\\clash\\profiles\\1756186733864.yml"
interfaceName: "WLAN"
routeExclude:
  - "10.0.0.0/8"
backupConfig: true
```

### 输出
```yaml
configModified: true
backupPath: "C:\\Users\\Administrator\\.config\\clash\\profiles\\1756186733864.yml.backup"
changes:
  - field: "interface-name"
    action: "added"
    newValue: "WLAN"
  - field: "tun.inet4-route-exclude-address"
    action: "added"
    newValue: ["10.0.0.0/8"]
requiresRestart: true
restartCommand: "重启 FlClash 应用"
```

## 完整配置示例

```yaml
# FlClash 配置文件示例
port: 7890
socks-port: 7891
allow-lan: false
mode: rule
log-level: info
external-controller: 127.0.0.1:9090

# 强制使用 WiFi 出站
interface-name: WLAN

# 代理配置
proxies:
  - name: "香港节点"
    type: trojan
    server: planb.mojcn.com
    port: 16617
    # ...

# TUN 配置
tun:
  enable: true
  stack: system
  auto-route: true
  auto-detect-interface: false  # 禁用自动检测
  inet4-route-exclude-address:
    - 10.0.0.0/8          # 排除内网 A 类
    # - 192.168.0.0/16    # 可选：排除 C 类私网
    # - 172.16.0.0/12     # 可选：排除 B 类私网

# 路由规则
rules:
  - DOMAIN-SUFFIX,google.com,PROXY
  - GEOIP,CN,DIRECT
  - MATCH,PROXY
```

## 边界
- 只负责修改配置文件，不负责重启 FlClash
- 不负责验证配置语法（FlClash 启动时会验证）
- 不负责判断应该使用哪张网卡（由上层 intention 决策）

## 失败模式
- ❌ 配置文件路径不存在 → 需要用户提供正确路径
  ```powershell
  Get-ChildItem "$env:USERPROFILE\.config\clash\profiles\*.yml"
  ```
- ❌ YAML 语法错误 → FlClash 启动失败
  - 检查缩进（使用空格，不是 Tab）
  - 检查列表格式（`-` 后面要有空格）
- ❌ 接口名称错误 → TUN 仍选错接口
  ```powershell
  Get-NetAdapter | Select Name  # 查看正确的接口名
  ```

## 回滚
恢复备份配置：
```powershell
Copy-Item "C:\Users\Administrator\.config\clash\profiles\1756186733864.yml.backup" "C:\Users\Administrator\.config\clash\profiles\1756186733864.yml"
```

## 与其他配置的关系

```
静态路由 (metric 5) → 强制内网走以太网
    ↑ 配合
FlClash route-exclude → TUN 不拦截内网
    ↑ 配合
FlClash interface-name → TUN 使用 WiFi 出站
    ↑ 依赖
WiFi metric 调整 (10) → WiFi 优先级高于以太网
```

## 常见配置变体

### 只排除特定域名
```yaml
tun:
  inet4-route-address:  # 只代理这些
    - 0.0.0.0/0
  inet4-route-exclude-address:
    - 10.0.0.0/8
```

### 排除多个内网网段
```yaml
tun:
  inet4-route-exclude-address:
    - 10.0.0.0/8
    - 192.168.0.0/16
    - 172.16.0.0/12
```

### 指定特定子网段
```yaml
tun:
  inet4-route-exclude-address:
    - 10.17.0.0/16  # 只排除 10.17.x.x
```

## 诊断命令
```powershell
# 查看 FlClash 是否在运行
Get-Process | Where-Object {$_.Name -like "*clash*"}

# 查看 FlClash TUN 接口
Get-NetAdapter | Where-Object {$_.Name -like "*clash*"}

# 测试 TUN 是否使用了正确的接口
Test-NetConnection 8.8.8.8 -TraceRoute
```
