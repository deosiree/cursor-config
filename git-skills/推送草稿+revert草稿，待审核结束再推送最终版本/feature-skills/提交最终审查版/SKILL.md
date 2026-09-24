---
name: 提交最终审查版
description: 当用户在临时分支上完成审查重构后，需要把最终结果 commit 成 final_commit 时使用。
---

# 核心任务

在 `temp_branch` 上提交审查后的最终版本，供后续 cherry-pick。

## 前置

- 当前在临时审查分支
- 用户声明审查/重构完成
- 工作区有明确终态改动（或已 staged）

## 命令

```bash
git -C "<repo>" checkout "<temp_branch>"
git -C "<repo>" add <相关路径>
git -C "<repo>" commit -m "<final message>"
git -C "<repo>" rev-parse HEAD
```

## 规则

1. 提交信息避免再用 `draft:` 前缀；写清「审查后最终版」语义。
2. 不要在此步骤 push 到共享分支（由 publish 编排负责）。
3. 若用户只要暂存不提交 → 本节点 SKIP，并在输出标 `finalShaKnown=false`。

## 输出

`finalSha` | `finalShort` | `tempBranch` | `committed`

## 边界

- 不 checkout 共享分支
- 不 revert、不 push origin develop

## 使用示例

```text
临时分支上冗余已删、命名已改，提交最终版。使用 $提交最终审查版。
```
