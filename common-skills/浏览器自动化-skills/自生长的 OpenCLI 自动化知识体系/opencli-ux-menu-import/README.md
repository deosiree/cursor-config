# OpenCLI 菜单权限合并 — 预览导入

SSH + OpenCLI + HTTP 三联自动化：定位 `[100000]未知错误` 背后的 seccenter ERRO，补菜单 id，直到 dry_run 预览成功。

## 一键执行

```bash
cd docs/menu/scripts
python menu_import_preview_loop.py
```

前提：apex dev 已启动（默认 API `http://localhost:8082/dev-api/direct/seccenter/v2`）。

## 与 ssh-skills 分工

| 能力 | skill |
|------|-------|
| kubectl 查 ERRO | [`../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/`](../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md) |
| 补 id + merge + 预览 | 本 skill `scripts/` |

## 文件

见 [`scripts/README.md`](scripts/README.md)
