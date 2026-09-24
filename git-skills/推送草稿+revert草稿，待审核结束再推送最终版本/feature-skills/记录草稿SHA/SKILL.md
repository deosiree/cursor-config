---
name: 记录草稿SHA
description: 当草稿已推上共享分支后，必须立刻固化 draft_commit SHA 供后续 revert 使用时调用。
---

# 核心任务

读取并持久化（对话输出 + 建议用户抄写）草稿 commit 的完整 SHA 与短摘要。

## 前置

- 草稿 commit 已存在于 `shared_branch` tip（或用户指定的草稿 tip）

## 命令

```bash
git -C "<repo>" rev-parse HEAD
git -C "<repo>" log -1 --format="%H%n%h%n%s"
```

多 commit 草稿时，列出区间：

```bash
git -C "<repo>" log --oneline <before_draft>..<draft_tip>
```

并输出 `draftCommits[]`（**新→旧**顺序，供依次 revert）。

## 输出（必出）

```text
draftSha=<full>
draftShort=<short>
draftSubject=<subject>
draftCommitCount=<n>
```

在回复中用醒目方式告诉用户：**后续 revert 必须用这个 SHA**。

## 边界

- 不修改仓库
- 不得用「大概是最近一次」代替精确 SHA

## 使用示例

```text
草稿刚 push 完，记下 SHA。使用 $记录草稿SHA。
```
