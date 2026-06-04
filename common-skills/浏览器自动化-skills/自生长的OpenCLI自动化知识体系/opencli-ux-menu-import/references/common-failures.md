# 菜单导入常见失败

| 症状 | 根因 | 修复 |
|------|------|------|
| toast `[100000]未知错误` | SSH ERRO 才是真实原因 | 走 SSH skill 查 seccenter 日志 |
| `菜单 'xxx' 的 ID 无效: 0` | `patch_children_add` 缺 id | `ensure-patch-menu-ids.py --list-missing` 补 id |
| PyYAML component 在 children 后 | `merge-perm-patch.py` 的 `normalize_page_node` 顺序 | 已修复；重新 merge |
| HTTP dry_run 返回非 0 | API base 不对 / wire project 不对 | 检查 `menu-import.config.json` 的 `defaultApiBase` |
| Python 报 module 找不到 | 未在 nebula repo 根目录运行 | `cd {repo_root}` 再执行 |
