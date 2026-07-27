---
name: 修复-TUN路由排除
description: 在 VPN 配置文件中添加 inet4-route-exclude-address，彻底排除内网IP段，让其走物理网卡
version: 1.0.0
tags: [修复, TUN, 路由排除, 配置]
parent: vpn和tun模式绕过内网
---

# 目标

修改 VPN 配置文件，添加 `inet4-route-exclude-address` 配置，让 TUN 虚拟网卡不劫持内网IP段的流量。

## 何时使用

- 诊断结果显示：路由劫持问题
- TUN 虚拟网卡的 metric 低于物理网卡
- 需要彻底解决问题（一劳永逸）

## 输入契约

```json
{
  "configPath": "string",  // VPN 配置文件路径
  "vpnTool": "FlClash" | "Clash Verge" | "Clash for Windows",
  "targetSubnets": string[]  // 需要排除的网段（可选，默认全部内网）
}
```

## 配置修改

### 标准配置（推荐）

在配置文件中添加或修改 `tun` 部分：

```yaml
tun:
  enable: true
  stack: system  # 使用系统协议栈
  auto-route: true
  auto-detect-interface: true
  dns-hijack:
    - any:53
  inet4-route-exclude-address:  # ← 关键配置
    - 127.0.0.0/8          # 本地回环
    - 10.0.0.0/8           # A类私网
    - 172.16.0.0/12        # B类私网
    - 192.168.0.0/16       # C类私网
    - 224.0.0.0/4          # 组播地址
    - 240.0.0.0/4          # 保留地址
```

### 最小配置

如果只需要排除特定网段：

```yaml
tun:
  enable: true
  inet4-route-exclude-address:
    - 127.0.0.0/8          # 本地回环（必须）
    - 10.17.77.0/24        # 本机所在网段
    - 10.17.196.0/24       # 目标网段
```

### 配置说明

| 网段 | 范围 | 用途 |
|------|------|------|
| 127.0.0.0/8 | 127.0.0.1 - 127.255.255.255 | 本地回环（localhost） |
| 10.0.0.0/8 | 10.0.0.0 - 10.255.255.255 | A类私有网络 |
| 172.16.0.0/12 | 172.16.0.0 - 172.31.255.255 | B类私有网络 |
| 192.168.0.0/16 | 192.168.0.0 - 192.168.255.255 | C类私有网络 |

## 执行步骤

### 步骤 1: 定位配置文件

```python
def locate_config(vpnTool):
    if vpnTool == "FlClash":
        if platform == "Windows":
            return "C:\\Users\\{username}\\AppData\\Roaming\\com.follow\\clash\\profiles\\*.yaml"
        elif platform == "macOS":
            return "~/Library/Application Support/com.follow/clash/profiles/*.yaml"
        elif platform == "Linux":
            return "~/.config/com.follow/clash/profiles/*.yaml"
    
    elif vpnTool == "Clash Verge":
        return "~/.config/clash-verge/profiles/*.yaml"
    
    # 如果无法自动定位，询问用户
    return ask_user("请提供配置文件路径")
```

### 步骤 2: 备份原配置

```bash
# Windows PowerShell
Copy-Item $configPath "$configPath.backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"

# macOS/Linux
cp "$configPath" "$configPath.backup_$(date +%Y%m%d_%H%M%S)"
```

### 步骤 3: 读取并解析配置

```python
import yaml

with open(configPath, 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)
```

### 步骤 4: 添加或修改 TUN 配置

```python
# 如果没有 tun 配置，创建
if 'tun' not in config:
    config['tun'] = {}

# 确保基本配置存在
config['tun'].update({
    'enable': True,
    'stack': 'system',
    'auto-route': True,
    'auto-detect-interface': True
})

# 添加路由排除
config['tun']['inet4-route-exclude-address'] = [
    '127.0.0.0/8',
    '10.0.0.0/8',
    '172.16.0.0/12',
    '192.168.0.0/16',
    '224.0.0.0/4',
    '240.0.0.0/4'
]
```

### 步骤 5: 写回配置文件

```python
with open(configPath, 'w', encoding='utf-8') as f:
    yaml.dump(config, f, allow_unicode=True, default_flow_style=False)
```

### 步骤 6: 提示用户重启 VPN

```markdown
⚠️ **配置已修改，需要重启 VPN 生效**

操作步骤：
1. 完全退出 VPN（右键托盘图标 → 退出，不是最小化）
2. 重新启动 VPN
3. 确保 TUN 模式开启
4. 等待 3-5 秒，VPN 会自动创建路由规则

验证方法：
```bash
# Windows
route print | findstr "10.17.196"

# macOS/Linux
netstat -rn | grep "10.17.196"
```

预期结果：
应该看到类似这样的路由：
```
网段:          10.17.196.0/24
网关:          10.17.77.1 (你的路由器)
接口:          WLAN (物理网卡)
Metric:        40 (低于 TUN 的 0)
```
```

## 工作原理

### TUN 路由排除机制

1. **配置识别**：VPN 启动时读取 `inet4-route-exclude-address`
2. **路由创建**：在系统路由表中创建更具体的路由规则
3. **流量分流**：
   - 匹配排除列表的 IP → 走物理网卡
   - 其他 IP → 走 TUN 虚拟网卡

### 优先级计算

```
具体网段 > 通用网段
10.17.196.0/24 (metric 40) > 0.0.0.0/0 (metric 0, TUN默认路由)
```

### 真实案例

**本次会话的实际结果**：

修改配置后，FlClash 自动创建了这条路由：
```
Network Destination        Netmask          Gateway       Interface  Metric
      10.17.196.0    255.255.255.0       10.17.77.1     10.17.77.106     40
```

**说明**：
- 目标网段：10.17.196.0/24
- 走物理网关：10.17.77.1（路由器）
- 通过物理网卡：10.17.77.106 (WLAN)
- Metric 40 < FlClash TUN 的 metric 0（更优先）

## 异常处理

### 异常 1: 配置文件不存在

```
→ 🔴 CHECKPOINT
→ 询问用户确认路径
→ 或列出可能的路径让用户选择
```

### 异常 2: YAML 解析失败

```
→ 🔴 STOP
→ 配置文件格式错误，不能修改
→ 提示用户手动修改或提供正确的配置文件
```

### 异常 3: 写入权限不足

```
→ 🔴 CHECKPOINT
→ Windows: 提示以管理员身份运行
→ macOS/Linux: 提示使用 sudo 或修改文件权限
```

### 异常 4: VPN 不支持此配置

```
→ ⚠️  降级方案
→ 某些旧版本 Clash 不支持 inet4-route-exclude-address
→ 建议：
  1. 升级到 Clash Meta / mihomo 内核
  2. 或使用备选方案：手动添加静态路由
```

## 验证标准

**成功标志**：
1. ✅ 配置文件修改成功
2. ✅ VPN 重启无错误
3. ✅ 系统路由表中出现排除网段的路由
4. ✅ Metric 低于 TUN 默认路由
5. ✅ 实际访问测试成功

**失败情况**：
- ❌ 配置文件被覆盖（订阅更新）
- ❌ VPN 未自动创建路由（内核不支持）
- ❌ 路由 Metric 仍然是 0（配置未生效）

## 后续维护

### 防止订阅更新覆盖

**FlClash**：
1. 使用"配置预处理"（Prepend / Append）功能
2. 或使用"Mixin"模式（混合配置）

**Clash Verge**：
1. 使用"配置文件覆写"（Override）功能
2. 在"Script"模式下注入配置

**手动备份**：
```bash
# 每次修改后备份
cp config.yaml config.yaml.backup

# 订阅更新后恢复
# 手动合并 tun 配置段
```

## 模板参考

完整配置模板见：[[../../template/clash-tun-bypass.yaml]]

## 版本历史

- v1.0.0 (2026-01-27): 初始版本，基于 FlClash 真实案例
