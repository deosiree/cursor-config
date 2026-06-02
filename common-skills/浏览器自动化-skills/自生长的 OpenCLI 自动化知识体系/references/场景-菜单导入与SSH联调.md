# 场景：菜单导入与 SSH 联调

> OpenCLI/HTTP 触发失败 + SSH 查真实 ERRO + 补丁修复 + 再验证。2026-06-02 菜单权限合并会话沉淀。

## 适用条件

- 菜单管理「导入」/`ImportProjectMenuTree` 失败
- toast 为 `[100000]未知错误` 或类似兜底码
- 合并 YAML：`菜单树0602_1455_权限合并.yaml`
- 用户允许 SSH 到 48 集群 jump（可选但强烈推荐）

## 已有 skill 引用

| 角色 | 路径 |
|------|------|
| SSH 查日志 | [`../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md`](../../../ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md) |
| 预览自动化 | [`../opencli-ux-menu-import/SKILL.md`](../opencli-ux-menu-import/SKILL.md) |
| 菜单判重（无关导入） | [`../opencli-ux-menu/SKILL.md`](../opencli-ux-menu/SKILL.md) |

## Agent 执行步骤

### 1. 复现（OpenCLI 或 HTTP）

```bash
# 推荐：HTTP dry_run（本地 dev）
cd docs/menu/scripts && python menu_import_preview_loop.py

# 或 OpenCLI UI
opencli browser nebula-menu-import open "http://localhost:8082/cloud/Apex/system/menu"
# 导入 → 预览 → 记录 toast / Network
```

### 2. SSH 拿真实错误

```bash
# 见 ssh-k8s-浏览后端日志 skill
kubectl logs --tail=10000 <seccenter-pod> -n platform | grep -E 'ImportProjectMenuTree|ID 无效|ERRO'
```

对照：

- **ERRO**：`菜单 '查看首页' 的 ID 无效: 0`
- **INFO**：`错误信息:[100000]未知错误`

### 3. 按 ERRO 修复

| ERRO 模式 | 动作 |
|-----------|------|
| `ID 无效: 0` | 为 `patch_children_add` 补 `id`/`parent_id`；可先 `menu/create` API |
| component 错位 | 重跑 `merge-perm-patch.py`（含 normalize_page_node） |
| 其他 Menu 校验码 | 查 `docs/errCode/seccenter.swagger.md` 130950+ |

### 4. 再验证

```bash
python merge-perm-patch.py
python scripts/menu_import_preview_loop.py
# 期望：PREVIEW OK: deleted=N created=N
```

## 环境矩阵

| 层 | t-cloud 浏览器 | localhost:8082 dev |
|----|----------------|---------------------|
| OpenCLI UI | ✅ 登录 + 导入弹窗 | ✅ 免登录子应用 |
| eval fetch API | ❌ 父页 /dev-api → HTML | ✅ vite proxy |
| requests HTTP | N/A | ✅ 自动化首选 |
| SSH logs | ✅ 同一后端 | ✅ 同一后端（若连同一环境） |

## 踩坑

1. **不要只修 toast 文案** — 必须 SSH 或 Network 找 ERRO/response.body
2. **t-cloud 上 OpenCLI eval fetch 不可靠** — 自动化用本地 HTTP
3. **import 要求 id>0** — 新增 function 不能只有 perm，要先 create
4. **OpenCLI eval 异步** — `fetch().then` 须轮询 `window.__apiResult`，勿指望 eval 直接返回 Promise
5. **密码勿入 skill** — SSH 用 local config / 环境变量

## 会话日志

[`../session-log/2026-06-02-menu-import-ssh-opencli.md`](../session-log/2026-06-02-menu-import-ssh-opencli.md)

## 业务文档

- [`docs/menu/导入失败排查-100000.md`](../../../../docs/menu/导入失败排查-100000.md)
- [`docs/menu/merge-perm-patch.py`](../../../../docs/menu/merge-perm-patch.py)
