# role-perm-scope-select-0624 导出记录

- **日期**：2026-06-24
- **来源**：角色管理 MenuPermissionTree 关键词作用域全选/清空 + PermissionTab 全量路径保留
- **cases**：`configs/role-perm-scope-select-0624.cases.json`（7 条）
- **CSV**：`docs/问题单/0624/role-perm-scope-select-0624.csv`
- **校验副本**：`evals/generated/role-perm-scope-select-0624-verify.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/role-perm-scope-select-0624.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/menu.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0624/role-perm-scope-select-0624.csv \
  --force
```

## 覆盖场景

| 用例 | 验证点 |
|------|--------|
| 过滤后全选 | 仅匹配节点并入选中，未匹配保持 |
| 过滤后清空 | 仅取消匹配节点，级联不回弹，必选保留 |
| 过滤全选含页面 | syncFunctionsForAddedMenus 功能项补齐 |
| 无关键词全选 | API 全量 + loading |
| 无关键词清空 | 仅必选 + 功能项/cache 清空 |
| 清空搜索后全选 | 恢复全量 emit 路径 |
| 功能项区过滤全选/清空 | FunctionPermissionList 回归 |
