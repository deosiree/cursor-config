# worktree 路径与白名单

## Cursor / Claude Code 创建的 Agent worktree

- 路径：`{gitRoot}/.claude/worktrees/agent-<hash>/`
- 特征：Source Control 中显示为独立 `agent-xxxx` 存储库
- Git 注册：是 linked worktree，`.git` 为指向主仓库 `worktrees/` 的 gitdir 文件

## Superpowers / 手动 fallback

- `{gitRoot}/.worktrees/*`（[`apex_dev/.gitignore`](../../../../apex_dev/.gitignore) 已 ignore）
- `{gitRoot}/worktrees/*`（少数项目非隐藏目录）

## 不在白名单内（本 skill 不碰）

- 主 checkout（`gitRoot` 本身）
- 用户自定义非上述模式的 worktree
- `~/.config/superpowers/worktrees/`（v2 可选）

## Cursor 是否自动清理

**否。** Claude Code `worktree` 配置仅有创建项（symlink、sparse、baseRef、bgIsolation），无 TTL / 定时 prune。过期目录需手动或本 skill 清理。

## superpowers 所有权边界

Harness 创建的 `.claude/worktrees/` 归 Cursor/Claude Code；superpowers 默认不删。本 skill 在用户明确请求 + dry-run 确认后，仅对白名单 **且已过期** 的目录执行 `git worktree remove`。
