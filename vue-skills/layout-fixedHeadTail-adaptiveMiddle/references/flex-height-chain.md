# Flex 高度链检查

## 目标

让「头-中-尾」列表壳在 **固定视口高度** 内分配空间，中间区可收缩，尾部不被裁切。

## 自上而下检查清单

从外到内逐层确认（缺一层即可能失效）：

1. **页面根** `.app-container`
   - `height: 100%`
   - `display: flex; flex-direction: column`

2. **卡片体** `.el-card__body`（`:deep`）
   - `height: 100%`
   - `display: flex; flex-direction: column`
   - `overflow: hidden`

3. **业务编排层**（如 `.bottom-container`、`.role-index`）
   - `height: 100%` 或 `flex: 1`
   - **`min-height: 0`**（关键）

4. **列表壳根**（如 `.role-list-table`）
   - `height: 100%`
   - `min-height: 0`
   - `overflow: hidden`
   - `display: flex; flex-direction: column`

5. **中间表格容器** `.table-wrapper`
   - `flex: 1`
   - `min-height: 0`
   - `overflow: hidden`

## 为什么需要 min-height: 0

Flex 子项默认 `min-height: auto`，会按内容最小高度撑开，导致：

- 中间区无法小于内容高度
- `flex: 1` 无法把多余行高「收」进滚动区
- 底部分页被挤出视口

在每一层 flex 子项上设置 `min-height: 0`，才能让中间区真正参与剩余高度分配。

## 与动态高度的关系

Flex 链解决的是 **「中间区占多少剩余空间」**；`useTableBodyHeight` 解决的是 **「el-table 内部滚动高度等于该空间」**。两者缺一不可。
