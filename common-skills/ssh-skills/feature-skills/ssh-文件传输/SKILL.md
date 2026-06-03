---
name: ssh-文件传输
description: 通过 SSH 在本地与 jump/集群间传输文件 — 拉取日志、推送配置、跨跳板机搬运。
tags:
  - SSH
  - SCP
  - SFTP
  - pscp
  - 文件传输
  - 日志导出
  - 配置推送
should-trigger:
  - pscp / pscp.exe / scp / sftp（独立 token）
  - kubectl cp（独立 token）
  - SCP / SFTP / rsync over SSH
  - 从 jump/集群拉取文件到本地 / 拉日志到本地
  - 从本地推送文件到 jump/集群 / 传文件到服务器
  - 导出 K8s Pod 内容 / kubectl cp
  - 跨跳板机搬运文件 / 中转传输
  - kubectl logs --tail 不够用，需要完整日志文件
should-not-trigger:
  - 仅查看日志（转 ssh-k8s-浏览后端日志）
  - 仅端口转发（转 ssh-端口转发）
  - 文件在本地 / 不需要跨 SSH 传输
---

# SSH 文件传输

> 通过跳板机在本地与内网间安全传输文件。Windows 下用 `pscp`（PuTTY 套件），在 jump 上用 `scp`。

## RED（失败基线）

- `pscp` 不在 PATH → 与 plink 同目录但未配置
- Windows 路径含空格未加引号 → `"C:\Program Files\...\pscp.exe"`
- hostkey 未缓存 → pscp 首次连接交互式提示
- `kubectl cp` 前未确认 Pod 内路径 → `resource not found`
- 大文件传输无压缩/进度 → 以为卡死

## 何时不要使用

- 仅查看日志（转 `ssh-k8s-浏览后端日志`）
- 仅需端口转发（转 `ssh-端口转发`）
- 文件在本地 / 不需要跨 SSH 传输

## 何时使用

- 从 jump / K8s Pod 拉取日志文件到本地分析（大数据量 `--tail` 不够时）
- 推送本地配置文件到 jump 或 K8s 容器
- 需要在不同跳板机之间搬运文件
- 需要导出 Pod 内的特定文件（`kubectl cp`）

## 前置

1. SSH 凭证就绪（同父 skill）
2. `pscp`（Windows PuTTY 传文件工具）可用；或 `scp`（已配 OpenSSH 时）
3. 源路径和目标路径已知

> **🔴 检查点：** Windows 下确认 `pscp` 在 PATH 中或 plink 同目录：`where pscp 2>nul`。如果没有，降级为 `scp` 或 `kubectl cp`。

## 标准流程

### 1. pscp（Windows → jump / jump → Windows）

> 以下命令中 `10.17.196.48` 为 48 集群默认 jump IP。实际执行时从 `../../config/ssh.config.json` → `jumpHost` 读取。

```powershell
# Windows → jump 推送（push）
& "C:\Program Files\PuTTY\pscp.exe" -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -hostkey SHA256:... `
  "local-file.txt" "shr@10.17.196.48:/home/shr/"

# jump → Windows 拉取（pull）
& "C:\Program Files\PuTTY\pscp.exe" -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -hostkey SHA256:... `
  "shr@10.17.196.48:/home/shr/remote-file.log" "C:\temp\"
```

> `pscp` 路径默认与 `plink` 同目录（同 PuTTY 套件）；参考 `../../config/ssh.config.json` → `plinkPath` 推断。

### 2. scp（jump 内部 / OpenSSH 用户）

```bash
# push 本地到 jump
scp -P 22 -o StrictHostKeyChecking=accept-new local.txt shr@10.17.196.48:~/remote/

# pull jump 到本地
scp -P 22 -o StrictHostKeyChecking=accept-new shr@10.17.196.48:~/remote.log .
```

### 3. kubectl cp（K8s Pod 与 jump 之间）

当文件在 K8s Pod 内部，需要先拉到 jump 机再转本地：

```powershell
# 第 1 步：Pod → jump
# SSH 到 jump 后在 jump 上执行：
kubectl cp platform/<pod名>:/app/logs/app.log ./app-exported.log

# 第 2 步：jump → Windows（用 pscp 或 scp）
pscp shr@10.17.196.48:~/app-exported.log C:\temp\
```

> **🔴 检查点：** `kubectl cp` 需要 Pod 内目标文件存在。先 `kubectl exec <pod> -- ls /app/logs/` 确认路径。

### 4. 目录传输

```bash
# pscp -r 递归目录
pscp -r -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD shr@10.17.196.48:/home/shr/logs/ C:\temp\logs\

# scp -r
scp -P 22 -r shr@10.17.196.48:~/logs/ ./logs/

# kubectl cp 递归（不支持通配符，必须指定目录）
kubectl cp platform/<pod名>:/app/logs ./pod-logs/
```

### 5. 跨跳板机搬运

需要经过中间节点时，用 `-o ProxyJump`（OpenSSH）或隧道转发：

```powershell
# OpenSSH 三跳传输（本地 → jumpA → jumpB → target）
scp -o ProxyJump="shr@10.17.196.48" -o StrictHostKeyChecking=accept-new `
  local.txt shr@10.17.196.47:~/remote/
```

## 2026-06 会话样本

### 场景 A：从 48 集群拉取大日志到本地

```text
# 步骤 1：确认 Pod 内路径
> kubectl exec seccenter-v2-xxxxx -n platform -- ls /app/logs/
  app.log   size: 245MB

# 步骤 2：Pod → jump
> kubectl cp platform/seccenter-v2-xxxxx:/app/logs/app.log ./app-20260610.log
  tar: Removing leading `/` from member names
  # 245MB 传输成功

# 步骤 3：jump → Windows
> pscp shr@10.17.196.48:~/app-20260610.log C:\temp\
  app-20260610.log | 256901 kB | 6.3 MB/s | ETA: 00:00:00 | 100%

本地分析：`notepad++ C:\temp\app-20260610.log` + grep \"ERRO"
```

### 场景 B：推送补丁 YAML 到 jump → Pod

```text
# 步骤 1：Windows → jump
> pscp C:\dev\menu-patch-0602.yaml shr@10.17.196.48:~/patches/
  menu-patch-0602.yaml | 12 kB

# 步骤 2：jump → Pod（有 /tmp 可写时）
> kubectl cp ~/patches/menu-patch-0602.yaml platform/seccenter-v2-xxxxx:/tmp/menu-patch-0602.yaml
```

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `pscp: command not found` | 未安装或不在 PATH | 从 PuTTY 安装目录找；同 `plinkPath` 目录；或用 `scp` 替代 |
| `pscp: host key not found` | 首次连接无缓存 | 加 `-hostkey SHA256:...` 同 plink；从 `config/ssh.config.local.json` 取 hostkey |
| `scp: Connection refused` | jump 机 SSH 端口不对 / VPN 未连 | 确认端口 22 开放；检查 VPN/morbax；ping 测试连通性 |
| `kubectl cp: resource not found` | Pod 名/路径错 | `kubectl exec <pod> -- ls <路径>` 先确认文件和 Pod 名 |
| `kubectl cp` 拷贝大文件慢 | 默认无压缩、单线程 | `tar cf - <路径> \| ssh ... tar xf -` 管道传输更快；或 `kubectl exec` 内用 wget |
| 跨跳板机传输 `ProxyJump` 失败 | 跳板机未配 ProxyJump 支持 | 先测试单跳 `pscp jumpA → local`；或用逐跳中转（jumpA `scp` → jumpB → 再 `scp` 回） |
| `kubectl cp` 报 `tar: Removing leading` | 绝对路径转相对路径的正常警告 | 可忽略；文件正常传输完成 |
| pscp Windows 路径含空格报错 | 未用引号包裹空格路径 | `"C:\Program Files\PuTTY\pscp.exe"` 全路径加引号 |
| `kubectl cp --to-stdout` 报 `unknown flag` | jump 机 kubectl 版本 < v1.18，不支持 `--to-stdout` | 改用两步法：`kubectl cp <pod>:<path> ./local-file` 先拉到 jump，再 `pscp` 到 Windows |
| `kubectl exec -- ls /app/logs/` 返回 `No such file` | Pod 不写文件日志，走 stdout；或路径不是 `/app/logs/` | 先 `kubectl exec <pod> -- ls /app/` 探测实际目录结构；如无日志文件则用 `kubectl logs --tail` 替代 |

## 输出契约

| 字段 | 说明 |
|------|------|
| `method` | `pscp` / `scp` / `kubectl cp` |
| `direction` | `push`（本地→远程）或 `pull`（远程→本地） |
| `source` | 源路径 |
| `target` | 目标路径 |
| `fileSize` | 传输后的文件大小（验证完整性） |

## 关联

- 父 skill：[`../../SKILL.md`](../../SKILL.md)
- 依赖：`../../config/ssh.config.json` → `plinkPath`（推断 pscp 路径）
- 会话日志：[`../../session-log/`](../../session-log/)
