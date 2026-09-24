---
name: 创建沙盒分支-few-shot
description: few-shot 样本壳；正式规则以父级 SKILL.md 为准。
---

# 正确触发 · 创建

**用户：** 基于 develop 给 apex_dev 开沙盒 devmgr，把 stash@{0} 恢复进去，菜单导入继续在原仓做。

**Agent：** 分析现状 → intent=create → 解析 `apex_devmgr` → worktree add -b → stash apply → 无冲突 drop → 尝试切仓 → 验收；不 push、不写业务。

# 正确触发 · 删除

**用户：** devmgr 沙盒不要了，安全删掉；未合入的话先问我。

**Agent：** intent=delete → 检查脏/合入 → CHECKPOINT → 确认后 remove worktree → branch -d/-D → 不删远端。

# 应改走 merge

**用户：** 临时分支收工了，整支 merge 进 develop 再删掉。

**Agent：** 不走删除编排冒充 merge；handoff 到 merge临时分支 skill。

# 应 STOP

**用户：** 把 develop 这个沙盒删了吧。

**Agent：** protected → blocked，不删除。
