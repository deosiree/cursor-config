---
name: 提交revert并push
description: 当 publish_final 已在共享分支准备好 revert: 提交（或刚 commit）后，需要与最终版一起普通 push 到保护分支时使用。禁止在审查未通过、尚未准备 F 时单独调用本节点。
---

# 核心任务

把 `revert:` 提交推到保护分支；**通常与最终版 F 同一次 `publish_final` 会话推送**（先确保 revert 与 F 都已在本地 shared tip 上，再 push）。

**禁止**：审查未完成时单独 push 仅含 `revert:` 的 tip（他人会立刻拉到旧码）。

## 前置

- 策略已在 `publish_final`；最终版即将或已经 cherry-pick 到共享支
- 已过 CHECKPOINT-REVERT / CHECKPOINT-FINAL-PUSH（可合并确认「成对推送」）
- `force=false`

## 命令

```bash
# 对每个 sha（新 → 旧）：
git -C "<repo>" revert --no-commit <sha>
git -C "<repo>" commit -m "revert: <原提交摘要>（回滚 <sha 短号>）"

git -C "<repo>" push origin "<shared_branch>"
# 若配置了 upstream：
git -C "<repo>" push upstream "<shared_branch>"
```

文案约定：前缀 **`revert:`**（小写 + 冒号），正文可用原 subject 缩短；须含被回滚短 SHA，便于审计。

若上一节点已对多 SHA 一次性 `--no-commit` 堆在 index：可交一笔 `revert: 系列 …（回滚 <newest>..<draft>）`，但夹他人时禁止 range，必须拆开。

## 硬约束

- push **禁止** `--force` / `--force-with-lease`
- 不 `reset --hard`
- 不 amend 已推送的草稿/热修原文
- 一侧 push 失败：报告成功/失败列表，不自动 revert 已成功侧

## 输出

`revertShas[]` | `revertedCommits[]` | `remotesPushed[]` | `sharedBranchTip` | `conflictFiles[]`

## 边界

- 不 cherry-pick F（那是 `publish_final` / [[../cherry-pick最终版并push/SKILL.md]]）
- 不在此节点做 reclaim（须已在临时支完成）

## 使用示例

```text
已对 0e14f561、f2e80622 准备好逆补丁。分别 commit 为 revert: … 并 push origin+upstream develop。
使用 $提交revert并push。
```
