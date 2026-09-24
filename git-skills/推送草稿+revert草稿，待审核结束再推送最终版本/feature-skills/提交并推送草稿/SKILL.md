---
name: 提交并推送草稿
description: 当门禁已通过且用户确认，需要在共享分支上 commit 草稿并普通 push（禁止 force）时使用。
---

# 核心任务

在 `shared_branch` 上创建草稿提交并 `git push` 到远端。

## 前置

- [[../确认共享分支与工作树/SKILL.md]] `gate=pass`
- 已过编排 🔴 CHECKPOINT-DRAFT-PUSH

## 命令

```bash
git -C "<repo>" checkout "<shared_branch>"
git -C "<repo>" add <相关路径>
git -C "<repo>" commit -m "<draft message>"
git -C "<repo>" push origin "<shared_branch>"
```

若草稿已 commit 仅未 push：跳过 commit，只 push。

## 硬约束

- 禁止 `--force` / `--force-with-lease`
- 提交信息建议带 `draft:` 前缀，便于后人识别

## 失败模式

| 条件 | 处理 |
| --- | --- |
| 无改可提交且无已有草稿 commit | STOP |
| push 被拒绝（非快进） | STOP，报告；改走 pull/rebase 策略须另授权，**不** force |
| hook 失败 | 按 hook 输出修复后 **新** commit，不 `--no-verify`（除非用户明确） |

## 输出

`draftCommitCreated` | `pushed` | `headSha` | `remote` | `branch`

## 使用示例

```text
shared=develop，把当前 API 草稿提交并 push，不要 force。
使用 $提交并推送草稿。
```
