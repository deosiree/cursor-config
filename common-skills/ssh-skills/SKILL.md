---
name: ssh-skills
description: nebula 后端排障 SSH 能力路由中心。当需要通过 SSH 连 jump/cloudtest、在 K8s 集群查 Pod 日志、kubectl 跟实时输出、或 SSH 与 OpenCLI/HTTP 联调定位前端 toast 背后的真实错误时使用。
tags:
  - SSH
  - kubectl
  - K8s
  - 后端日志
  - seccenter
  - 排障
should-trigger:
  - plink（独立触发，不要求同时出现 kubectl）
  - kubectl logs / kubectl get pods / kubectl describe / kubectl exec / kubectl cp
  - 100000 未知错误 / 130000 未知错误 / [100000] / [130000]
  - ImportProjectMenuTree
  - prompt 含 SSH + kubectl / K8s / 后端日志 / Pod 日志
  - prompt 含 48 集群 / cloudtest / morbax + 查日志
  - prompt 含 seccenter + 日志 / seccenter 报错
  - prompt 含「查真实错误」且前端只有 toast 兜底文案
should-not-trigger:
  - 纯前端 OpenCLI 自动化、不涉及 SSH 或 K8s
  - 用户明确说不要连生产/测试集群
  - 仅需浏览器 Network 面板即可定位（无 SSH 权限时优先 Network）
---

# SSH 技能路由中心

> **定位：** SSH / jump / K8s 日志能力的 agent 入口。只做路由与通用门禁，具体命令下沉到 `feature-skills/`。
> **与 OpenCLI 关系：** 前端 toast 往往只有 `[100000]未知错误`；SSH + `kubectl logs` 可拿到 **ERRO 行真实堆栈**。常与 `自生长的OpenCLI自动化知识体系/opencli-ux-menu-import` 组合使用。

## RED（失败基线）

### 行为错误
- 只看前端 toast → 被「未知错误」误导
- 本机直接 `kubectl` 但未连 48 集群 → `NotFound` / API group 错误
- SSH 首次连接未接受 host key → plink `-batch` 直接失败
- 把密码写进 skill 或 commit → 安全风险

### 可恢复的边界失败
| 症状 | 根因 | 处理 |
|------|------|------|
| `plink: command not found` | `config.plinkPath` 不存在或无执行权限 | 检查 `plinkPath` 配置；降级到 OpenSSH `ssh`；若都不可用，告知用户安装 PuTTY 或 OpenSSH |
| `ssh: connect to host {jumpHost} port 22: Connection timed out` | jump 机不可达 / VPN 未连 / 端口不通 | 检查 VPN/morbax 连接；确认 `config.ssh.config.json` → `jumpHost` 正确；尝试 ping。如果 Network 面板已有完整 JSON，降级到 Network 排障 |
| `kubectl: command not found` | jump 机上未装 kubectl 或 PATH 未加载 | `which kubectl` 找路径；`export PATH=$PATH:/usr/local/bin`；若仍无，考虑 `-L` 端口转发跳过 kubectl 依赖 |
| `No resources found in platform namespace.` | 命名空间错 / 集群错 / Pod 已被淘汰 | `kubectl get namespaces` 确认；确认 morbax 指向正确集群；`kubectl get pods -A \| grep seccenter` 全命名空间搜索 |
| Pod 名含 hash 但 `kubectl logs` 返回旧 Pod 已 Terminating | 有新旧 Pod 交替 | 加 `--since=5m` 只查最近 5 分钟；确认用 `Running` Pod 而非 `Terminating` |
| `morbax 未安装 / 无法打开目标集群` | 环境未就绪，无法切换 kubeconfig context | **降级路径：** ① 确认用户是否有 morbax；② 如本机已配 kubeconfig 且 context 正确，可跳过 morbax 直接 kubectl；③ 如无可用 context，转为引导用户用 Network 面板或手动提供日志 |

## GREEN（执行主线）

| # | 步骤 | 检查点 |
|---|------|--------|
| 1 | 判断是否需要 SSH（见下方路由表） | **🔴 暂停：** 向用户确认目标集群（48/47/cloudtest）并确认有 SSH 权限 |
| 2 | 读对应 `feature-skills/*/SKILL.md` | — |
| 3 | 执行前置检查（集群/morbax/凭证/plink/OpenSSH），完成后再继续 | **🔴 暂停：** 如任一检查失败，停在此处向用户报告并等待修复指令 |
| 4 | 执行 SSH + kubectl，提取 **ERRO / 业务校验** 行 | **🔴 暂停：** 展示 ERRO 原文 + 堆栈给用户，确认根因判断方向后再进入修复 |
| 5 | 将真实错误映射回前端/YAML/补丁修复动作 | **🔴 暂停：** 如需 destructive 操作（如 `kubectl delete`、改集群状态），必须用户显式确认 |
| 6 | 可选：会话沉淀到 `session-log/`；定期回写回 feed 进 skill/config | — |

> **🔴 检查点 fallback 规则：** 任一 🔴 暂停后如用户 30s 内无回复，agent 必须输出当前状态摘要并明确等待，禁止自行跳过或假设用户已确认。连续 2 次无回复后，停止等待并明确告知用户「需要确认后才能继续」。

## 路由规则

| 场景 | 条件 | 策略 | 状态 |
|------|------|------|------|
| **K8s 浏览后端日志** | seccenter / platform 命名空间 / 导入失败 / 100000 | → [`feature-skills/ssh-k8s-浏览后端日志/SKILL.md`](feature-skills/ssh-k8s-浏览后端日志/SKILL.md) | ✅ 已实现 |
| **菜单导入 + SSH 联调** | 菜单 YAML import 预览/正式导入失败 | → OpenCLI 子 skill [`../浏览器自动化-skills/自生长的OpenCLI自动化知识体系/opencli-ux-menu-import/`](../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/opencli-ux-menu-import/SKILL.md)（内嵌 SSH 步骤） | ✅ 已实现（跨 skill） |
| **多集群切换** | 需要在 47/cloudtest 而非 48 集群操作 | → `config/ssh.config.json` → `multiCluster`；切换 morbax profile 后按 K8s 浏览后端日志流程 | ✅ config 已就绪 |
| **仅 Network 足够** | 本地 dev + vite proxy，响应体含完整 code/message | 优先浏览器 Network，不必 SSH | ⚠️ 无需 feature skill |
| **Pod 深度诊断** | CrashLoopBackOff / OOMKilled / ImagePullBackOff / Pod NotReady / `kubectl describe` | → [`feature-skills/ssh-k8s-pod-诊断/SKILL.md`](feature-skills/ssh-k8s-pod-诊断/SKILL.md) | ✅ 新增 |
| **端口转发隧道** | 数据库隧道 / Actuator / SOCKS 代理 / 内网服务未暴露 | → [`feature-skills/ssh-端口转发/SKILL.md`](feature-skills/ssh-端口转发/SKILL.md) | ✅ 新增 |
| **文件传输** | SCP/SFTP/pscp 拉日志/推配置 / `kubectl cp` / 跨跳板机搬运 | → [`feature-skills/ssh-文件传输/SKILL.md`](feature-skills/ssh-文件传输/SKILL.md) | ✅ 新增 |
| **端口转发排障**（已合并到独立 skill） | 非 Pod 化服务（JVM/Nginx/中间件） | → 已迁移至独立 skill [`ssh-端口转发`](feature-skills/ssh-端口转发/SKILL.md) | ✅ 已迁移 |
| **以上都不是** | 新 SSH 场景 | 在 `feature-skills/` 新增节点 + 更新本表 | 🔧 用 `template/new-feature-skill/` 脚手架 |

## 前置检查（Agent 自动执行）

| # | 检查项 | 失败处理 |
|---|--------|----------|
| 1 | 判断目标集群（48 / 47 / cloudtest / 用户指定） | 读取 `config/ssh.config.json` → `multiCluster`；向用户确认 |
| 2 | 是否有 SSH 目标（IP/用户/jump 方式） | 向用户确认；无则只用 Network |
| 3 | Windows 是否有 `plink`（`config.plinkPath`）或 OpenSSH `ssh` | 检查 `config/ssh.config.json` → `plinkPath` / `opensshPath`；备选降级 |
| 4 | 目标机是否有 `kubectl` 且 context 指向正确集群 | morbax 打开对应集群后再执行 |
| 5 | 凭证来源 | 用 `config/ssh.config.local.json`（gitignore），**禁止**写入 skill 正文；优先 `$env:SSH_JUMP_PASSWORD` |
| 6 | Pod 是否 Running | `kubectl get pods -n platform \| grep Running` — 获取当前 Pod 名覆盖 config |

## 配置

| 文件 | 用途 |
|------|------|
| [`config/ssh.config.json`](config/ssh.config.json) | 非敏感默认值（集群 IP、命名空间、Pod 前缀、plink 路径、grep 模式、多集群） |
| [`config/ssh.config.local.json`](config/ssh.config.local.json)（gitignore） | 本地覆盖（密码/ hostkey / 当前 Pod 名）；从 `.example` 复制 |
| [`config/ssh.config.local.json.example`](config/ssh.config.local.json.example) | 本地覆盖模板（用户/密码/ hostkey / 占位示例） |

## 与 OpenCLI 知识体系协作

```text
用户操作（OpenCLI / 浏览器）触发失败 toast
        ↓
SSH → kubectl logs → 真实 ERRO（如：菜单 '查看首页' 的 ID 无效: 0）
        ↓
修复 YAML/补丁/补 id → OpenCLI 或 HTTP dry_run 再验证
```

详见 OpenCLI 侧：[`references/场景-菜单导入与SSH联调.md`](../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/references/场景-菜单导入与SSH联调.md)

## 会话沉淀（自生长回路）

每次 SSH 排障完成后，将关键经验沉淀到 `session-log/`：

```markdown
session-log/YYYY-MM-DD-场景简述.md
```

沉淀模板：

| 字段 | 说明 |
|------|------|
| 场景 | 排障场景描述 |
| 集群 | 48/47/cloudtest |
| SSH 命令 | 实际执行的 plink/ssh 命令（密码用 `$env:SSH_JUMP_PASSWORD`） |
| ERRO 行 | 核心错误日志原文 |
| 根因 | 是什么导致的 |
| 修复 | 怎么修的 |
| 踩坑 | 这次踩了什么坑 |
| 沉淀建议 | 哪些值得更新进 skill 或 config |

> **为什么需要：** 当前经验只沉淀到 OpenCLI 侧 `session-log/`，SSH 侧自己的排障经验（如新的 grep 模式、新的 ERRO 类型、新集群差异）没有自生长回路。沉淀物应定期（月/季）回写入 `config/ssh.config.json`（新增 grep pattern、新增集群、新增根因映射）或 `feature-skills/`（新增排障场景）。

## 约束

- skill 与示例命令中**不得**出现真实密码；用环境变量或 local config
- 不代替 morbax/运维变更 kubeconfig；只文档化「在已连通环境下」的命令
- SSH 只读日志为主；destructive kubectl 操作需用户明确确认

## 外部引用

| 文档 | 路径 |
|------|------|
| Obsidian 原始笔记 | `查后端日志-k8s-调试权限点.md`（用户 Obsidian Vault） |
| 菜单 100000 排查 | `docs/menu/导入失败排查-100000.md` |
| seccenter 错误码 | `docs/errCode/seccenter.swagger.md` |
