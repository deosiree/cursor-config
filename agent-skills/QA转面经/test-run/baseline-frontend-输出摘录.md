# Baseline（不带 QA转面经）· 前端试跑摘录

> 同一 prompt，agent 仅按「把讨论整理成文档」执行，无编排/无吴师兄框架。

## 产出形态

```markdown
# OperationColumn 使用说明

## 问题
操作列按钮过多会挤版。

## 做法
使用 OperationColumn + OpItem，设置 inline-visible-count。

## 参数
- inline-visible-count：槽位数，更多占 1 槽
- list-data-length：传给探针

## 示例代码
（粘贴 README 片段）

## 注意
N≤slots 时无更多；下拉里仅 1 个时全部行内。
```

## 维度 8 简评（1–10）

| 项 | 分 | 说明 |
|----|-----|------|
| 完成用户意图 | 7 | 信息齐全，适合当 README |
| 相对 with_skill | 5 | 无面试钩子、无对比表、无快问快答、无区分度 |
| 副作用 | 9 | 简洁，无面试体例硬套 |

**baseline 总分（效果向）**：≈ **6.5/10**（偏内部文档，非面经）
