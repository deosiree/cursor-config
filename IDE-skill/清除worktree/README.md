# 清除 worktree

扫描 nebula 等多根工作区下各 Git 仓库的**过期临时 worktree**，默认 **dry-run**，确认后 `git worktree remove`。

## 触发方式

在 Cursor 中说：

```text
清除 F:\Documents\Repertory\Sieyuan\nebula 下 3 天前的 agent worktree
```

或：`清理 .claude/worktrees`、`Source Control 里 agent-xxxx 太多`

Agent 应加载 [`SKILL.md`](SKILL.md)（`清除worktree`）。

## 入参

| 参数 | 说明 |
|------|------|
| `workspaceRoot` | 工作区顶层，如 `F:\Documents\Repertory\Sieyuan\nebula` |
| `olderThanDays` | 默认 3 |
| `execute` | 默认 false；确认后才 true |

## 命令行（人类可直接跑）

```powershell
# 预览
.\scripts\clean-worktrees.ps1 `
  -WorkspaceRoot "F:\Documents\Repertory\Sieyuan\nebula" `
  -OlderThanDays 3

# 确认后删除
.\scripts\clean-worktrees.ps1 `
  -WorkspaceRoot "F:\Documents\Repertory\Sieyuan\nebula" `
  -OlderThanDays 3 `
  -Execute
```

## 扫描范围

每个 Git 根下仅：

- `.claude/worktrees/agent-*`
- `.worktrees/*`
- `worktrees/*`

## 目录结构

```text
清除worktree/
├── SKILL.md
├── README.md
├── scripts/clean-worktrees.ps1
├── template/
│   ├── mvp/
│   │   ├── 任务输入.md
│   │   ├── 验收理由.md
│   │   ├── dry-run-输出样例.md
│   │   └── 对话流程.md          ← 用户交互 few-shot
│   └── before/
│       └── 失败基线.md
├── references/
│   ├── 安全删除与红线条款.md
│   ├── worktree路径与白名单.md
│   └── 多根仓库扫描规则.md
└── evals/
    ├── evals.json
    └── test-prompts.json
```

## 与 Cursor 的关系

Cursor/Claude Code **会创建** Agent 隔离 worktree，**不会**按天自动清理。本 skill 补位，不修改 IDE 内置行为。

## 发现路径

Skill 位于 `.cursor/IDE-skill/清除worktree`。若未自动触发，在对话中 @ 引用 `SKILL.md` 或说明「使用清除worktree skill」。
