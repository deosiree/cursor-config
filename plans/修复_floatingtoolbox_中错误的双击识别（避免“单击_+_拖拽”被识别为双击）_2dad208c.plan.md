---
name: 修复 FloatingToolBox 中错误的双击识别（避免“单击 + 拖拽”被识别为双击）
overview: ""
todos:
  - id: replace-native-dblclick
    content: 移除 `@dblclick` 并使用自定义双击检测
    status: completed
  - id: update-handleClick
    content: 修改 `handleClick` 为“单击延迟 + 自定义双击检测”，在识别双击前检查拖拽状态
    status: completed
    dependencies:
      - replace-native-dblclick
  - id: run-manual-tests
    content: 在本地浏览器手动测试快速双击、单击+拖拽以及拖拽后点击场景
    status: completed
    dependencies:
      - update-handleClick
---

# 修复 FloatingToolBox 中错误的双击识别（避免“单击 + 拖拽”被识别为双击）

**问题概述**

- 当前 `src/components/FloatingToolBox/index.vue` 在按钮上同时使用了原生 `@click` 和 `@dblclick`，并在 `handleClick` 中用一个延迟定时器区分单击/双击。
- 结果在“单击 + 紧接着点击并拖拽（click + drag）”的情形下，会被浏览器当单击+点击并拖拽，也会被识别为双击，这是错的，双击必须是连续点击作连续两次点击，从而触发 `dblclick`，导致错误地识别为双击。

**修复思路（高层）**

- 不再依赖原生 `dblclick`。用自定义的双击检测（基于点击时间窗口与状态）来判断“连续点击”。
- 在判断双击时加入拖拽保护条件（例如：`isDragging` / `dragHasMoved` / `lastDragEndTime`），确保第二次点击若伴随拖拽则不会当作双击。
- 优点：可以精确控制“连续点击”的语义（必须是连续、无拖拽的点击），并能兼容现有的拖拽防抖（`lastDragEndTime`）逻辑。

**要修改的文件（主要）**

- `src/components/FloatingToolBox/index.vue`
  - 模板：移除或替换 `@dblclick`（避免同时使用 native dblclick）。
  - methods：修改 `handleClick` 实现为“单击延迟 + 自定义双击检测”；保留或合并 `handleDoubleClick` 的面板切换逻辑但只由 `handleClick` 内检测到双击时调用。

**实现要点 / 代码片段（示意）**

- 在 `template` 中删除 `@dblclick="handleDoubleClick"`，仅保留 `@click="handleClick"` 与 `@pointerdown="startDrag"`。
- 修改 `handleClick`（伪代码）:
```javascript
handleClick(event) {
  // 屏蔽拖拽导致的 click
  if (this.lastDragEndTime && Date.now() - this.lastDragEndTime < 250) return;

  // 若此前存在未过期的单击定时器 => 认为是连续点击（双击）
  if (this.clickTimer) {
    clearTimeout(this.clickTimer);
    this.clickTimer = null;

    // 仅在非拖拽场景下识别为双击
    if (!this.isDragging && !this.dragHasMoved) {
      this.handleDoubleClick();
    }
    return;
  }

  // 设置单击定时器：若到期则判定为单击
  this.clickTimer = setTimeout(() => {
    // single click behavior
    this.clickTimer = null;
  }, 200);
}
```

- `handleDoubleClick` 保留现有切换面板逻辑，但新增对最近拖拽的时间检查作为额外保险。

**回归与验证**

- 手工测试场景：
  - 快速连续两次点击：应触发双击行为。
  - 第一次点击，然后点击并拖拽（移动大于阈值）：不应触发双击；拖拽后不要打开面板。
  - 拖拽结束后短时间内点击：仍被 `lastDragEndTime` 屏蔽（与现有逻辑保持一致）。

**实现步骤（可作为 todo，后续我会按步骤实现）：**

- `replace-native-dblclick`：移除模板中的原生 `@dblclick` 并改用自定义检测（in_progress）。
- `update-handleClick`：修改 `handleClick` 实现，按上面示意加入双击检测与拖拽保护（pending, depends on replace-native-dblclick）。
- `run-manual-tests`：在浏览器/本地运行并验证上述三类交互（pending, depends on update-handleClick）。

如果你同意这个方案，我会开始按上面步骤实现并提交修改。