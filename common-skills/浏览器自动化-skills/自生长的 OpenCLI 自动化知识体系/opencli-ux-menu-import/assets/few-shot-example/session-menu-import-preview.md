# Few-shot：菜单权限合并 YAML 预览导入 + SSH 三联

> 2026-06-02 · wire project 51 · apex dev 8082 · seccenter ImportProjectMenuTree

## 背景

合并产物 `菜单树0602_1455_权限合并.yaml` 在 UI 导入预览时报 `[100000]未知错误`。Network 不完整时，SSH 到 48 集群查 seccenter Pod 日志得到真实 ERRO：`菜单 '查看首页' 的 ID 无效: 0`。

## 三联闭环

```text
① HTTP dry_run 或 OpenCLI UI 导入预览 → 失败
② SSH kubectl logs → ERRO 行
③ ensure id → merge → 再 dry_run → PREVIEW OK
```

## 有效命令：HTTP 自动化（首选）

```bash
cd docs/menu/scripts
python menu_import_preview_loop.py
# 成功输出示例：
# PREVIEW OK: deleted=131 created=131
```

环境变量：

```bash
export NEBULA_API_BASE=http://localhost:8082/dev-api/direct/seccenter/v2
export NEBULA_WIRE_PROJECT=51
```

## 有效命令：SSH 查真实错误

```bash
kubectl get pods -n platform | grep seccenter
kubectl logs --tail=10000 <pod> -n platform \
  | grep -E 'ImportProjectMenuTree|ID 无效|ERRO'
```

## OpenCLI UI（辅助复现）

```bash
opencli browser nebula-menu-import open "http://localhost:8082/cloud/Apex/system/menu"
# 导入 → 选 菜单树0602_1455_权限合并.yaml → 预览
# 读 .el-notification__content 或截图
```

**勿**在 t-cloud 父页 eval `fetch('/dev-api/...')` — 会得到 SPA HTML。

## 实测结论

| 步骤 | 结果 |
|------|------|
| 首次 dry_run | FAIL：ID 无效: 0 |
| SSH ERRO 对照 | PASS：与 toast 100000 不一致，以 ERRO 为准 |
| 补 2107~2113 后 merge | PASS |
| 最终 dry_run | PASS：deleted=131 created=131 |

## 沉淀物

- SSH：`ssh-skills/feature-skills/ssh-k8s-浏览后端日志/SKILL.md`
- OpenCLI：`opencli-ux-menu-import/SKILL.md`
- 场景：`references/场景-菜单导入与SSH联调.md`
- 脚本：`docs/menu/scripts/`（本 skill 仅引用，不拷贝）
