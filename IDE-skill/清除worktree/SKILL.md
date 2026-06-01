---
name: 清除worktree
description: 扫描多根工作区下各 Git 仓库的过期临时 worktree（.claude/worktrees/agent-*、.worktrees/*），默认 dry-run 预览，用户确认后 git worktree remove。
run_as: inline
trigger_words: 清除 worktree、清理 agent-xxxx、.claude/worktrees、过期 worktree、worktree prune
---

# 清除临时 worktree

## 何时使用

- Source Control 堆积 `agent-xxxx` 存储库
- 需按天数清理 `.claude/worktrees` / `.worktrees`
- 多项目根目录（如 nebula）下一键扫描

## 何时不要使用

- 新建 worktree 做功能开发 → 用 `using-git-worktrees`
- 删除整个仓库 / 硬删目录 → 非本 skill
- 清理非白名单路径（`references/worktree路径与白名单.md` 之外）

## 输入契约

| 参数 | 必填 | 默认 | 说明 |
|------|------|------|------|
| `workspaceRoot` | 是 | — | 多根工作区绝对路径 |
| `olderThanDays` | 否 | 3 | LastWriteTime 早于 cutoff |
| `execute` | 否 | false | true 时才实际删除 |

缺参时用 AskQuestion 确认，勿猜测路径。

## 执行步骤

1. 读取 [`references/安全删除与红线条款.md`](references/安全删除与红线条款.md) 中的红线条款
2. 解析脚本路径：`<skillDir>` = 本 SKILL.md 所在目录的**绝对路径**（如 `F:\...\.cursor\IDE-skill\清除worktree`）。替换后运行脚本（**默认无 `-Execute`**）：

```powershell
& "<skillDir>/scripts/clean-worktrees.ps1" `
  -WorkspaceRoot "<workspaceRoot>" `
  -OlderThanDays <N>
```

3. 读取脚本输出：
   - **stdout 表格**：`GitRoot | WorktreePath | LastWrite | AgeDays | Action | Reason` — 必呈现给用户
   - **stderr / Write-Warning**：如目录不可读等非致命告警 — 以折叠块展示，不淹没主表格
   - **exit code**：脚本退出值为 0（全部成功）/ 1（有 failed），向上汇报
   - 若脚本未找到或抛出异常：终止本流程，向用户报错并建议手动定位 skill 目录
4. 若 `Action=dry-run` 存在：**停止**，询问「是否执行删除？」。用户拒绝时，允许修改 `olderThanDays` 或 `workspaceRoot` 后重试
5. 仅当用户**明确同意**后，加 `-Execute` 重跑同一命令
6. 汇报：`removed / skipped / failed` 计数；建议用户在主仓库执行 `git worktree list` 自检；若 `failed > 0` 列出失败路径供手动处理

## 红线条款（摘要）

- 禁止 `Remove-Item -Recurse` 替代 git 命令
- 禁止删白名单外路径与主 checkout
- 禁止跳过 dry-run 直接 Execute
- 详见 [`references/worktree路径与白名单.md`](references/worktree路径与白名单.md)

## 输出契约

- dry-run：候选列表 + cutoff + 汇总计数
- execute：同上 + removed/failed 明细
- 无候选：说明未发现白名单内目录

## 参考

- 路径白名单：[`references/worktree路径与白名单.md`](references/worktree路径与白名单.md)
- 多根扫描：[`references/多根仓库扫描规则.md`](references/多根仓库扫描规则.md)
- 工作流时序：[`references/工作流时序图.md`](references/工作流时序图.md) — PS1 5 阶段流程 + 5 层保护判定
- 输出样例：[`template/mvp/dry-run-输出样例.md`](template/mvp/dry-run-输出样例.md)
- 对话流程：[`template/mvp/对话流程.md`](template/mvp/对话流程.md) — dry-run→confirm→execute 完整示例
- 失败基线：[`template/before/失败基线.md`](template/before/失败基线.md) — 无 skill 时的常见失败模式
