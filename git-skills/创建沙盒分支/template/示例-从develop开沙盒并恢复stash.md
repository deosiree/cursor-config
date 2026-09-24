# 示例：从 develop 开沙盒并恢复 stash

## 用户请求（真实会话摘要）

基于当前 `develop` 给 `apex_dev` 开沙盒分支 `devmgr`，用于在开发菜单导入模态框时，并发恢复已 stash 的「设备显示场站名称」改动。

## Agent 执行摘要

1. **分析-沙盒现状**：主仓 `apex_dev` 在干净 `develop` @ `41db9fd9`；已有 sibling worktree `apex_menu-io`、`apex_menu-io-diff`；`stash@{0}` 为场站名称相关 11 文件。
2. **策略**：`intent=create`。
3. **解析路径**：`apex_dev` + `devmgr` → `apex_devmgr`（`^(.+_)dev$` → `$1devmgr`）。
4. **创建 worktree**：

```bash
git worktree add ../apex_devmgr -b devmgr develop
```

5. **恢复 stash**：在沙盒 `stash apply stash@{0}`，无冲突后 `stash drop`。
6. **切换工作区**：`move_agent_to_root` 因 multi-repo cloud agent 限制失败 → 报告手开路径。
7. **验收**：主仓仍干净 `develop`；沙盒 `devmgr` 带未提交 WIP。

## 关键不变量

- 未 push `devmgr`
- 未在本步骤实现业务功能
- stash 冲突时不会 drop（本例无冲突）
