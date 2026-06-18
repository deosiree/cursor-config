# 角色管理菜单权限补测 — 质量报告（0615）

## 交付物

| 文件 | 说明 |
|------|------|
| `docs/问题单/0615/role.csv` | **16 条**，UTF-8 BOM v2，含 `功能集合`（菜单权限 14 + 关联设备 2，含 1 条 E2E） |
| `configs/role-perm-0615.cases.json` | 0615 单一真相源（16 条，无角色组） |
| `configs/role-perm-*.cases.json` | 拆分主题 configs（参考） |
| `configs/role.cases.json` | v2 全量 41 条（含 0615 相关 16 条，无角色组） |

**无** `e2e.csv`（E2E 已合并进 `role.csv`）。**无**角色组用例（功能未开放）。

## 覆盖主题

| featureSet | 条数 |
|------------|------|
| 菜单权限 | 14（含 1 条 E2E，`预留字段1=e2e`） |
| 关联设备 | 2 |

## P0 用例清单

1. 编辑角色-点击已勾选页面-功能项仅反显已有授权
2. 编辑角色-部分勾选功能项-保存重开-勾选态一致
3. 编辑角色-菜单已勾选但功能项未全选-保存后测试用户仅见已授权按钮（`role.csv` 内 E2E）

## 复跑命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/role-perm-0615.cases.json \
  --template ../../../docs/问题单/模板/role.csv \
  --output ../../../docs/问题单/0615/role.csv \
  --force
```

## 测试系统清理

见 `docs/问题单/0615/role-test-system-cleanup.README.md`
