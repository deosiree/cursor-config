# role-perm-keyword-trim-0624 导出记录

- **日期**：2026-06-24
- **来源**：角色管理搜索框失焦/回车 trim + 固定宽度 + 过滤态全选前 trim
- **cases**：`configs/role-perm-keyword-trim-0624.cases.json`（6 条）
- **CSV**：`docs/问题单/0624/role-perm-keyword-trim-0624.csv`
- **校验副本**：`evals/generated/role-perm-keyword-trim-0624-verify.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/role-perm-keyword-trim-0624.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/menu.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0624/role-perm-keyword-trim-0624.csv \
  --force
```

## 覆盖场景

| 用例 | 验证点 |
|------|--------|
| 菜单树尾部空格失焦 trim | 显示值 trim + 过滤正确 |
| 菜单树尾部空格回车 trim | Enter 触发 trim |
| 仅空格失焦 | 恢复全量展示 |
| 功能项搜索 trim | 右侧列表过滤 |
| 过滤态全选前 trim | scope 不受尾部空格影响 |
| 搜索框聚焦宽度 | 悬浮/聚焦宽度不变 |

## 0624 目录已有用例

- `menu-delete-cache-0624.csv`
- `role-perm-scope-select-0624.csv`
- `role-perm-keyword-trim-0624.csv`（本次新增）
