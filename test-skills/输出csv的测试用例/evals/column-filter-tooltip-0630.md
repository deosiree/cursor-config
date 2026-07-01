# column-filter-tooltip-0630 评估说明

**日期**：2026-06-30  
**来源**：apex_dev — `ColumnFilter` 接入 `SpanByTipsFill`，列设置省略文本补充悬浮显示

## 产出

[`docs/问题单/0630/column-filter-tooltip-0630.csv`](../../../Repertory/Sieyuan/nebula/docs/问题单/0630/column-filter-tooltip-0630.csv) — **6 条**

| 功能集合 | 条数 |
|---------|------|
| 列设置省略提示 | 6 |

## 覆盖改动

- `src/components/ColumnFilter/ColumnFilter.vue` — 列名 `SpanByTipsFill` + label 布局
- `src/components/SpanByTips/SpanByTipsFill` — 溢出检测 tooltip
- 影响页面：租户、用户、角色、菜单、设备管理等使用 ColumnFilter 的列表页

## 生成命令

```bash
cd test-skills/输出csv的测试用例
python scripts/generate_feature_csv.py \
  --cases configs/column-filter-tooltip-0630.cases.json \
  --template ../../../../Repertory/Sieyuan/nebula/docs/问题单/模板/tenant.csv \
  --output ../../../../Repertory/Sieyuan/nebula/docs/问题单/0630/column-filter-tooltip-0630.csv \
  --force
```

