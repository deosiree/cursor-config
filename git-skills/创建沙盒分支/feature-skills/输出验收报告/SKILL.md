---
name: 输出验收报告
description: 当创建或删除编排结束（成功、冲突或 blocked）时，需要汇总路径、分支、stash 与风险结论给用户时使用。
---

# 核心任务

输出人类可读验收摘要 + 机器字段；不改仓库。

## 创建成功模板

- 主仓：仍在 `<base/current>`，干净
- 沙盒路径 / 分支 / tip SHA
- stash：applied / dropped / conflict
- agent 工作区：moved 或手动打开路径
- 下一步：可在沙盒开发；默认未 push

## 删除成功模板

- 已移除 worktree 路径
- 已删除本地分支（-d / -D）
- 远端是否删除
- 残留风险（若有）

## blocked / conflict 模板

- `status` 与原因
- `riskFlags`
- 用户可选动作（授权 discard、改走 merge、手开路径等）

## 输出字段（必填 + 创建成功示例）

```text
currentUnderstanding=已从 develop 创建沙盒并恢复 stash@{0}
intent=create
sandboxPath=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
sandboxBranch=devmgr
status=done
nextAction=在沙盒开发场站名称；主仓继续菜单导入；未 push
riskFlags=
```

删除 STOP 示例：

```text
currentUnderstanding=devmgr 未合入 develop 且工作树有未提交改动
intent=delete
sandboxPath=F:/.../apex_devmgr
sandboxBranch=devmgr
status=awaiting_confirm
nextAction=请确认 allow_discard_dirty / allow_delete_unmerged，或改走 merge skill
riskFlags=dirty,unmerged
```

## 使用示例

```text
创建编排刚结束：stash 已 apply+drop，move 失败。使用 $输出验收报告。
```
