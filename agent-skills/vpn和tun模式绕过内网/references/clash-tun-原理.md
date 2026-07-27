# Clash TUN 模式工作原理

## TUN 是什么？

**TUN (Network TUNnel)** 是操作系统提供的虚拟网络接口，工作在 **OSI 第 3 层（网络层）**。

```
+------------------+
|   应用程序        |  Layer 7 (应用层)
+------------------+
|   TCP/UDP        |  Layer 4 (传输层)
+------------------+
|   IP 路由        |  Layer 3 (网络层) ← TUN 在这里工作
+------------------+
|   以太网/WiFi     |  Layer 2 (数据链路层)
+------------------+
|   物理网卡        |  Layer 1 (物理层)
+------------------+
```

### TUN vs TAP

| 特性 | TUN | TAP |
|------|-----|-----|
| 工作层 | Layer 3 (IP) | Layer 2 (Ethernet) |
| 处理对象 | IP 数据包 | 以太网帧 |
| 开销 | 低 | 高 |
| 应用场景 | VPN、代理 | 虚拟机桥接 |
| Clash 使用 | ✓ | ✗ |

---

## Clash TUN 模式工作流程

### 正常网络流程（无 TUN）
```
应用 → 发起请求 (example.com)
  ↓
DNS 解析 → 获取 IP (93.184.216.34)
  ↓
查询路由表 → 选择物理网卡
  ↓
物理网卡 → 发送到默认网关 → 互联网
```

### TUN 模式流程（Clash 介入）
```
应用 → 发起请求 (example.com)
  ↓
DNS 解析 → Clash DNS 劫持 → 返回 fake-ip (198.18.x.x)
  ↓
查询路由表 → TUN 接口 metric 最低 (0) → 选择 TUN
  ↓
Clash TUN 接口 → 接收 IP 数据包
  ↓
Clash 规则引擎 → 判断代理/直连
  ↓
  ├─ 代理 → 通过 SOCKS5/HTTP → VPN 服务器 → 目标
  └─ 直连 → 通过物理网卡 → 目标
```

---

## TUN 如何劫持流量？

### 1. 路由表优先级

```powershell
# 查看路由表
route print

# 输出示例：
网络目标        子网掩码          网关           接口        跃点数
0.0.0.0         0.0.0.0         <VPN网关>     <TUN>         0    ← 最高优先级
0.0.0.0         0.0.0.0         10.17.77.1   <物理>       256   ← 被覆盖
10.17.77.0      255.255.255.0   链路上        <物理>        20   ← 同子网仍走物理
```

**关键**: Metric (跃点数) 越小，优先级越高。TUN 通常设为 0，劫持所有流量。

### 2. Fake-IP 机制

```
用户访问: example.com
  ↓
Clash DNS: 不查询真实 DNS，直接返回 fake-ip (198.18.123.45)
  ↓
应用使用 fake-ip 发起连接
  ↓
Clash 内部维护映射: 198.18.123.45 ↔ example.com
  ↓
代理到 VPN 时使用真实域名 example.com
```

**优点**: 快速响应、避免 DNS 泄露  
**缺点**: 内网域名被 fake-ip 后无法访问（需配置 `fake-ip-filter`）

---

## 为什么 TUN 会阻断内网访问？

### 场景重现

```
本机: 10.17.77.106/24 (WLAN)
目标: 10.17.196.39 (跨子网内网服务器)
```

#### 阶段 1：没有 TUN（正常）
```powershell
# 路由表
10.17.77.0/24   -> 链路上 (WLAN)        metric 256
0.0.0.0/0       -> 10.17.77.1 (网关)   metric 256

# 访问 10.17.196.39
查询路由表 → 无匹配 → 使用默认路由
→ 发送到 10.17.77.1 (物理网关)
→ 网关转发到 10.17.196.0/24
→ 成功 ✓
```

#### 阶段 2：启用 TUN（阻断）
```powershell
# 路由表
0.0.0.0/0       -> <VPN网关> (TUN)     metric 0     ← 新增
10.17.77.0/24   -> 链路上 (WLAN)       metric 256
0.0.0.0/0       -> 10.17.77.1 (网关)  metric 256   ← 被覆盖

# 访问 10.17.196.39
查询路由表 → 无匹配本地 → 使用默认路由 (metric 0)
→ 发送到 TUN 接口
→ Clash 转发到 VPN 服务器
→ VPN 服务器不认识 10.17.196.39 (私有地址)
→ 丢弃或路由黑洞
→ 失败 ✗
```

---

## 三种绕过方案的原理对比

### 方案 A：TUN 路由排除 (inet4-route-exclude-address)

**原理**: 告诉 TUN 接口"不要劫持这些网段"

```yaml
tun:
  inet4-route-exclude-address:
    - 10.17.196.0/24
```

**效果**:
```powershell
# TUN 不会为排除的网段添加路由
0.0.0.0/0       -> <VPN网关> (TUN)     metric 0
10.17.196.0/24  -> 10.17.77.1 (网关)  metric 40    ← Clash 自动添加
10.17.77.0/24   -> 链路上 (WLAN)       metric 256
```

**优点**: 自动管理、持久化、优先级明确  
**缺点**: 需要知道所有内网网段

---

### 方案 B：fake-ip 过滤 (fake-ip-filter)

**原理**: DNS 层面绕过，返回真实 IP 而非 fake-ip

```yaml
dns:
  fake-ip-filter:
    - '*.company.com'
```

**效果**:
```
访问: gitlab.company.com
  ↓
Clash DNS: 匹配 filter → 查询真实 DNS
  ↓
返回真实 IP: 10.17.196.39
  ↓
应用使用真实 IP 连接
  ↓
... (仍需方案 A 或 C 解决路由问题)
```

**优点**: 解决域名场景  
**缺点**: 不解决 IP 直连问题

---

### 方案 C：静态路由 (route add)

**原理**: 手动添加高优先级路由，覆盖 TUN

```powershell
route add 10.17.196.0 mask 255.255.255.0 10.17.77.1 metric 5
```

**效果**:
```powershell
# 路由表
0.0.0.0/0       -> <VPN网关> (TUN)     metric 0
10.17.196.0/24  -> 10.17.77.1 (网关)  metric 5     ← 优先级高于 TUN
```

**优点**: 精确控制、跨平台  
**缺点**: 不持久化、需手动管理

---

## TUN Metric 陷阱

### 常见配置错误

```yaml
# 错误：TUN metric 设为 0
tun:
  auto-route: true
  inet4-route-metric: 0  # ❌ 劫持所有流量


# 正确配置
tun:
  auto-route: true
  # 不设置 metric（使用默认值）
  # 或设置更大的值
  inet4-route-metric: 100
```

### Metric 值建议

| 接口类型 | 推荐 Metric | 说明 |
|----------|-------------|------|
| 内网静态路由 | 5-10 | 最高优先级 |
| 局域网物理接口 | 20-50 | 同子网通信 |
| TUN 接口 | 100+ | 仅劫持需要代理的流量 |
| 默认物理网关 | 256 | 最低优先级 |

---

## DNS 劫持与 fake-ip 工作细节

### Enhanced Mode: fake-ip

```yaml
dns:
  enable: true
  enhanced-mode: fake-ip
  fake-ip-range: 198.18.0.0/16
  fake-ip-filter:
    - 'localhost'
    - '*.local'
```

**工作流程**:

1. **应用发起 DNS 查询**
   ```
   getaddrinfo("example.com")
   ```

2. **Clash 拦截并返回 fake-ip**
   ```
   返回: 198.18.1.1 (内存映射: example.com → 198.18.1.1)
   ```

3. **应用使用 fake-ip 发起连接**
   ```
   connect(198.18.1.1:443)
   ```

4. **TUN 接口接收数据包**
   ```
   目标: 198.18.1.1
   Clash 查询映射 → 还原为 example.com
   ```

5. **Clash 规则匹配**
   ```
   DOMAIN,example.com,PROXY
   → 通过代理访问
   ```

### fake-ip-filter 例外处理

```yaml
fake-ip-filter:
  - '*.company.com'  # 内网域名
```

**流程变化**:

```
查询: gitlab.company.com
  ↓
匹配 filter → 不使用 fake-ip
  ↓
查询真实 DNS (使用 nameserver 配置)
  ↓
返回真实 IP: 10.17.196.39
  ↓
应用直接使用真实 IP
  ↓
... (仍需路由表支持才能到达)
```

---

## 为什么 Rules 规则无法解决 TUN 问题？

### OSI 层次差异

```
Layer 7 (应用层) ← Rules 规则在这里工作
  ↓
Layer 4 (传输层)
  ↓
Layer 3 (网络层) ← TUN 在这里劫持
  ↓
Layer 2 (数据链路层)
  ↓
Layer 1 (物理层)
```

### 处理顺序

```
1. TUN 接口劫持数据包 (Layer 3)
   ↓
2. Clash 接收到数据包
   ↓
3. DNS 还原 (fake-ip → 真实域名)
   ↓
4. Rules 规则匹配 (Layer 7)
   ↓
5. 决策: PROXY / DIRECT
```

**问题**: 规则配置为 DIRECT，但数据包已经进入 TUN，无法"退回"物理网卡。

### 实验验证

```yaml
rules:
  - IP-CIDR,10.17.196.0/24,DIRECT  # ❌ 无效
```

**为什么无效**:

1. 数据包 → TUN 接口（Metric 0）
2. Clash 规则匹配 → DIRECT
3. Clash 尝试通过物理网卡发送
4. 但路由表仍认为应该走 TUN
5. 循环或失败

**正确做法**: 在路由表层面（Layer 3）解决，而非规则层面（Layer 7）。

---

## FlClash 自动路由管理

### auto-route: true

```yaml
tun:
  auto-route: true
```

**效果**:

1. **添加默认路由**: `0.0.0.0/0 → TUN`
2. **自动添加例外**: 根据 `inet4-route-exclude-address` 添加更具体的路由
3. **自动清理**: 退出时删除添加的路由

### inet4-route-exclude-address 实际行为

```yaml
tun:
  inet4-route-exclude-address:
    - 10.17.196.0/24
```

**FlClash 操作**:

```powershell
# 1. 添加 TUN 默认路由
route add 0.0.0.0 mask 0.0.0.0 <TUN网关> if <TUN> metric 0

# 2. 为排除网段添加例外路由
route add 10.17.196.0 mask 255.255.255.0 10.17.77.1 if <WLAN> metric 40

# 3. 退出时清理
route delete 0.0.0.0 mask 0.0.0.0 <TUN网关>
route delete 10.17.196.0 mask 255.255.255.0
```

**优势**: 自动管理、不需要手动维护。

---

## 相关技术参考

### RFC 文档
- [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918): 私有地址空间 (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
- [RFC 3927](https://datatracker.ietf.org/doc/html/rfc3927): 链路本地地址 (169.254.0.0/16)

### Clash 文档
- [TUN Mode Wiki](https://clash.wiki/configuration/tun.html)
- [DNS Configuration](https://clash.wiki/configuration/dns.html)

---

## 下一步阅读

- [网络层次与优先级](网络层次与优先级.md) - OSI 模型详解
- [真实案例库](真实案例库.md) - 实际问题与解决过程
- [常见错误模式](../assets/常见错误模式.md) - 避免踩坑
