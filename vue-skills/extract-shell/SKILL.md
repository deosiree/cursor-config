---
name: extract-shell
description: Use when 需要从页面内联结构中抽离可复用编排壳，并将布局能力下沉到组件层，避免业务页重复实现。
---

# 抽离编排壳（PageTabShell）Skill

## 适用场景

- 多个页面都在重复写 `BaseListToolbar + el-tabs + 内容区滚动`。
- 业务页里出现大量壳层样式（高度、滚动、Tab 宽度）并且互相复制。
- 希望将“布局编排能力”下沉到组件，业务页只保留业务逻辑。

## 目标

将页面中的编排结构抽离为通用壳组件（如 `PageTabShell`），实现：

- 统一的顶部工具栏、Tab 头、Tab 内容滚动区；
- 可选的 Tab 标签扩展按钮位（如齿轮菜单）；
- 内容可用高度统一由壳组件提供；
- 业务页仅消费插槽与参数，不再自行测算布局。

## 最小实施步骤（MVP）

1. 在 `src/components` 新增编排壳组件（建议 `PageTabShell`）。
2. 定义最小 props：`title`、`modelValue`、`tabs`、`tabType`、`showTabActions`。
3. 定义最小插槽：
   - `toolbarFilters` / `toolbarActions`
   - `tabLabelExtra`
   - `tabContent`
4. 将页面内联壳层替换为编排壳，业务逻辑不改。
5. 将“内容区高度计算”下沉到壳组件，由壳暴露 `contentHeight` 给插槽使用。

## 关键约束

- 不在壳组件写业务请求、权限判断、保存逻辑。
- 不在业务页重复实现 `shell - toolbar - tabsHeader` 高度计算。
- 只保留一套滚动真相：优先依赖 UI 组件库（Element Plus）原生滚动机制。

## 验收清单

- 页面功能不回归（搜索、保存、切换、弹窗）。
- Tab 超量时左右翻页正常，能到最左/最右边界。
- 内容区滚动正常，底部按钮可达。
- 相关页面 linter 无新增错误。

