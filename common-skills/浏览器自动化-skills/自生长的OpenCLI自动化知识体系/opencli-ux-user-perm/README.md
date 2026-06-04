# 用户管理 UX 与权限自动化（OpenCLI）

nebula 项目级 skill：用户管理页 E2E、种子用户、批量清理、操作列权限诊断。

## 目录

| 路径 | 用途 |
|------|------|
| `SKILL.md` | Agent 入口与路由 |
| `config/` | 登录账号与环境 |
| `scripts/` | 浏览器 eval 脚本 |
| `references/` | 踩坑清单、API 路径、权限说明 |
| `feature-skills/` | 可执行子流程 |
| `intention-skills/` | 场景判定 |
| `evals/` | Darwin 评估与 trigger 清单 |
| `template/` | before/after 样本 |
| `assets/` | 会话 few-shot |

## 快速开始

```powershell
opencli doctor

# 1. 复制本地密码
copy config\ux-test.config.local.json.example config\ux-test.config.local.json

# 2. 登录并创建种子用户（PowerShell）
$js = Get-Content -Raw '.cursor/nebula-skills/opencli-ux-user-perm/scripts/create-seed-users.js'
opencli browser user0601 open http://localhost:8080/cloud/login
# … 见 feature-skills/登录与预检
opencli browser user0601 eval $js

# 3. 清理到 10 人
$js = Get-Content -Raw '.cursor/nebula-skills/opencli-ux-user-perm/scripts/cleanup-users-to-n.js'
opencli browser user0601 eval $js
```

## 与会话产物的对应

| 会话产物 | 本 skill 位置 |
|----------|----------------|
| `opencli-create-user0601-seed-users.js` | `scripts/create-seed-users.js` |
| `opencli-create-user0601-ui.js` | `scripts/create-users-via-ui.js` |
| `opencli-cleanup-users-to-10.js` | `scripts/cleanup-users-to-n.js` |
| `hasPerm.test.ts` 等 | `apex_dev` 仓库内，见 references |

## Darwin

- Baseline：`evals/darwin-baseline-report.md`
- Round1 优化后：`evals/darwin-round1-report.md`
