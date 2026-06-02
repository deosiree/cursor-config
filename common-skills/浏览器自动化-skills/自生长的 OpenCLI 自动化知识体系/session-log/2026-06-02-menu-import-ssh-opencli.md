# 会话日志：菜单导入 + SSH + OpenCLI 三联排障

> 2026-06-02 · 菜单权限合并 YAML · ImportProjectMenuTree · 48 集群 seccenter

## 元数据

| 字段 | 值 |
|------|-----|
| Session | `nebula-menu-import`（OpenCLI UI）；HTTP 自动化不依赖 session |
| Profile | `local-subapp`（8082 apex dev）/ `cloud`（t-cloud） |
| 日期 | 2026-06-02 |
| 目标 | 预览导入 `菜单树0602_1455_权限合并.yaml` |
| Wire project | `51` |
| SSH jump | `10.17.196.48`（用户 `shr`，命名空间 `platform`） |

## 问题链

```text
UI 导入 → toast [100000]未知错误
    ↓ SSH kubectl logs
ERRO: 菜单 '查看首页' 的 ID 无效: 0
    ↓ 根因
patch_children_add 新增 function 无 id
    ↓ 修复
API create / ensure-patch-menu-ids → merge → dry_run
    ↓ 结果
PREVIEW OK: deleted=131 created=131
```

## SSH 关键命令

```bash
kubectl get pods -n platform | grep seccenter
kubectl logs --tail=10000 seccenter-v2-6d8bb9f9c-rfmzz -n platform \
  | grep -E 'ImportProjectMenuTree|ID 无效|ERRO'
```

Windows plink（密码用环境变量，勿入仓库）：

```powershell
& "C:\Program Files\PuTTY\plink.exe" -ssh -P 22 -l shr -pw $env:SSH_JUMP_PASSWORD -batch `
  -hostkey "SHA256:Z+CYBD3iefUsG37uBk37bhQm0iVe65ULyRr/VquFsDI" 10.17.196.48 `
  "kubectl logs --tail=10000 <pod> -n platform 2>&1 | grep -E 'ImportProjectMenuTree|ID 无效|ERRO' | tail -20"
```

## HTTP 自动化（推荐）

```bash
cd docs/menu/scripts
python menu_import_preview_loop.py
# NEBULA_API_BASE=http://localhost:8082/dev-api/direct/seccenter/v2
# NEBULA_WIRE_PROJECT=51
```

## 补 id 样本（2026-06-02）

| perm | id | parent |
|------|-----|--------|
| sys:dashboard:view | 2107 | 2 |
| sys:tenant:bindDevice | 2108 | — |
| sys:tenant:bindResource | 2109 | — |
| sys:role:query | 2110 | — |
| sys:securityConfig:edit | 2111 | — |
| sys:sessionConfig:edit | 2112 | — |
| sys:state:loginSetting | 2113 | — |

## 踩坑

| 现象 | 结论 |
|------|------|
| t-cloud 父页 `fetch('/dev-api/...')` | 返回 SPA HTML，非 JSON |
| OpenCLI eval 直接返回 Promise | 须 `window.__apiResult` 轮询或改 Python requests |
| PowerShell 中文引号 | ParserError；关键输出改英文 |
| toast 100000 | 仅兜底；以 Pod ERRO 为准 |
| merge 后 component 在 children 后 | PyYAML 错位 → `normalize_page_node` |

## 沉淀物

| 类型 | 路径 |
|------|------|
| SSH feature skill | `ssh-skills/feature-skills/ssh-k8s-浏览后端日志/` |
| OpenCLI 子 skill | `opencli-ux-menu-import/` |
| 场景 reference | `references/场景-菜单导入与SSH联调.md` |
| 业务文档 | `docs/menu/导入失败排查-100000.md` |
| 脚本 | `docs/menu/scripts/menu_import_preview_loop.py` |

## 沉淀决策

- [x] 创建 `ssh-skills` agent + `ssh-k8s-浏览后端日志` feature
- [x] 创建 `opencli-ux-menu-import` 子 skill
- [x] 注册路由表 + test-prompts + source-map
- [ ] 用户在 t-cloud 正式 import（预览已通过）
