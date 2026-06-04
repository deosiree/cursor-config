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
|:-----|:------|
| **一键预览闭环（推荐）** | `bash run-e2e.sh`（委托到外部脚本，见 [`config/menu-import.config.json`](config/menu-import.config.json)） |
| **SSH 查真实错误** | → [`../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md`](../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md) |
| **只补补丁 id** | `bash run-e2e.sh --ensure-ids` |
| **合并 YAML** | `python ../../docs/menu/merge-perm-patch.py`（repo 内 `docs/menu/`） |
| **业务排查文档** | `docs/menu/导入失败排查-100000.md` |
| **联调场景说明** | [`../references/场景-菜单导入与SSH联调.md`](../references/场景-菜单导入与SSH联调.md) |
| **常见失败排查** | [`references/common-failures.md`](references/common-failures.md) |
| **执行前认知** | [`template/before/认知断层.md`](template/before/认知断层.md) |

## 三联闭环（Agent 必遵）

```text
① OpenCLI/浏览器/HTTP 触发 import dry_run
        ↓ 失败 toast [100000]未知错误
② SSH → kubectl logs → ERRO 行（真实原因）
        ↓ 例：ID 无效: 0
③ 修复：API create 或 UI 创建 → 写 id 进 权限补丁.yaml → merge → 回到 ①
```

## RED — 失败基线

Agent 在没有本 skill 时容易犯的错误：

1. **只看 toast 不看 SSH**：前端 toast `[100000]未知错误` 只是兜底，真正原因在 seccenter 日志
2. **发现 id=0 但不知道怎么补**：`patch_children_add` 缺 id，需调 API 查真实 id 写回 YAML
3. **不 merge 就预览**：权限补丁.yaml 和菜单树 yaml 没合并 → PyYAML 顺序错误
4. **用错 API base**：尝试 `localhost:8080/dev-api`（返回 SPA HTML）而非 `8082/dev-api/direct`
5. **一次修复不回退**：补 id 后如果仍然 PREVIEW FAIL，没有「回退→改另一方案→重试」的迭代循环

## 执行主线（Phase 0→3，Agent 必遵）

| Phase | 动作 | 输出 | 失败后 |
|:-----:|:------|:-----|:-------|
| **0** | 前置检查：apex dev 端口可达？opencli doctor？补丁 YAML 路径存在？ | 环境就绪清单 | 任何一项 RED → STOP，提示用户修复 |
| **1** | HTTP dry_run：`python scripts/menu_import_preview_loop.py`（或委托 `bash run-e2e.sh`） | `previewOk: 0` / 非 0 | 非 0 → **不要改代码**，直接走 Phase 2 |
| **2** | SSH 查 ERRO：走 `ssh-skills/feature-skills/ssh-k8s-浏览后端日志/` → `kubectl logs --tail=50` → grep `ERRO` | `erroLine` | 空 → 查 ingress / kubectl context |
| **3** | 修复 → 回 Phase 1：对照 ERRO 改补丁 YAML → `ensure-patch-menu-ids.py` 或手动写 id → merge → 回到 Phase 1 重试 | `PREVIEW OK` 或 `N 次后放弃` | 3 轮仍 FAIL → 截图 SSH 上下文报告给用户 |

### Phase 0 前置检查详细清单（Agent 自动执行）

```bash
# 1. 确认外部脚本路径存在
test -f "../../../docs/menu/scripts/menu_import_preview_loop.py" || { echo "❌ 脚本路径不对"; exit 1; }

# 2. 确认 API base 可达（local）
curl -s -o /dev/null -w "%{http_code}" "http://localhost:8082/dev-api/direct/seccenter/v2/apiWhitelist/list?page=1&size=1" 2>/dev/null | grep -q "200" || echo "⚠️ API 不可达，检查 apex dev 是否启动"

# 3. 确认补丁 YAML 存在
test -f "../../../docs/menu/菜单树0602_1455_权限合并.yaml" || echo "⚠️ 产物 YAML 不存在"

# 4. opencli doctor（UI 路径需要时）
# opencli doctor >/dev/null 2>&1 || { echo "❌ opencli 未就绪"; exit 1; }
```

### Phase 1→3 循环条件

```
Phase 1 (HTTP dry_run) ───→ OK ───→ 输出契约，结束
     │
     └──→ FAIL
           │
           ↓
     Phase 2 (SSH ERRO)
           │
           ↓
     Phase 3 (修复)
           │
           └──→ 回到 Phase 1（最多 3 轮）
                  │
                  └──→ 3 轮仍 FAIL → STOP，报告用户
```

### 🔴 人工门禁

| 时机 | 确认语 |
|:-----|:-------|
| Phase 0 后（开始 dry_run 前） | 「环境已就绪，将在 **{API base}** 执行 dry_run，确认？(y/n)」 |
| Phase 2 拿到 ERRO 后 | 「SSH 查到的真实错误：`{erroLine}`。根据此错误修复 YAML，继续？(y/n)」 |
| 补 id 前 | 「将把以下 perm→id 写入补丁 YAML：`{patchedIds}`，确认？(y/n)」 |

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
