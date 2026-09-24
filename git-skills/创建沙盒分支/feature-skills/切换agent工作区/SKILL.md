---
name: 切换agent工作区
description: 当沙盒已就绪，需要尝试把当前 Cursor agent 根目录切到沙盒路径，失败时给出手开路径时使用。
---

# 核心任务

尽力 `move_agent_to_root` 到 `sandbox_path`；失败不回滚已建沙盒。

## 步骤

1. 读取 Cursor MCP `cursor-app-control` / `move_agent_to_root` 参数 schema。
2. 调用：`rootPath = <sandbox_path 绝对路径>`。
3. 若报错（例如 multi-repo cloud agent 无法切到单目录）：

| 尝试 | 结果 |
| --- | --- |
| 单 `rootPath` | 常因 multi-repo 限制失败 |
| `rootPaths: [sandbox]` | 可能同样失败 |
| 仍失败 | 向用户给出绝对路径，请手动 Open Folder；`moved=false` |

4. 不因此删除 worktree。

## 输入示例值

```text
sandbox_path=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
```

## 输出（必填 + 示例）

成功：

```text
moved=true
moveError=
manualOpenPath=
```

MCP 失败（常见）：

```text
moved=false
moveError=Cannot pull a multi-repo cloud agent into a single-folder workspace
manualOpenPath=F:/Documents/Repertory/Sieyuan/nebula/apex_devmgr
```

## 边界

- 不 push、不改 git 对象。
- 本地-only 分支可能导致部分环境下 fetch 失败；本步骤以「工作区根」切换为主，不强制 push 远端。

## 使用示例

```text
沙盒在 F:/.../apex_devmgr，请切 agent 根目录。使用 $切换agent工作区。
```
