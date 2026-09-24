# worktree 与 stash 注意事项

## Worktree

- 同一分支不能同时 checkout 在两个 worktree。
- 创建用：`git worktree add <path> -b <branch> <base>`。
- 删除用：先 `git worktree remove <path>`，再删分支。
- Windows 长路径可加 `git -c core.longpaths=true`。
- Sibling 命名：`apex_dev` + `devmgr` → `apex_devmgr`（见功能层解析规则）。

## Stash

- 对象库与主仓共享；在沙盒 `apply` 影响同一 stash 栈。
- 推荐 `apply` 后无冲突再 `drop`；禁止冲突时 drop。
- drop 前确认索引仍指向目标条目（中间若有其它 drop，索引会变）。

## 切仓（Cursor）

- `move_agent_to_root` 在 multi-repo cloud agent 下可能失败。
- 失败时给出绝对路径即可，不回滚沙盒。
