# harvest-pipeline.md — 与 OpenCLI harvest 脚本的对接规范

> 本文档描述 `hermes-session-harvest` 如何对接 OpenCLI 自生长系统的 harvest 脚本。

## 路径约定

```text
# OpenCLI 自生长系统根目录（相对本仓库）
.cursor/common-skills/浏览器自动化-skills/自生长的OpenCLI自动化知识体系/

# Harvest 脚本路径
harvest/add-scene.sh          # 新增场景 → 更新路由表 + test-prompts
harvest/scaffold-skill.sh     # 创建完整子 skill 骨架（12+ 文件）
harvest/session-log.sh        # 记录会话日志
harvest/git-commit.sh         # 自动 git commit
harvest/templates/scene.md    # 场景文件模板
harvest/templates/session-log.md  # 会话日志模板

# 知识资产路径
references/场景-{name}.md     # 场景文件
session-log/{date}-{session}-{scene}.md  # 会话日志
opencli-ux-{name}/            # 子 skill 目录
SKILL.md                      # 路由规则表
test-prompts.json             # 测试提示语料
references/source-map.md      # 外部引用总览
```

## Agent 路径 vs Shell 路径

| 操作 | Agent 路径（hermes-session-harvest 用） | Shell 路径（手动用） |
|------|----------------------------------------|---------------------|
| 新增场景 | `write_file` references/ + `edit_file` SKILL.md + `edit_file` test-prompts.json | `bash harvest/add-scene.sh -n ...` |
| 新增子 skill | `write_file` 创建 `opencli-ux-{name}/` 下 12+ 文件 | `bash harvest/scaffold-skill.sh -n ...` |
| 新增日志 | `write_file` session-log/{date}-{session}-{scene}.md | `bash harvest/session-log.sh capture ...` |
| Git commit | `git add ... && git commit -m "🏗️ ..."` | `bash harvest/git-commit.sh --type scene --name ...` |

## hermes-session-harvest 的建议执行方式

由于 `hermes-session-harvest` 已经是 Agent skill，**推荐走 Agent 路径**：

1. 用 `write_file` / `edit_file` 创建和修改文件
2. 最后用 `run_command git add ... && git commit -m "..."` 提交

如果用户偏好 Shell 路径（已有 harvest 脚本环境），也可以直接调用：

```bash
cd .cursor/common-skills/浏览器自动化-skills/自生长的\ OpenCLI\ 自动化知识体系
bash harvest/add-scene.sh -n "场景名" -s session名 -p profile -P "用户请求" -c "命令序列" -C "触发条件"
```

## 文件内容约定

### 场景文件 (references/场景-{name}.md)

```markdown
# 场景：{场景名}

> 来源：session={session}, profile={profile}, date={date}
> 用户请求："{原始请求}"

## 触发条件

- {触发条件 1}
- {触发条件 2}

## 核心命令序列

```bash
# {步骤1描述}
opencli browser {session} open {url}

# {步骤2描述}
opencli browser {session} eval "..."

# {步骤3描述}
kubectl logs ...
```

## 踩坑记录

| 症状 | 原因 | 修复 |
|------|------|------|
| toast 显示 [100000]未知错误 | 后端菜单 ID 无效 | SSH 查 ERRO 日志补 patch id |
```

### 会话日志 (session-log/{date}-{session}-{scene}.md)

```markdown
---
session: {session}
profile: {profile}
date: {date}
task: "{任务描述}"
---
## 关键命令序列
## 踩坑记录
## 沉淀决策
- [ ] 创建 references/ 场景文件
- [ ] 更新 test-prompts.json
```

## Commit 约定

所有 hermes-session-harvest 产生的 commit 使用与 harvest 脚本相同的表情约定：

| 类型 | 表情 | 格式 |
|------|:----:|------|
| 新增场景 | 🏗️ | `🏗️ OpenCLI自生长: 新增场景「{name}」({date})` |
| 新增子 skill | 🌱 | `🌱 OpenCLI自生长: 新增子 skill「{name}」({count} 文件)({date})` |
| 会话日志 | 📝 | `📝 OpenCLI自生长: 新增会话日志「{name}」({date})` |
| 清理废弃 | 🧹 | `🧹 OpenCLI自生长: 清理废弃产物 — {描述}({date})` |
