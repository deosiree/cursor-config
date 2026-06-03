---
name: ssh-端口转发
description: SSH 端口转发隧道 — 通过 jump 机访问内网未暴露服务：数据库隧道、Actuator/JMX、内部管理页面、SOCKS 代理浏览器。
tags:
  - SSH
  - port-forward
  - port-forwarding
  - tunnel
  - plink -L
  - SOCKS
  - 数据库隧道
  - Actuator
should-trigger:
  - plink -L / ssh -L / -D 1080 / -R（命令行 token）
  - port-forward / port forwarding / tunnel / tunneling（英文短 token）
  - SSH 端口转发 / SSH 隧道 / 本地转发 / 远程转发
  - 数据库连接 Navicat/DBeaver 需要 SSH 隧道
  - Spring Actuator / JMX / debug 端口在集群内部
  - SOCKS 代理 / 浏览器隧道访问内网页面
  - 内网服务端口未暴露但需要从本机工具连接
should-not-trigger:
  - 已有 ingress / NodePort 可直接访问服务
  - 仅需 kubectl logs（转 ssh-k8s-浏览后端日志）
  - 用户需要的是持久化 VPN 而非临时 SSH 隧道
---

# SSH 端口转发隧道

> 从 `ssh-k8s-浏览后端日志` 中提取独立成 skill，覆盖本地转发、远程转发、SOCKS 代理三种模式。

## RED（失败基线）

- 没加 `-N` → plink 分配 pty，隧道不保持
- 本机端口被占用 → `bind: Address already in use`
- 目标地址写 `localhost` 但服务不在跳板机本身 → 转发地址应是内网 IP
- SOCKS DNS 不解析 → 浏览器未开 remote DNS
- 跳板机掉线后不重连 → VPN 波动导致隧道静默断开

## 何时不要使用

- 已有 ingress / NodePort 可直接访问 → 不必开隧道
- 需要持久化 VPN（每天用）→ SSH 隧道不适合长期 7×24 使用
- 只需查日志（转 `ssh-k8s-浏览后端日志`）

## 何时使用

- 需要访问内网**未暴露到 ingress** 的服务（Actuator health、JMX、内部管理页面）
- 需要从本机连接内网**数据库**（MySQL、PostgreSQL、Redis）
- 需要在本机浏览器访问内网**管理控制台**（NodePort 未开、无公网 LB）
- 需要绕过公司网络限制临时访问内网资源

## 前置

1. jump 机 SSH 就绪（同父 skill 前置）
2. 目标服务地址（IP:Port 或 Pod IP:Port）已知
3. 本机端口（转发用的本地端口）未占用

> **🔴 检查点：** 确认本机端口没有被占用：`netstat -ano | findstr :<本地端口>`。如果被占用，换端口或先停占用进程。

## 三种转发模式

### 1. 本地转发 `-L`（最常用）

> 以下命令中 `10.17.196.48` 为 48 集群默认 jump IP。实际执行时从 `../../config/ssh.config.json` → `jumpHost` 读取。

本机端口 → 跳板机 → 目标内网服务

```text
本地:8088 → SSH → jump:10.17.196.48 → internal:127.0.0.1:8088
```

```powershell
# Actuator / HTTP 服务
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -L 8088:127.0.0.1:8088 10.17.196.48 -N

# 数据库（MySQL:3306、PG:5432、Redis:6379）
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -L 33060:127.0.0.1:3306 10.17.196.48 -N

# 转发到集群内其他机器（非本机 127.0.0.1）
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -L 9090:10.233.1.100:8088 10.17.196.48 -N
```

> `-N`：不执行远程命令，仅保持隧道。plink 下必须加 `-N` 否则跳板机会分配 pty。

### 2. 远程转发 `-R`（内网穿透）

内网服务端口暴露到公网/jump 机端口：

```powershell
# 将本地 3000 → jump 机 19999（让跳板机能访问你的本地服务）
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -R 19999:127.0.0.1:3000 10.17.196.48

# 然后跳板机上：curl http://127.0.0.1:19999
```

### 3. SOCKS 代理 `-D`（浏览器隧道）

```powershell
# 开 SOCKS5 代理，本机 1080 → 跳板机 → 所有内网
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -D 1080 10.17.196.48 -N
```

浏览器配置 Firefox → 设置 → 网络设置 → 手动代理 → SOCKS 主机 `127.0.0.1:1080` → SOCKS v5 → ✅ 然后访问内网页面。

## 断连重连

端口转发连接不稳定时（内网 VPN 波动），快速重连：

```powershell
# 加 -C 压缩传输，-o ServerAliveInterval=30 每 30s 发心跳
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey -L 8088:127.0.0.1:8088 10.17.196.48 -N -C
```

Windows 下可以用批处理自动重连：

```batch
:loop
plink.exe -ssh -P 22 -l shr -pw %SSH_JUMP_PASSWORD% -batch -hostkey SHA256:... -L 8088:127.0.0.1:8088 10.17.196.48 -N
echo Tunnel dropped, reconnecting in 5s...
timeout /t 5
goto loop
```

## 2026-06 会话样本

### 场景 A：隧道连 Actuator 排障

```text
# Agent 执行
> plink -L 8088:127.0.0.1:8088 10.17.196.48 -N
> curl http://localhost:8088/actuator/health
  {"status":"DOWN","components":{"db":{"status":"DOWN"}}}
> curl http://localhost:8088/actuator/metrics/http.server.requests
  {"name":"http.server.requests", ... "count":0}

结论：DB 连接挂了 → 切到 `ssh-k8s-浏览后端日志` 查 Pod 日志
```

### 场景 B：SOCKS 代理浏览器看内网管理后台

```text
# Agent 执行
> plink -D 1080 10.17.196.48 -N    分配新窗口
> 浏览器配 SOCKS5 127.0.0.1:1080
> 打开 http://192.168.1.50:8081/admin
  → 管理后台可访问

验证：关闭 SOCKS → 不可访问；重开 SOCKS → 可访问 → 隧道正常
```

## 多场景示例

| 目标 | 命令 | 本机访问 |
|------|------|----------|
| Spring Actuator | `-L 8088:127.0.0.1:8088` | `http://localhost:8088/actuator/health` |
| MySQL 数据库 | `-L 33060:127.0.0.1:3306` | `mysql -h 127.0.0.1 -P 33060 -u root -p` |
| Redis | `-L 63790:127.0.0.1:6379` | `redis-cli -h 127.0.0.1 -p 63790` |
| Nginx status | `-L 9090:127.0.0.1:9090` | `http://localhost:9090/nginx_status` |
| 内网管理后台 | `-D 1080` (SOCKS) | 浏览器代理为 SOCKS5 127.0.0.1:1080 |
| K8s API (非 kubectl) | `-L 64430:127.0.0.1:6443` | `curl https://localhost:64430/api/v1/namespaces` |

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `bind: Address already in use` | 本地端口已被占用 | `netstat -ano \| findstr :<port>` 查占用进程 |
| `Forwarded connection refused` | 目标端口未监听 / 地址不对 | 先 SSH 到 jump 机 `curl 127.0.0.1:目标端口` 确认可达 |
| 连接一会就断 | VPN 不稳定 | 加 `-C` 压缩 + heartbeat；用 batch 自动重连 |
| SOCKS 能连但不解析 DNS | 远程 DNS | 浏览器配 `proxy remote_dns` 或 firefox about:config `network.proxy.socks_remote_dns=true` |
| plink `-N` 后无响应 | 正常行为 | 隧道阻塞在此窗口；另开窗口做本地访问 |
| `-L` 转发后浏览器访问 IP 错 | 用 `localhost` 而非 IP | 某些服务绑定 `127.0.0.1` 而非 `0.0.0.0` |

## 输出契约

| 字段 | 说明 |
|------|------|
| `mode` | `local` / `remote` / `socks` |
| `tunnelCommand` | 实际执行的 plink/ssh 命令 |
| `localEndpoint` | 本机可访问的地址（如 `localhost:8088`） |
| `remoteTarget` | 内网目标地址 |
| `testCommand` | 验证隧道是否通的命令（如 `curl http://localhost:8088/actuator/health`） |

## 关联

- 父 skill：[`../../SKILL.md`](../../SKILL.md)
- 互补 skill：[`../ssh-k8s-浏览后端日志/SKILL.md`](../ssh-k8s-浏览后端日志/SKILL.md)（端口转发后查日志）
- 会话日志：[`../../session-log/`](../../session-log/)
