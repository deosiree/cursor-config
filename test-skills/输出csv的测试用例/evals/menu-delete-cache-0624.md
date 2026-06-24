# menu-delete-cache-0624 导出记录

- **日期**：2026-06-24
- **来源**：菜单 130950 最小链路修复 + index.vue 状态精简
- **cases**：`configs/menu-delete-cache-0624.cases.json`（7 条）
- **CSV**：`docs/问题单/0624/menu-delete-cache-0624.csv`
- **生成命令**：

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/menu-delete-cache-0624.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/menu.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0624/menu-delete-cache-0624.csv \
  --force
```

## 覆盖场景

| 用例 | 验证点 |
|------|--------|
| 删除顶级 Tab | 删除成功、Tab 切换、无 130950 |
| 删除子节点 | 本地即时移除、无幽灵行 |
| 新增后立即删 | 第一次删除成功 |
| 删除后不复活 | fetchSeq 防旧 list 覆盖 |
| 删目录后 Tag | 黄 Tag + 本页树正确 |
| 刷新 session | 项目/Tab 恢复 |
| 切换 Tab session | 返回后 Tab 记忆 |
