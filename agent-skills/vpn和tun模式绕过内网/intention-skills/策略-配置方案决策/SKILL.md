---
name: 策略-配置方案决策
description: 根据问题诊断报告，决策需要执行哪些配置步骤、执行顺序、是否需要重启服务。
---

# 核心任务
基于问题诊断报告，输出具体的配置决策清单，包括需要执行的 feature skills、执行顺序、预期效果。

## 何时使用
- 已完成问题诊断，需要决定如何修复
- 需要规划配置步骤的顺序
- 需要判断是否需要备份配置或重启服务

## 输入契约
- `problemDiagnosis`: 来自 `[[../分析-路由表与优先级/SKILL.md]]` 的输出
- `userPreferences`: 用户偏好（可选）
  - `backupConfig`: 是否备份配置（默认 true）
  - `autoRestart`: 是否自动重启服务（默认 false，需用户确认）

## 输出契约
- `configurationPlan`: 配置决策清单
  ```yaml
  steps:
    - step: 1
      action: "backup_flclash_config"
      reason: "备份原配置以便回滚"
      featureSkill: null
      required: true
    
    - step: 2
      action: "add_static_route"
      reason: "让内网流量走以太网"
      featureSkill: "执行-添加静态路由"
      params:
        networkSegment: "10.0.0.0"
        subnetMask: "255.0.0.0"
        gateway: "10.17.77.1"
        interfaceIndex: 10
        metric: 5
      required: true
      expectedResult: "内网 ping 通"
    
    - step: 3
      action: "adjust_wifi_metric"
      reason: "提高 WiFi 优先级，让外网走 WiFi"
      featureSkill: "执行-调整网卡跃点数优先级"
      params:
        interfaceAlias: "WLAN"
        newMetric: 10
      required: true
      expectedResult: "外网流量优先走 WiFi"
    
    - step: 4
      action: "configure_flclash"
      reason: "指定出站接口 + 排除内网"
      featureSkill: "执行-配置FlClash"
      params:
        configPath: "C:\\Users\\Administrator\\.config\\clash\\profiles\\1756186733864.yml"
        interfaceName: "WLAN"
        routeExclude: ["10.0.0.0/8"]
      required: true
      expectedResult: "TUN 不拦截内网"
    
    - step: 5
      action: "enable_system_proxy"
      reason: "让浏览器走代理"
      featureSkill: "执行-配置系统代理"
      params:
        enable: true
      required: false  # 如果用户只用 curl，可选
      expectedResult: "浏览器能访问外网"
    
    - step: 6
      action: "restart_services"
      reason: "让 FlClash 配置生效"
      featureSkill: "执行-重启服务"
      params:
        services: ["FlClash", "Chrome"]
      required: true
      requiresUserConfirmation: true
  
  summary:
    totalSteps: 6
    estimatedTime: "5-10 分钟"
    requiresRestart: true
    rollbackPlan: "恢复备份的 FlClash 配置 + 删除静态路由"
  ```

## 执行步骤

### 1. 分析问题严重性
根据 `problemDiagnosis.issues` 的 `severity` 排序：
- `high` → 必须修复（如缺少静态路由）
- `medium` → 建议修复（如 WiFi metric 调整）
- `low` → 可选修复

### 2. 决定配置顺序

**推荐顺序**：
1. **备份配置**（防止配置错误需要回滚）
2. **OS 层配置**（静态路由 + WiFi metric）
3. **FlClash 配置**（interface-name + route-exclude）
4. **系统代理配置**
5. **重启服务**

**为什么这个顺序？**
- OS 层配置先生效，FlClash 依赖 OS 路由
- 静态路由优先于 FlClash 配置（FlClash 需要知道哪些流量被排除）
- 系统代理最后配（避免浏览器在配置中途尝试连接）
- 重启服务让所有配置生效

### 3. 判断可选步骤
- 用户只用 curl / 命令行工具 → 系统代理可选
- 用户明确表示不需要内网直连 → 静态路由可选
- 用户只有一张网卡 → WiFi metric 调整不需要

### 4. 生成回滚计划
```yaml
rollbackPlan:
  - step: "恢复 FlClash 配置"
    command: "Copy-Item backup.yml ~/.config/clash/profiles/xxx.yml"
  - step: "删除静态路由"
    command: "route delete 10.0.0.0"
  - step: "恢复 WiFi metric"
    command: "Set-NetIPInterface -InterfaceAlias WLAN -InterfaceMetric 30"
```

## 使用示例

### 输入
```yaml
problemDiagnosis:
  issues:
    - type: "missing_static_route"
      severity: "high"
    - type: "metric_conflict"
      severity: "medium"
    - type: "proxy_disabled"
      severity: "low"

userPreferences:
  backupConfig: true
  autoRestart: false  # 需要用户确认
```

### 输出
```yaml
configurationPlan:
  steps: [... 如上所示 ...]
  
  summary:
    criticalIssues: 1  # missing_static_route
    optionalIssues: 2
    estimatedTime: "5-10 分钟"
  
  userConfirmationRequired:
    - "重启 FlClash 和浏览器"
    - "修改 FlClash 配置文件"
```

## 边界
- 只负责决策配置方案，不负责执行
- 执行由各个 feature skills 负责
- 不负责验证配置是否生效（由 `[[../验证-网络连通性测试/SKILL.md]]` 负责）

## 常用配套
- `[[../../feature-skills/执行-添加静态路由/SKILL.md]]`
- `[[../../feature-skills/执行-调整网卡跃点数优先级/SKILL.md]]`
- `[[../../feature-skills/执行-配置FlClash/SKILL.md]]`
- `[[../../feature-skills/执行-配置系统代理/SKILL.md]]`
- `[[../../feature-skills/执行-重启服务/SKILL.md]]`

## 决策树

```
问题诊断
    ↓
缺少静态路由？
  ├─ 是 → 添加静态路由（必须）
  └─ 否 → 跳过
    ↓
WiFi metric 过低？
  ├─ 是 → 调整 WiFi metric（建议）
  └─ 否 → 跳过
    ↓
FlClash 未配置出站接口？
  ├─ 是 → 配置 interface-name（必须）
  └─ 否 → 跳过
    ↓
系统代理未启用？
  ├─ 是且用户用浏览器 → 启用代理（建议）
  └─ 否 → 跳过
    ↓
生成重启计划
```

---

## 用户确认点决策

### 何时停下来问用户

在以下情况下，**必须停下来**等待用户确认：

| 场景 | 停下来 | 原因 | 确认内容 |
|------|--------|------|---------|
| **检测到 3 张及以上网卡** | ✅ 必须 | 无法自动判断哪张是主外网接口 | "检测到多张外网接口：WiFi、USB 网卡。请问哪张是主外网接口？" |
| **静态路由与现有路由冲突** | ✅ 必须 | 可能覆盖重要配置 | "检测到已有 10.0.0.0/8 路由（metric 15）。是否覆盖为 metric 5？" |
| **检测到其他 VPN 软件运行** | ✅ 必须 | TUN 可能冲突 | "检测到 OpenVPN 正在运行。继续配置可能冲突，是否继续？" |
| **系统代理已被其他软件占用** | ⚠️ 建议 | 可能影响其他软件 | "系统代理指向 127.0.0.1:1080（非 FlClash）。是否改为 7890？" |
| **FlClash 配置文件有多个** | ✅ 必须 | 无法判断修改哪个 | "检测到 3 个配置文件。请选择要修改的文件。" |
| **以太网网关不可达** | ⚠️ 建议 | 静态路由可能无效 | "以太网网关 10.17.77.1 ping 不通。仍要添加静态路由吗？" |
| **需要重启服务** | ⚠️ 建议 | 可能中断用户工作 | "需要重启 FlClash 和浏览器。现在重启吗？" |

### 确认点触发时机

```
配置方案决策
    ↓
【检查点 1】网卡数量
    ├─ ≥3 张 → 🔴 STOP：询问主外网接口
    └─ 2 张 → 继续
    ↓
【检查点 2】现有路由冲突
    ├─ 有冲突 → 🔴 STOP：询问是否覆盖
    └─ 无冲突 → 继续
    ↓
【检查点 3】其他 VPN 软件
    ├─ 检测到 → 🔴 STOP：询问是否继续
    └─ 无 → 继续
    ↓
【检查点 4】系统代理冲突
    ├─ 被占用 → ⚠️ WARN：建议询问
    └─ 未占用 → 继续
    ↓
【检查点 5】重启确认
    ├─ autoRestart=false → ⚠️ WARN：询问是否重启
    └─ autoRestart=true → 自动重启
```

### 用户确认对话示例

#### 示例 1：多张网卡
```yaml
userConfirmation:
  type: "manual_selection"
  prompt: |
    检测到以下外网接口：
    1. WLAN (172.20.10.5) - 手机热点
    2. USB Ethernet (192.168.42.129) - USB 网卡
    
    请选择主外网接口（用于 FlClash TUN 出站）：
  options:
    - value: "WLAN"
      label: "WLAN（推荐：稳定性高）"
    - value: "USB Ethernet"
      label: "USB Ethernet"
  required: true
```

#### 示例 2：路由冲突
```yaml
userConfirmation:
  type: "yes_no"
  prompt: |
    检测到已有 10.0.0.0/8 静态路由：
    - 当前：10.0.0.0/8 → 10.17.77.254 metric 15
    - 新配置：10.0.0.0/8 → 10.17.77.1 metric 5
    
    是否覆盖现有路由？
  options:
    - value: "yes"
      label: "覆盖（推荐）"
      action: "删除旧路由，添加新路由"
    - value: "no"
      label: "保留现有"
      action: "跳过静态路由配置"
  default: "yes"
```

#### 示例 3：VPN 冲突
```yaml
userConfirmation:
  type: "yes_no_cancel"
  prompt: |
    检测到以下 VPN 软件正在运行：
    - OpenVPN (TAP 接口)
    
    FlClash TUN 可能与其冲突。建议选择：
  options:
    - value: "continue"
      label: "继续配置（风险：可能冲突）"
    - value: "stop_other_vpn"
      label: "停止 OpenVPN 后继续"
    - value: "cancel"
      label: "取消配置"
  recommended: "stop_other_vpn"
```

## 失败模式
- ❌ 问题诊断不完整 → 需要重新分析
- ❌ 用户不确认重启 → 停止执行，等待用户确认
