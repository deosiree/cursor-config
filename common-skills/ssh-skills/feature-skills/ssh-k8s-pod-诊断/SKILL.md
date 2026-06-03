---
name: ssh-k8s-pod-诊断
description: K8s Pod 深度诊断 — CrashLoopBackOff、OOMKilled、ImagePullBackOff、Init:Error、Pod NotReady 的根因排查。与 ssh-k8s-浏览后端日志（仅 logs）互补。
tags:
  - kubectl
  - describe
  - events
  - pod诊断
  - CrashLoopBackOff
  - OOMKilled
  - exec
should-trigger:
  - CrashLoopBackOff / OOMKilled / ImagePullBackOff / Init:Error / RunContainerError（独立 token）
  - Exit Code: 137 / Exit Code: 139 / OOMKilling
  - kubectl describe pod / kubectl describe node / kubectl get events
  - kubectl exec / kubectl top pod / kubectl top node
  - kubectl logs --previous
  - Pod 状态异常且 kubectl logs 看不出根因
  - Pod NotReady / Pod 一直重启 / Pod 起不来
should-not-trigger:
  - 仅查日志即可定位（转 ssh-k8s-浏览后端日志）
  - 只需看 toast 错误码（转 Network 面板）
  - 用户仅需要 kubectl logs 实时跟输出
---

# SSH + K8s：Pod 深度诊断

> 补充 `ssh-k8s-浏览后端日志` 只覆盖 `kubectl logs` 的缺口。当 Pod 起不来、反复重启、OOM、启动失败时，用本 skill。

## 何时不要使用

- 仅查日志即可定位 → 转 [`ssh-k8s-浏览后端日志`](../ssh-k8s-浏览后端日志/SKILL.md)
- 只需看 toast 错误码 → 转 Network 面板
- `kubectl get pods` 就显示 Pod 正常 Running → 不需要深度诊断
- 用户仅需要 `kubectl logs -f` 实时跟输出

## RED（失败基线）

- 只 `kubectl logs` 不看 Events → 遗漏 OOMKilled / CrashLoopBackOff 根因
- 只看当前日志不看 `--previous` → 遗漏重启前错误
- `kubectl top` 未装 metrics-server → `Error: metrics not available`
- `kubectl exec` 交互模式 + plink 无 `-t` → stdin 无法分配
- 混淆 Pod 退出码：137 ≠ 128+9（实际是 128+SIGKILL）

## 何时使用

- Pod 状态为 `CrashLoopBackOff`、`OOMKilled`、`ImagePullBackOff`、`Init:Error`、`RunContainerError`
- `kubectl logs` 返回正常但 Pod 仍重启 → 需要看 `--previous` 或 `describe` Events
- 需要查 Pod/Node 的 CPU、内存使用率
- 需要 exec 进容器看文件系统、进程、配置
- 需要全命名空间 / 集群范围的事件筛查

## 前置

1. **morbax** 打开目标集群（见 `../../config/ssh.config.json` → `multiCluster`）
2. jump 机 SSH 就绪、凭证就绪（同父 skill 前置）
3. `kubectl` 在 jump 上可用

> **🔴 检查点：** 先确认 Pod 名和命名空间。如果连不上集群，转到 `ssh-k8s-浏览后端日志` 先确认连通性。

## 标准流程

### 1. 快速查看 Pod 状态（入口）

```bash
kubectl get pods -n platform -o wide
```

关注 `READY`、`STATUS`、`RESTARTS`、`AGE` 列。异常状态一目了然。

### 2. describe Pod（核心）

```bash
kubectl describe pod <pod名> -n platform
```

关注三个段：

| 段 | 看什么 | 异常信号 |
|----|--------|----------|
| **Conditions** | `Last Transition Time`、`Reason`、`Message` | `PodScheduled=False`、`Ready=False` |
| **Events**（尾部） | `Type=Warning` 的事件链 | `FailedPullImage`、`BackOff`、`OOMKilling` |
| **Containers.Last State** | `Terminated.Reason`、`Exit Code` | `CrashLoopBackOff` → `Exit Code: 137`(OOM) / 139(segfault) / 1(app error) |

> **🔴 检查点：** 把最关键的事件行给用户看，确认方向后再进入下一步。

### 3. Events 全览（窄时间窗口）

```bash
# 查某 Pod 最近 1 小时的事件
kubectl get events -n platform --field-selector involvedObject.name=<pod名> --sort-by=.lastTimestamp

# 查全命名空间的 Warning（排障入口）
kubectl get events -n platform --field-selector type=Warning --sort-by=.lastTimestamp | tail -30

# 查 Node 级别事件（如果怀疑宿主）
kubectl get events --field-selector type=Warning --sort-by=.lastTimestamp | grep -E '<node名>|OutOfDisk|NodeNotReady'
```

### 4. 日志 — previous（重启前）

Pod 重启后当前 `kubectl logs` 可能只看到新进程的启动日志，旧进程的原因藏在 `--previous`：

```bash
kubectl logs <pod名> -n platform --previous --tail=100
```

> **🔴 检查点：** 如果 `--previous` 返回空，说明上一次启动没有日志输出（如 Init 阶段失败） → 改用 `kubectl describe` 的 Events。

### 5. 资源使用

```bash
# Pod 级
kubectl top pod <pod名> -n platform

# Node 级（看宿主是否过载）
kubectl top node

# 按内存排序全命名空间 Pod
kubectl top pod -n platform --sort-by=memory | tail -10
```

> OOMKilled 的典型特征：`top pod` 显示内存接近 limit → 接着 Events 显示 `OOMKilling` → describe 显示 `Exit Code: 137`。

### 6. exec 进容器（交互排障）

当 logs 和 describe 已定位到问题但需要确认文件/配置时：

```bash
# Bash（大部分镜像）
kubectl exec -it <pod名> -n platform -- /bin/sh

# 非交互执行单条命令（plink 推荐）
kubectl exec <pod名> -n platform -- cat /app/config/application.yml
kubectl exec <pod名> -n platform -- ps aux
kubectl exec <pod名> -n platform -- df -h
```

> **🔴 检查点：** `kubectl exec -it` 需要交互式终端，plink 下用 `-t` 或优先非交互单条命令。不能确认时，停在此处问用户。

## 2026-06 会话样本（OOM 排障）

```text
# kubectl describe pod 关键输出
Conditions:
  Type           Status  LastTransitionTime
  Ready          False   2026-06-10T14:22:00Z

Events:
  Type     Reason     Age   Message
  ----     ------     ----  -------
  Warning  BackOff    5m    Back-off restarting failed container
  Warning  OOMKilling 6m    Memory cgroup out of memory: Killed process

Containers.Last State:
  Terminated  Reason: OOMKilled  Exit Code: 137
```

**排查链：** `describe` Events 看到 OOMKilling → `kubectl top pod` 确认内存超 limit → 更新 resources.limits.memory 或排查内存泄漏。

## 退出码速查

| 退出码 | 含义 | 常见原因 | 排查方向 |
|:------:|------|----------|----------|
| 0 | 正常退出 | 一次性任务完成 | 无需排查 |
| 1 | 一般应用错误 | 配置错、依赖未就绪 | `--previous` logs → exit code 1 |
| 137 | OOMKilled (128+9) | 内存超 limit / 内存泄漏 | `kubectl top pod` → describe limits |
| 139 | Segmentation fault (128+11) | 原生代码 crash / JVM crash | 检查 hs_err_pid / core dump |
| 143 | SIGTERM (128+15) | 正常终止 / 滚动更新 | 确认是否预期行为 |

## 排障速查表

| 现象 | 排查链 | 根因示例 |
|------|--------|----------|
| `CrashLoopBackOff` | `describe` Events → `--previous` logs → `exec` 看配置 | 应用配置错导致启动即 crash |
| `OOMKilled` | `top pod` 看内存 → `describe` 看 limits | 内存 limit 太小；内存泄漏 |
| `ImagePullBackOff` | `describe` Events 看 FailedPullImage | 镜像名错、tag 不存在、仓库认证 |
| `Init:Error` | `describe` 看 Init Containers → 对应 Init 容器的 logs | Init 脚本中依赖服务未就绪 |
| `RunContainerError` | `describe` Events 看具体错误 | volume mount 失败、端口冲突 |
| `NotReady` (running 但不可用) | `describe` Conditions 看 Ready=False 原因 → `exec` 查 health endpoint | readiness probe 配置错 |

## Windows Agent：plink 非交互诊断命令

> 以下命令中 `10.17.196.48` 为 48 集群默认 jump IP。实际执行时从 `../../config/ssh.config.json` → `jumpHost` 读取；其他集群使用 `multiCluster.<name>.jumpHost`。

```powershell
# describe 全输出（pipe 到本地文件分析）
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey 10.17.196.48 `
  "kubectl describe pod <pod名> -n platform 2>&1 | head -80"

# Events Warning 过滤
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey 10.17.196.48 `
  "kubectl get events -n platform --field-selector type=Warning --sort-by=.lastTimestamp 2>&1 | tail -30"

# top pod 排序（查 OOM 嫌疑）
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey 10.17.196.48 `
  "kubectl top pod -n platform --sort-by=memory 2>&1 | tail -10"
```

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| `kubectl top` 报 `Error: metrics not available yet` | metrics-server 未装或未就绪 | 先等 2 分钟；仍无则跳过 top，用 `kubectl describe node \| grep -A5 Allocated` |
| describe Events 为空 | events 保留期 1h 已过 / 命名空间错 | `kubectl get events -n platform --sort-by=.lastTimestamp`（不限 Pod） |
| `kubectl exec` 报 `unable to upgrade connection` | Pod 处于 CrashLoop 无法 exec | 只在 Running 状态才 exec；否则先看 describe |
| describe 显示 `Exit Code: 137` 但 top pod 内存正常 | OOM 发生在瞬间 spike | 降低 `resources.requests` 让 QOS 调整；或加 `--since=30m` 查历史 |
| `kubectl logs --previous` 返回空 | 上次启动无输出 / error 在容器启动前 | 改用 describe Events 的 `Started`/`Created` 段 |
| `kubectl exec` 报 `rpc error: ... pty` | plink 无 `-t` 交互 | 用非交互模式 `kubectl exec <pod> -- <cmd>`（无 `-it`）|

## 输出契约

| 字段 | 说明 |
|------|------|
| `pod` | 目标 Pod 名 |
| `podStatus` | STATUS 列（CrashLoopBackOff / Running / ...） |
| `restartCount` | RESTARTS 列值 |
| `lastState` | 最后一次终止原因（OOMKilled / Error / ...） |
| `events` | 关键 Warning 事件原文 |
| `fixHint` | 根据现象链给出的修复方向 |

## 关联

- 父 skill：[`../../SKILL.md`](../../SKILL.md)
- 互补 skill：[`../ssh-k8s-浏览后端日志/SKILL.md`](../ssh-k8s-浏览后端日志/SKILL.md)（纯 logs 时转至此）
- 会话日志：[`../../session-log/`](../../session-log/)
