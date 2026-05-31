# 飞书 todo-line-through 勾选检测

## 检测原理

飞书文档中，task item（待办事项）的勾选状态通过 CSS class `todo-line-through` 控制：

- **已勾选 `[x]`**：文本所在的 `<span data-leaf>` 元素 className 包含 `todo-line-through`
- **未勾选 `[ ]`**：文本所在的 `<span data-leaf>` 元素无此类名

## DOM 检测代码

```javascript
// 在 OpenCLI browser eval 中执行
const spans = aceLine.querySelectorAll('span[data-leaf]');
const hasCheck = Array.from(spans).some(s => s.className.includes('todo-line-through'));
// hasCheck === true  → 已勾选，进度 100%
// hasCheck === false → 未勾选，进展 ____%
```

## 飞书文档 DOM 结构上下文

飞书文档的 task item 的 DOM 结构大致为：

```html
<div class="ace-line" data-task="true">
  <span data-leaf="true" class="todo-line-through">已勾选的文本</span>
</div>
```

或（未勾选）：

```html
<div class="ace-line" data-task="true">
  <span data-leaf="true">未勾选的文本</span>
</div>
```

> **注意：** 类名 `todo-line-through` 是飞书内部实现细节，可能随版本更新变化。如果检测失效，需要先在 OpenCLI 中 inspect 当前页面的实际 DOM 结构。

## 虚拟滚动影响

飞书文档使用虚拟滚动，仅当前视口内的 DOM 节点实际存在于 document 中。滚出视口的 items 无法通过 querySelector 检测。

### 检测流程

```
1. 先 scroll up 到文档顶部
2. 逐段下滚，每段间距约等于一个视口高度（clientHeight）
3. 每段停留 2-3s，等待 SPA 渲染新节点
4. 对当前视口内的所有 task items 执行 detect 代码
5. 记录每个 item 的位置 + checked 状态
6. 去重（同一 item 可能跨视口重复出现）
```

### 降级方案

如果某 item 在多次滚屏后仍无法渲染到 DOM（始终不在视口内）：

- 标记为 `checked: null`
- 输出中附加 `"unchecked_due_to_virtual_scroll": true`
- 最终周报中该项默认留白（`进展____%`），由用户手动补填
