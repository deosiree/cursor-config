---
name: 提交热修并多远端push
description: 当共享分支上热修改动已就绪，需要按用户文案 commit，并 push 到 origin（及存在的 upstream）且禁止 force/amend 草稿时使用。
---

# 核心任务

提交热修并推到配置的远端列表；留下 `hotfixSha`（与 `draftSha` 区分）。

## 前置

- 已在 `shared_branch` 且已对齐远端
- 热修文件已改好并通过必要检查（如 vue-tsc / lint）
- `commit_message` 必填
- 已过 🔴 CHECKPOINT-HOTFIX-PUSH

## 命令

```bash
git -C "<repo>" add <hotfix_paths 或 -A 限定相关路径>
git -C "<repo>" commit -m "<commit_message>"
hotfixSha=$(git -C "<repo>" rev-parse HEAD)

# 默认 remotes：origin；若 git remote 含 upstream 则一并推
git -C "<repo>" push origin "<shared_branch>"
git -C "<repo>" push upstream "<shared_branch>"   # 仅当 upstream 存在
```

`push_remotes` 用户可显式覆盖；未指定时：`origin` +（存在则）`upstream`。

## 硬约束

- 禁止 `--force` / `--force-with-lease`
- 禁止 `commit --amend` 指向已推送的 `draft_commit`
- 热修失败（hook）→ 修 lint 后 **新** commit，不跳过 hook（除非用户明确）

## 失败模式

| 条件 | 处理 |
| --- | --- |
| push 非快进 | fetch/merge 后再推；不强推 |
| 仅一侧 remote 失败 | 报告成功/失败列表；不自动 revert 已成功侧 |
| 无改可提交 | STOP |

## 输出

`hotfixSha` | `commitMessage` | `remotesPushed[]` | `hotfixPaths[]`

## 使用示例

```text
commit_message 已给定，push origin 与 upstream develop。使用 $提交热修并多远端push。
```
