# 角色管理菜单权限补测 — 质量报告（0615）

## 交付物

| 文件 | 说明 |
|------|------|
| `docs/问题单/0615/role.csv` | 19 条 UI 用例，UTF-8 BOM |
| `docs/问题单/0615/e2e.csv` | 2 条双会话生效链 |
| `configs/role-perm-*.cases.json` | 6 个主题 configs |
| `configs/role.cases.json` | v2 全量 +21 条（46 总） |

## 覆盖主题

| featureSet | 新增条数 |
|------------|----------|
| 菜单权限 | 14 |
| 角色组 | 5 |
| 关联设备 | 2 |

## P0 用例清单

1. 编辑角色-点击已勾选页面-功能项仅反显已有授权
2. 编辑角色-部分勾选功能项-保存重开-勾选态一致
3. 编辑角色-菜单已勾选但功能项未全选-保存后测试用户仅见已授权按钮（e2e）

## 复跑命令

```bash
cd .cursor/test-skills/输出csv的测试用例
python scripts/append_ui_cases_to_csv.py --domain role --date 0615 \
  --cases configs/role-perm-function-display.cases.json \
  --overrides-json '{"子系统":"17","模块名":"角色管理界面"}'
```

## 测试系统清理

见 `docs/问题单/0615/role-test-system-cleanup.README.md`
