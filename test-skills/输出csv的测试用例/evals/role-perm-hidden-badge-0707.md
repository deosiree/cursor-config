# role-perm-hidden-badge-0707 导出记录

- **日期**：2026-07-07
- **来源**：角色管理菜单权限树 / 功能项列表标注 isVisible=false 绿色「隐藏」标签
- **cases**：`configs/role-perm-hidden-badge-0707.cases.json`（5 条）
- **CSV**：`docs/问题单/0707/role-perm-hidden-badge-0707.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/role-perm-hidden-badge-0707.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/menu.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0707/role-perm-hidden-badge-0707.csv \
  --force
```

## 覆盖场景

| 用例 | 功能集合 | 验证点 |
|------|----------|--------|
| 编辑角色-左侧菜单树-隐藏菜单展示绿色隐藏标签 | 菜单权限 | MenuPermissionTree el-tag |
| 编辑角色-右侧功能项-隐藏功能项展示绿色隐藏标签 | 菜单权限 | FunctionPermissionList el-tag |
| 编辑角色-隐藏菜单仍可勾选并保存授权 | 菜单权限 | 标签纯展示，不阻断授权 |
| 编辑角色-菜单树搜索过滤-隐藏标签仍随节点展示 | 菜单权限 | 搜索 + badge 共存 |
| 编辑角色-功能项搜索过滤-隐藏标签仍随项展示 | 菜单权限 | 右侧搜索 + badge 共存 |
