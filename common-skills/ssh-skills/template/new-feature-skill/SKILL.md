# Feature Skill 模板

> 复制本目录到 `feature-skills/<新场景名>/`，按注释填空。
> 参照 `../feature-skills/ssh-k8s-浏览后端日志/SKILL.md` 做完整实现。

## SKILL.md 骨架

```markdown
---
name: <feature-skill-name>
description: <一句话描述，如 "jump + kubectl 查 XX Pod 日志">
tags:
  - SSH
  - kubectl
  - <场景标签>
should-trigger:
  - <触发条件 1>
  - <触发条件 2>
should-not-trigger:
  - <不触发条件>
---

# <中文标题>

> 来源：<会话日期 / Obsidian 笔记 / 排障记录>

## 何时使用

- <适用场景>

## 前置

1. morbax 打开目标集群（参见 `../../config/ssh.config.json` → `multiCluster`）
2. SSH 工具路径：`../../config/ssh.config.json` → `plinkPath` / `opensshPath`
3. 凭证：`../../config/ssh.config.local.json`（勿提交 git）
4. <该场景特有的前置>

## 标准流程

### 1. <第一步>

```bash
<命令>
```

### 2. <第二步>

```bash
<命令>
```

### 3. 输出解读

| 输出模式 | 含义 |
|----------|------|
| <模式> | <含义> |

## 该场景特有的输出契约

| 字段 | 说明 |
|------|------|
| <key> | <说明> |

## 踩坑

| 现象 | 原因 | 处理 |
|------|------|------|
| <现象> | <原因> | <处理> |

## 关联

- 父 skill：[`../../SKILL.md`](../../SKILL.md)
- 会话日志：[`../../session-log/<YYYY-MM-DD-场景>.md`](../../session-log/)
```

## 创建后须更新

1. `../../SKILL.md` 的路由表新增一行
2. `../../evals/test-prompts.json` 新增对应 prompt
3. `../../feature-skills/README.md` 新增一行
