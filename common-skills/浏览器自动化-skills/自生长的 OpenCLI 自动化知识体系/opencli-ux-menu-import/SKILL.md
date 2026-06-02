---
name: opencli-ux-menu-import
description: OpenCLI + SSH + HTTP 菜单权限合并 YAML 预览导入自动化。捕获 [100000] 等 toast/API 错误，SSH 查 seccenter 真实 ERRO，自动补 patch_children_add 的 id 并重试 dry_run 直至预览成功。当菜单 ImportProjectMenuTree、权限合并 YAML、导入预览失败时使用。
tags:
  - OpenCLI
  - 菜单导入
  - SSH
  - kubectl
  - 权限合并
  - dry_run
should-trigger:
  - prompt 含 OpenCLI + 菜单导入 / 预览导入 / 权限合并 yaml
  - prompt 含 菜单树0602_1455_权限合并 + 导入 / 预览
  - prompt 含 ImportProjectMenuTree + 100000 / 未知错误
  - prompt 含 patch_children_add + id 无效 / SSH 查日志
  - prompt 含 menu_import_preview_loop 或 docs/menu/scripts
should-not-trigger:
  - 仅菜单 routePath 判重（走 opencli-ux-menu）
  - 仅 SSH 查日志、不涉及菜单 YAML（走 ssh-skills）
  - 仅改 merge-perm-patch.py 源码、不需要验证导入
---

# OpenCLI 菜单权限合并 — 预览导入自动化

> **SSH + OpenCLI + HTTP 三联：** toast 误导 → SSH 拿 ERRO → 补 id → HTTP/OpenCLI 再预览。
> **2026-06-02 样本：** `菜单 '查看首页' 的 ID 无效: 0` → 补 2107~2113 → `PREVIEW OK: deleted=131 created=131`。

## 快速路由

| 意图 | 动作 |
|------|------|
| **一键预览闭环** | `python scripts/menu_import_preview_loop.py`（见 [`scripts/README.md`](scripts/README.md)） |
| **SSH 查真实错误** | → [`../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md`](../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md) |
| **只补补丁 id** | `python scripts/ensure-patch-menu-ids.py --list-missing` |
| **合并 YAML** | `python ../../docs/menu/merge-perm-patch.py`（repo 内 `docs/menu/`） |
| **业务排查文档** | `docs/menu/导入失败排查-100000.md` |
| **联调场景说明** | [`../references/场景-菜单导入与SSH联调.md`](../references/场景-菜单导入与SSH联调.md) |

## 三联闭环（Agent 必遵）

```text
① OpenCLI/浏览器/HTTP 触发 import dry_run
        ↓ 失败 toast [100000]未知错误
② SSH → kubectl logs → ERRO 行（真实原因）
        ↓ 例：ID 无效: 0
③ 修复：API create 或 UI 创建 → 写 id 进 权限补丁.yaml → merge → 回到 ①
```

## 核心脚本（相对本 skill）

| 脚本 | 用途 |
|------|------|
| [`scripts/menu_import_preview_loop.py`](scripts/menu_import_preview_loop.py) | ensure id + merge + HTTP dry_run 循环 |
| [`scripts/ensure-patch-menu-ids.py`](scripts/ensure-patch-menu-ids.py) | 把 API 返回 id 写回补丁 |
| [`scripts/menu-import-ux.config.json`](scripts/menu-import-ux.config.json) | API base、wire project、路径 |
| [`scripts/run-ensure-items.json`](scripts/run-ensure-items.json) | 待补 id 的 perm 清单 |

产物 YAML：`docs/menu/菜单树0602_1455_权限合并.yaml`

## 环境选择

| 环境 | API 路径 | 说明 |
|------|----------|------|
| **本地 apex dev（推荐自动化）** | `http://localhost:8082/dev-api/direct/seccenter/v2` | vite proxy，requests 直连 |
| **t-cloud 浏览器** | OpenCLI 登录 + UI 导入 | `/dev-api` 在主文档常返回 SPA HTML，**勿**在父页 eval fetch |
| **48 集群日志** | SSH plink + kubectl | 与 UI 环境一致时对照 ERRO |

环境变量：

| 变量 | 默认 |
|------|------|
| `NEBULA_API_BASE` | `http://localhost:8082/dev-api/direct/seccenter/v2` |
| `NEBULA_WIRE_PROJECT` | `51` |
| `NEBULA_OPENCLI_UI` | 设 `1` 可在 HTTP 成功后打开菜单页 |

## OpenCLI 用法（UI 侧）

```bash
opencli doctor
opencli browser nebula-menu-import open "https://t-cloud.lanniu.top/cloud/login"
# 密码登录 tab → fill → login-submit-btn eval
opencli browser nebula-menu-import open "https://t-cloud.lanniu.top/cloud/Apex/system/menu"
# 导入 → 选文件 → 预览 → 读 .el-notification__content 或 network
```

本地子应用免登录：

```bash
opencli browser nebula-menu-import open "http://localhost:8082/cloud/Apex/system/menu"
```

## 已知根因（2026-06-02）

| ERRO | 修复 |
|------|------|
| `菜单 'xxx' 的 ID 无效: 0` | `patch_children_add` 写 `id` + `parent_id` |
| PyYAML component 在 children 后 | `merge-perm-patch.py` 的 `normalize_page_node` |
| toast `[100000]未知错误` | 仅兜底；以 SSH ERRO 为准 |

## 前置检查

```bash
opencli doctor                    # UI 路径
# apex dev 在跑（8081/8082 以终端为准）
python scripts/menu_import_preview_loop.py
```

## 输出契约

| 字段 | 说明 |
|------|------|
| `previewOk` | dry_run HTTP code=0 |
| `deletedCount` / `createdCount` | 预览统计 |
| `erroLine` | SSH 真实错误（若曾失败） |
| `patchedIds` | 本次写入补丁的 perm→id |

## 关联会话

- [`../session-log/2026-06-02-menu-import-ssh-opencli.md`](../session-log/2026-06-02-menu-import-ssh-opencli.md)
- [`assets/few-shot-example/session-menu-import-preview.md`](assets/few-shot-example/session-menu-import-preview.md)
