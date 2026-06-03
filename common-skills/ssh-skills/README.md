# SSH 技能（ssh-skills）

nebula 后端排障的 SSH / K8s 日志能力路由中心，与 OpenCLI 自动化知识体系互补。

## 为什么需要它

前端 toast 常显示 `[100000]未知错误`，真实原因在 **seccenter Pod 日志** 的 `ERRO` 行。本套件提供：

- jump 机 + `kubectl logs` 的标准流程
- Windows 下 `plink` 非交互 SSH 模式
- 与菜单导入 OpenCLI 自动化联动的闭环

## 子能力

| feature skill | 用途 |
|---------------|------|
| [`ssh-k8s-浏览后端日志`](feature-skills/ssh-k8s-浏览后端日志/SKILL.md) | 48 集群 platform 命名空间查 seccenter 日志 |
| [`ssh-k8s-pod-诊断`](feature-skills/ssh-k8s-pod-诊断/SKILL.md) | Pod 深度诊断：CrashLoopBackOff/OOMKilled/describe/events/exec |
| [`ssh-端口转发`](feature-skills/ssh-端口转发/SKILL.md) | 端口转发隧道：数据库/Actuator/SOCKS/内网服务 |
| [`ssh-文件传输`](feature-skills/ssh-文件传输/SKILL.md) | SCP/SFTP/pscp/kubectl cp 拉日志推配置 |

## 快速开始

1. 复制 `config/ssh.config.local.json.example` → `config/ssh.config.local.json`（已在 `.gitignore` 中）
2. 修改 `jumpPassword`、`hostKeySha256`（如需要）
3. morbax 打开目标 K8s 集群（见 `config/ssh.config.json` → `multiCluster`）
4. Agent 读 `SKILL.md` 路由到对应 feature skill

## 目录结构

```
ssh-skills/
├── SKILL.md                          # 主路由中心
├── README.md                         # 本文档
├── config/
│   ├── ssh.config.json               # 非敏感默认值（多集群/plink路径/grep模式）
│   └── ssh.config.local.json.example # 本地覆盖模板
├── evals/
│   ├── should-trigger.md             # 文本触发条件
│   ├── should-not-trigger.md         # 文本不触发条件
│   └── test-prompts.json             # 结构化 eval（自动化测试用）
├── template/
│   ├── new-feature-skill/SKILL.md    # 新 feature skill 脚手架
│   ├── before/常见失败.md             # 失败模式目录
│   └── after/全流程通过.md             # 成功态输出参考
├── session-log/
│   ├── README.md                     # 沉淀规则与模板
│   └── .gitkeep                      # 占位
└── feature-skills/
    ├── README.md                     # 子能力索引
    ├── ssh-k8s-浏览后端日志/SKILL.md  # 浏览 seccenter 后端日志
    ├── ssh-k8s-pod-诊断/SKILL.md     # Pod 深度诊断（describe/events/exec）
    ├── ssh-端口转发/SKILL.md         # 端口转发隧道（-L/-R/-D/数据库）
    └── ssh-文件传输/SKILL.md         # SCP/SFTP/pscp 文件传输
```

## 相关 OpenCLI 子 skill

- [`opencli-ux-menu-import`](../浏览器自动化-skills/自生长的%20OpenCLI%20自动化知识体系/opencli-ux-menu-import/) — 菜单权限合并 YAML 预览导入 + SSH 定位 + 自动补 id
