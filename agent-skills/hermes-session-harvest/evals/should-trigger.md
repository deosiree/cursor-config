# should-trigger — 触发 hermes-session-harvest 的场景

- 用户明确说"沉淀"/"自生长"/"harvest"/"保存经验"/"收尾"/"归档"
- 本次会话使用了 `opencli browser` 或 `opencli fetch` 命令
- 本次会话执行了 shell 命令（kubectl/curl/python 脚本）且产生了可复用的命令序列
- 本次会话在 `opencli-ux-*/` 下通过 write_file 创建了新文件
- 本次会话修复了一个 bug 并验证通过
- 本次会话的产出未被已有 skill 完全覆盖（需检查路由表）

## 触发后行为

Agent 自动执行四步 audit（SCAN → CLASSIFY → HARVEST/DEL → REPORT），
不需要用户进一步提示。
