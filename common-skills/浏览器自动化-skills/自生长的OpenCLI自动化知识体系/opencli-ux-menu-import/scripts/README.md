# 脚本说明

本 skill **不拷贝**脚本到 OpenCLI 目录（遵守知识体系「只引用不拷贝」约束）。可执行脚本位于仓库：

```
docs/menu/scripts/
├── menu_import_preview_loop.py   # 主流程：ensure id + merge + HTTP dry_run
├── ensure-patch-menu-ids.py      # 把 API 返回 id 写回 权限补丁.yaml
├── menu-import-ux.config.json    # API base、wire project、路径
├── run-ensure-items.json         # 待补 perm 清单
└── menu-import-preview-opencli.ps1  # OpenCLI 版（不如 Python 稳）
```

## 一键预览

```bash
# 从 nebula 仓库根目录
cd docs/menu/scripts
python menu_import_preview_loop.py
```

前提：

1. apex dev 已启动（默认 `http://localhost:8082`）
2. 已合并 YAML：`docs/menu/菜单树0602_1455_权限合并.yaml`
3. 补丁：`docs/menu/菜单树0602_1455_权限补丁.yaml`

## 合并 YAML

```bash
cd docs/menu
python merge-perm-patch.py
```

## 仅列缺失 id

```bash
cd docs/menu/scripts
python ensure-patch-menu-ids.py --list-missing
```

## 与 SSH skill 配合

预览仍失败且 HTTP 响应不完整时 → [`ssh-skills/feature-skills/ssh-k8s-浏览后端日志/`](../../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md)
