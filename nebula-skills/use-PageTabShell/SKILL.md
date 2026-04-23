---
name: use-pagetabshell
description: Use when 页面已经存在或需要引入 PageTabShell，并希望将内联 Tab 布局平滑迁移为壳组件复用模式。
---

# 使用 PageTabShell 迁移内联样式 Skill

## 适用场景

- 页面里已有内联的 `el-tabs`、toolbar、高度计算逻辑。
- 希望统一成 `PageTabShell`，但不希望一次性重写业务。
- 需要“分步迁移 + 每步可回归”。

## 迁移原则

- 先替换壳层结构，再迁移样式，再下沉高度能力。
- 每一步都保持业务行为不变（查询、保存、权限按钮、弹窗）。
- 避免双实现并存（例如业务页和壳组件重复做高度计算）。

## 最小迁移步骤（MVP）

1. 用 `PageTabShell` 替换页面内联 toolbar + tabs 包裹层。
2. 将原筛选和操作按钮迁移到 `toolbarFilters` / `toolbarActions`。
3. 将 Tab 标签右侧按钮迁移到 `tabLabelExtra`（如设置齿轮）。
4. 将 Tab 内容迁移到 `tabContent` 插槽，保留原业务组件和事件。
5. 清理业务页重复壳样式（header/content 间距、滚动容器、高度估算）。

## 常见问题与处理

- **问题：Tab 滚动到边缘不完整**
  - 原因：自定义滚动逻辑与 Element Plus 内部状态冲突。
  - 处理：优先使用 Element Plus 原生超量翻页机制，不额外挂滚轮改写。

- **问题：内容区高度忽高忽低**
  - 原因：业务页仍在手工计算壳层高度。
  - 处理：统一消费 `PageTabShell` 输出的 `contentHeight`。

## 验收清单

- [ ] Tab 切换与激活态正常
- [ ] Tab 标签扩展按钮显示/隐藏符合预期
- [ ] 内容区滚动正常，底部按钮可达
- [ ] 菜单类页面超量翻页可到边界
- [ ] 页面功能与权限行为无回归

