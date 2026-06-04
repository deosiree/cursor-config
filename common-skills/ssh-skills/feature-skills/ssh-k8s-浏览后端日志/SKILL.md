---
name: ssh-k8s-浏览后端日志
description: jump + kubectl 查 seccenter Pod 日志，解析 ERRO 行与前端 [100000] toast 映射。与 ssh-k8s-pod-诊断（深度诊断）互补。
tags:
  - kubectl
  - kubectl logs
  - seccenter
  - 后端日志
  - 100000
  - ERRO
should-trigger:
  - kubectl logs / kubectl logs -f / kubectl logs --tail
  - [100000] / [130000] / 100000 未知错误 / 130000 未知错误（token 形态）
  - ImportProjectMenuTree
  - seccenter 日志 / seccenter ERROR
  - prompt 含 SSH + kubectl / K8s / 后端日志 / Pod 日志
  - prompt 含 48 集群 / cloudtest / morbax + 查日志
  - prompt 含「查真实错误」且前端只有 toast 兜底文案
  - 菜单导入 / 权限点接口失败且需要对照 Pod 日志
should-not-trigger:
  - 纯前端 OpenCLI 自动化、不涉及 SSH 或 K8s
  - 本地 vite dev + /dev-api/direct 已返回完整 JSON（优先 HTTP/Network）
  - 无 SSH 权限 → 只用浏览器 Network + 文档排查
  - 需要改集群状态（delete pod 等）且用户未授权
---

# SSH + K8s：浏览后端日志（seccenter）

> 来源：2026-06-02 菜单导入 `[100000]未知错误` 排障会话；Obsidian 笔记「查后端日志-k8s-调试权限点」。

## 何时使用

- 前端 toast 只有 `[100000]未知错误` 或 `[130000]未知错误`，Network 也不完整
- 菜单 `ImportProjectMenuTree` / 权限点 / seccenter 接口失败需**真实堆栈**
- 用户允许 SSH 到 cloudtest / 48 集群 jump 机
- 与 OpenCLI 复现失败操作后，需要 **对照 Pod 日志**

## 何时不要使用

- 本地 vite dev + `/dev-api/direct` 已返回完整 JSON（优先 HTTP/Network）
- 无 SSH 权限 → 只用浏览器 Network + `docs/menu/导入失败排查-100000.md`
- 需要改集群状态（delete pod 等）→ 需用户单独授权

## 前置

1. **morbax** 打开目标集群（见 `../../config/ssh.config.json` → `multiCluster`，默认 `48`）
2. jump 机可 SSH（示例：`10.17.196.48`，用户 `shr`；cloudtest 见 config 对应字段）
3. jump 上 `kubectl get pods -n platform` 可用
4. 凭证在 `../../config/ssh.config.local.json`（勿提交 git）
5. SSH 工具路径：`../../config/ssh.config.json` → `plinkPath`（Windows PuTTY）或 `opensshPath`（OpenSSH）

## 标准流程

> **🔴 执行前检查点：** 再次向用户确认目标集群已用 morbax 打开、凭证已就绪、plink/ssh 可执行。如果任一条件不满足，停在此处。

### 1. 查 Pod 名

```bash
kubectl get pods -n platform | grep seccenter
```

记下 **Running** 的 Pod，例如 `seccenter-v2-6d8bb9f9c-rfmzz`（**以实际为准**，通常 2 个副本）。

> **🔴 检查点：** 如果 `grep seccenter` 返回空，说明命名空间或集群错了——先停，不要继续 grep 其他关键词。

### 2. 实时跟日志（复现问题时）

终端 A：

```bash
kubectl logs -f <pod名> -n platform
```

终端 B：浏览器/OpenCLI 再执行一次失败操作（如「导入菜单 → 确定」）。

观察新刷出的 `ERRO` 行。

### 3. 事后 grep（推荐）

```bash
kubectl logs --tail=10000 <pod名> -n platform 2>&1 \
  | grep -E 'ImportProjectMenuTree|ID 无效|ERRO|menu/project'
```

Windows jump 上可用 `findstr`：

```cmd
kubectl logs --tail=10000 <pod> -n platform | findstr /i "ImportProjectMenuTree ERRO ID"
```

### 4. 读日志层次

| 日志层 | 示例 | 含义 |
|--------|------|------|
| **ERRO 行** | `菜单 '查看首页' 的 ID 无效: 0` | **真实原因**（校验/业务） |
| 堆栈 | `validateProjectImportMenus` → `ImportProjectMenuTree` | 定位后端函数 |
| INFO 行 | `错误信息:[100000]未知错误` | 返回给前端的兜底码 |
| 成功对照 | `deleted_count:124, created_count:124` | 同接口成功形态 |

**结论：** 排障以 **ERRO 行** 为准，不要只盯 toast 的 `100000`。

## Windows Agent：plink / OpenSSH 非交互 SSH

> 以下命令中 `10.17.196.48` 为 48 集群默认 jump IP。实际执行时从 `../../config/ssh.config.json` → `jumpHost`（或 `multiCluster.<name>.jumpHost`）读取。

本机未配 kubeconfig 时，经 jump 执行 kubectl。

### plink（推荐 Windows PuTTY）

> **⚠️ 引号与编码：** grep 模式**必须用单引号** `'...'` 包裹（非双引号），否则 bash 会把 `|` 当管道符拆解、把中文当命令名执行。如中文乱码（`无效`→`鏃犳晥`），在命令前加 `export LANG=en_US.UTF-8;` 或先用纯 ASCII 模式 `grep -E 'ERRO|panic|error'` 粗筛。

路径从 `../../config/ssh.config.json` → `plinkPath` 读取（默认 `C:\Program Files\PuTTY\plink.exe`），agent 按需加载：

```powershell
# 从 config 读取变量（agent 自动处理）
$HostKey = "SHA256:Z+CYBD3iefUsG37uBk37bhQm0iVe65ULyRr/VquFsDI"  # 见 ../../config/ssh.config.local.json
$Plink = "C:\Program Files\PuTTY\plink.exe"  # 从 config.plinkPath 读取
$Pod = "seccenter-v2-xxxxxxxxxx-xxxxx"  # 以实际 kubectl get pods 为准
& $Plink -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch -hostkey $HostKey 10.17.196.48 `
  "kubectl logs --tail=10000 $Pod -n platform 2>&1 | grep -E 'ImportProjectMenuTree|ID 无效|ERRO' | tail -20"
```

### OpenSSH（备选）

```powershell
ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -l shr -p 22 10.17.196.48 `
  "kubectl logs --tail=10000 $Pod -n platform 2>&1 | grep -E 'ERRO|ImportProjectMenuTree' | tail -20"
```

### 多 Pod 并行 grep（seccenter 通常 2 副本）

```powershell
kubectl get pods -n platform | Select-String seccenter | ForEach-Object {
  $p = ($_ -split '\s+')[0]
  Write-Host "=== $p ==="
  kubectl logs --tail=5000 $p -n platform 2>&1 | Select-String 'ERRO|ImportProjectMenuTree|ID 无效'
}
```

## 2026-06-02 会话样本（菜单导入）

```text
ERRO server端系统seccenter-v2异常: 菜单 '查看首页' 的 ID 无效: 0
  1). seccenter/internal/logic/menu.validateProjectImportMenus
  2). seccenter/internal/logic/menu.(*sMenu).ImportProjectMenuTree
INFO ... 错误信息:[100000]未知错误
```

**修复方向：** 补丁 `patch_children_add` 必须先有真实 `id`（UI 创建或 API create 后写回补丁），再 merge + dry_run 预览。

→ 自动化闭环见 [`opencli-ux-menu-import`](../../../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/opencli-ux-menu-import/SKILL.md)

## 扩展：端口转发 → 独立 skill

端口转发场景（数据库隧道、Actuator、SOCKS 代理等）已迁移到独立 skill：

→ [`../ssh-端口转发/SKILL.md`](../ssh-端口转发/SKILL.md)

## 参考文档索引

| 文档 | 路径 | 场景 |
|------|------|------|
| 导入失败排查 100000 | `../../../../docs/menu/导入失败排查-100000.md` | 菜单导入 `[100000]` |
| seccenter 错误码 | `../../../../docs/errCode/seccenter.swagger.md` | 错误码速查 |
| 菜单导入 SSH 联调 | [`../../../浏览器自动化-skills/自生长的OpenCLI自动化知识体系/references/场景-菜单导入与SSH联调.md`](../../../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/references/场景-菜单导入与SSH联调.md) | 完整闭环参考（OpenCLI 侧） |

## 输出契约（Agent 交付）

| 字段 | 说明 |
|------|------|
| `pod` | 使用的 Pod 名 |
| `erroLine` | 首条 ERRO 原文 |
| `stackHint` | 如 `validateProjectImportMenus` |
| `frontendToast` | 如 `[100000]未知错误` |
| `fixHint` | 映射到 YAML/补丁/权限的下一步 |

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| 本机 `kubectl get pods` NotFound | kubeconfig 未指 48 集群 | SSH 到 cloudtest 再 kubectl |
| plink `Cannot confirm host key` | batch 模式 | 加 `-hostkey SHA256:...` |
| plink: command not found | `plinkPath` 不存在 | 检查 `config/ssh.config.json.plinkPath`；降级 OpenSSH |
| SSH Connection timed out | jump 机不可达/端口不通 | 检查 VPN/morbax；尝试 ping；降级 Network 排障 |
| `kubectl: command not found` | jump 上无 kubectl | `which kubectl` 或 `export PATH`；考虑 `-L` 端口转发 |
| grep 无 Import | 日志已滚动 | 增大 `--tail` 或 `-f` 实时跟 |
| 两个 Pod 不确定 | 负载均衡 | 两个 Pod 都 grep 一遍 |
| ERRO 是中文但 toast 英文/码 | 网关映射 | 以 ERRO 为准 |
| `No resources found in platform namespace` | 集群/命名空间错了 | `kubectl get namespaces` 确认；全命名空间搜 `seccenter` |
| Pod 已 Terminating | 部署更新中，新旧交替 | 加 `--since=5m`；确认用 Running Pod |
| grep 报 `command not found` 或 `No such file` | grep 模式用了双引号，bash 把 `\|` 拆成管道、把中文当命令 | **必须用单引号**包裹 grep 模式：`grep -E 'ERRO\|关键词'`，不是双引号 |
| grep 中文关键词无匹配（实际日志有） | plink 传输中文时编码损坏（`无效`→`鏃犳晥`） | 命令前加 `export LANG=en_US.UTF-8;`；或先用 ASCII 模式 `grep -E 'ERRO\|error'` 粗筛 |

## 关联

- 父 skill：[`../../SKILL.md`](../../SKILL.md)
- OpenCLI 联调：[`../../../浏览器自动化-skills/自生长的OpenCLI自动化知识体系/references/场景-菜单导入与SSH联调.md`](../../../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/references/场景-菜单导入与SSH联调.md)
- 会话日志：[`../../../浏览器自动化-skills/自生长的OpenCLI自动化知识体系/session-log/2026-06-02-menu-import-ssh-opencli.md`](../../../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/session-log/2026-06-02-menu-import-ssh-opencli.md)
- 业务文档：[`docs/menu/导入失败排查-100000.md`](../../../../docs/menu/导入失败排查-100000.md)
