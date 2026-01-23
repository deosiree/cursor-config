## FloatingToolBox 拖拽与面板定位优化知识库（Vue2 / 浏览器事件）

> 本文以 `FloatingToolBox` 悬浮工具按钮为例，系统总结这次优化中用到的**拖拽实现方式、性能优化思路、交互细节处理**，包括：正确示例、错误示例以及常见坑。

---

## 一、典型问题场景

### 1.1 拖拽卡顿、跟手性差

常见的“天真实现”：

```vue
<template>
  <div
    class="floating-button"
    :style="{
      position: 'fixed',
      left: buttonPosition.x + 'px',
      top: buttonPosition.y + 'px'
    }"
    @mousedown="startDrag"
  >
    ...
  </div>
</template>

<script>
export default {
  data() {
    return {
      buttonPosition: { x: 100, y: 100 },
      isDragging: false,
      dragStartPos: { x: 0, y: 0 },
      dragStartMousePos: { x: 0, y: 0 },
    };
  },
  methods: {
    startDrag(e) {
      this.isDragging = true;
      this.dragStartPos = { ...this.buttonPosition };
      this.dragStartMousePos = { x: e.clientX, y: e.clientY };
      document.addEventListener('mousemove', this.handleDrag);
      document.addEventListener('mouseup', this.stopDrag);
    },
    handleDrag(e) {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.dragStartMousePos.x;
      const deltaY = e.clientY - this.dragStartMousePos.y;
      this.buttonPosition = {
        x: this.dragStartPos.x + deltaX,
        y: this.dragStartPos.y + deltaY,
      };
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener('mousemove', this.handleDrag);
      document.removeEventListener('mouseup', this.stopDrag);
    },
  },
};
</script>
```

**问题点：**

- `mousemove` 触发频率很高，每次都更新 Vue 响应式 `buttonPosition`：
  - 组件重新渲染、computed 重算
  - 样式重算（Recalculate Style）、布局（Layout）、绘制（Paint）频率非常高
- 使用 `left/top` 改变位置，更容易触发布局流程

再叠加下面这种 CSS 写法，拖拽性能会更差：

```css
.floating-button {
  transition: all 0.3s ease; /* 错误示例：all 对拖拽非常不友好 */
}
```

浏览器会尝试对“所有被改变的属性”做过渡，拖拽过程中持续触发动画插值，主线程压力很大。

---

## 二、优化策略与正确示例

### 2.1 核心原则总结

1. **拖拽过程不要频繁触发响应式更新**  
   - move 事件只更新“目标坐标”，真正写回 Vue 响应式和本地存储只在 `pointerup` 时做一次。

2. **用 `requestAnimationFrame` 合帧**  
   - move 事件可能是 100~200Hz，但屏幕刷新一般 60Hz。
   - 用 rAF 把多次 move 合并为一帧一个 DOM 更新。

3. **拖拽过程中用 `transform: translate3d(...)`**  
   - 避免频繁修改 `left/top` 造成 layout。
   - 通常会走合成层（compositor）渲染，流畅度更好。

4. **使用 Pointer Events + Pointer Capture**  
   - `pointerdown / pointermove / pointerup / pointercancel` 统一处理鼠标/触摸/笔。
   - `setPointerCapture(pointerId)` 确保拖动到了元素外边也不会丢事件。

5. **拖拽态禁用 hover/active 中的 transform，避免 transform 冲突**  
   - 否则容易出现缩放 + 平移叠加，导致抖动。

6. **移除 `transition: all`，只对必要属性做过渡**  
   - 比如只对 `box-shadow`、`background` 等非位移属性做过渡。

### 2.2 优化后的拖拽实现示例（简化版）

```vue
<template>
  <div
    ref="floatingButtonRef"
    class="floating-button"
    :class="{ dragging: isDragging }"
    :style="buttonStyle"
    @pointerdown="startDrag"
  >
    ...
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 固定位置：仅在非拖拽态用于定位与持久化
      buttonPosition: { x: 200, y: 300 },

      // 拖拽状态
      isDragging: false,
      dragStartPos: { x: 0, y: 0 },
      dragStartMousePos: { x: 0, y: 0 },
      dragPointerId: null,
      dragTargetPos: { x: 0, y: 0 },
      dragCurrentPos: { x: 0, y: 0 },
      dragRafId: null,
      dragRafPending: false,
    };
  },
  computed: {
    buttonStyle() {
      const style = {
        position: "fixed",
        zIndex: 9999,
        cursor: this.isDragging ? "grabbing" : "grab",
      };

      if (this.buttonPosition.x != null && this.buttonPosition.y != null) {
        style.left = this.buttonPosition.x + "px";
        style.top = this.buttonPosition.y + "px";
      } else {
        style.right = "20px";
        style.bottom = "20px";
      }

      return style;
    },
  },
  methods: {
    startDrag(e) {
      e.preventDefault();
      e.stopPropagation();

      // 只响应鼠标左键
      if (typeof e.button === "number" && e.button !== 0) return;

      // 记录初始状态
      this.isDragging = true;
      this.dragStartPos = { ...this.buttonPosition };
      this.dragStartMousePos = { x: e.clientX, y: e.clientY };
      this.dragCurrentPos = { ...this.buttonPosition };
      this.dragTargetPos = { ...this.buttonPosition };
      this.dragPointerId = e.pointerId ?? null;

      // Pointer capture，避免指针移出元素后丢事件
      const el = e.currentTarget;
      if (el && typeof el.setPointerCapture === "function" && this.dragPointerId != null) {
        try {
          el.setPointerCapture(this.dragPointerId);
        } catch (err) {
          // 某些环境可能会失败，忽略即可
        }
      }

      document.addEventListener("pointermove", this.handleDrag, { passive: true });
      document.addEventListener("pointerup", this.stopDrag, { passive: true });
      document.addEventListener("pointercancel", this.stopDrag, { passive: true });
    },

    handleDrag(e) {
      if (!this.isDragging) return;
      if (this.dragPointerId != null && e.pointerId !== this.dragPointerId) return;

      const deltaX = e.clientX - this.dragStartMousePos.x;
      const deltaY = e.clientY - this.dragStartMousePos.y;

      let newX = this.dragStartPos.x + deltaX;
      let newY = this.dragStartPos.y + deltaY;

      // 边界限制
      const buttonWidth = 50;
      const buttonHeight = 50;
      newX = Math.max(0, Math.min(newX, window.innerWidth - buttonWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - buttonHeight));

      // 仅更新目标位置，合帧写入 DOM
      this.dragTargetPos = { x: newX, y: newY };

      if (!this.dragRafPending) {
        this.dragRafPending = true;
        this.dragRafId = requestAnimationFrame(() => {
          this.dragRafPending = false;
          const btn = this.$refs.floatingButtonRef;
          if (!btn) return;

          const x = this.dragTargetPos.x;
          const y = this.dragTargetPos.y;
          this.dragCurrentPos = { x, y };

          // 注意：这里用的是相对起点的偏移 dx/dy
          const dx = x - this.dragStartPos.x;
          const dy = y - this.dragStartPos.y;
          btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
        });
      }
    },

    stopDrag(e) {
      if (!this.isDragging) return;

      this.isDragging = false;

      if (this.dragRafId) {
        cancelAnimationFrame(this.dragRafId);
        this.dragRafId = null;
      }
      this.dragRafPending = false;

      const finalPos =
        this.dragCurrentPos && typeof this.dragCurrentPos.x === "number"
          ? this.dragCurrentPos
          : this.dragTargetPos;

      // 仅在拖拽结束时写回响应式 + 持久化
      this.buttonPosition = { x: finalPos.x, y: finalPos.y };
      // this.saveButtonPosition() // 如需本地存储

      const btn = this.$refs.floatingButtonRef;
      if (btn) {
        btn.style.transform = "";
      }

      if (e && this.dragPointerId != null && btn && typeof btn.releasePointerCapture === "function") {
        try {
          btn.releasePointerCapture(this.dragPointerId);
        } catch (err) {
          // ignore
        }
      }
      this.dragPointerId = null;

      document.removeEventListener("pointermove", this.handleDrag);
      document.removeEventListener("pointerup", this.stopDrag);
      document.removeEventListener("pointercancel", this.stopDrag);
    },
  },
};
</script>

<style scoped>
.floating-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  /* 正确示例：仅对非位移属性做过渡 */
  transition: box-shadow 0.2s ease, background 0.2s ease;
  user-select: none;
  touch-action: none;
  will-change: transform;
}

.floating-button:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.floating-button:active {
  transform: scale(0.95);
}

.floating-button.dragging {
  cursor: grabbing;
  transition: none;
}

.floating-button.dragging:hover,
.floating-button.dragging:active {
  /* 避免拖拽中的 transform 与 hover/active transform 冲突 */
  transform: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
```

---

## 三、防止“拖完触发点击”的交互问题

### 3.1 错误示例：拖拽结束后误触单击

```js
methods: {
  handleClick() {
    // 用定时器区分单击和双击
    this.clickTimer = setTimeout(() => {
      if (!this.isDragging) {
        this.panelVisible = true; // 打开面板
      }
      this.clickTimer = null;
    }, 200);
  },
  startDrag() {
    this.isDragging = true;
  },
  stopDrag() {
    this.isDragging = false;
  }
}
```

**问题：**

- 浏览器在 `pointerup` / `mouseup` 后会触发一次 `click`。
- `stopDrag` 中 `isDragging` 已经变为 `false`，`click` 进来时条件 `!this.isDragging` 为真，于是把拖拽误判为一次单击 —— 拖完就自动打开面板。

### 3.2 正确示例：用“位移阈值 + 时间窗口”屏蔽拖拽后的点击

```js
export default {
  data() {
    return {
      isDragging: false,
      dragHasMoved: false,
      lastDragEndTime: 0,
      dragStartMousePos: { x: 0, y: 0 },
      clickTimer: null,
    };
  },
  methods: {
    handleClick() {
      // 拖拽结束后 250ms 内的 click 一律忽略
      if (this.lastDragEndTime && Date.now() - this.lastDragEndTime < 250) {
        return;
      }

      this.clickTimer = setTimeout(() => {
        if (!this.isDragging) {
          this.panelVisible = true;
        }
        this.clickTimer = null;
      }, 200);
    },

    startDrag(e) {
      this.isDragging = true;
      this.dragHasMoved = false;
      this.dragStartMousePos = { x: e.clientX, y: e.clientY };
    },

    handleDrag(e) {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.dragStartMousePos.x;
      const deltaY = e.clientY - this.dragStartMousePos.y;

      // 超过一定阈值才视为“真正拖拽”
      if (!this.dragHasMoved && Math.abs(deltaX) + Math.abs(deltaY) > 3) {
        this.dragHasMoved = true;
      }

      // ... 更新拖拽位置（略）
    },

    stopDrag() {
      if (!this.isDragging) return;

      this.isDragging = false;
      if (this.dragHasMoved) {
        this.lastDragEndTime = Date.now();
      }
    },
  },
};
```

**要点：**

- 通过阈值区分“点击误差范围内的轻微移动”和“真实拖拽”。
- 通过时间窗口（如 250ms）屏蔽拖拽刚结束时产生的 click。

---

## 四、确保面板位置永远跟随按钮

### 4.1 常见错误写法

```js
export default {
  data() {
    return {
      panelVisible: false,
      panelStyle: {
        left: "100px",
        top: "100px",
      },
    };
  },
  methods: {
    openPanel() {
      this.panelVisible = true;
      // 只在某一次初始化时计算 panelStyle
      if (!this._inited) {
        const rect = this.$refs.button.getBoundingClientRect();
        this.panelStyle.left = rect.left + "px";
        this.panelStyle.top = rect.top - 200 + "px";
        this._inited = true;
      }
    },
  },
};
```

**问题：**

- 面板位置只算一次，后面按钮被拖拽后，面板不会跟着更新。

### 4.2 正确示例：用 `computed + reflowKey` 强制重算

```vue
<template>
  <div>
    <div
      ref="floatingButtonRef"
      class="floating-button"
      :style="buttonStyle"
      @click="handleClick"
    >
      ...
    </div>

    <div
      v-if="panelVisible"
      class="tool-panel"
      :style="panelStyle"
    >
      ...
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      buttonPosition: { x: null, y: null },
      panelVisible: false,
      panelReflowKey: 0, // 每次打开前自增
    };
  },
  computed: {
    panelStyle() {
      // 显式依赖 panelReflowKey，确保每次打开都会重新计算
      // eslint-disable-next-line no-unused-vars
      const _ = this.panelReflowKey;

      if (!this.$refs.floatingButtonRef) {
        return {};
      }

      const buttonRect = this.$refs.floatingButtonRef.getBoundingClientRect();
      const panelWidth = 150;
      const panelHeight = 200;
      const spacing = 10;

      let left = buttonRect.left;
      let top = buttonRect.top - panelHeight - spacing;

      if (left + panelWidth > window.innerWidth) {
        left = window.innerWidth - panelWidth - 10;
      }
      if (left < 10) {
        left = 10;
      }
      if (top < 10) {
        top = buttonRect.bottom + spacing;
      }

      return {
        position: "fixed",
        left: `${left}px`,
        top: `${top}px`,
        zIndex: 9998,
      };
    },
  },
  methods: {
    handleClick() {
      // 这里只演示打开逻辑，拖拽后的 click 抑制见上一节
      this.panelReflowKey += 1; // 关键：打开前先自增
      this.panelVisible = true;
    },
  },
};
</script>
```

**优点：**

- 每次点击打开时，面板都会基于**按钮当前真实位置**重新计算，避免错位。

---

## 五、常见坑与对照示例

### 5.1 transform 坐标使用错误

**错误示例：直接用绝对坐标做 translate**

```js
// 错误：button 本身已经有 left/top，再用 x/y 做 translate，会产生叠加
btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
```

按钮本身是从 `left/top = (startX, startY)` 渲染的，`translate3d(x,y)` 会在此基础上再平移 `(x,y)`，导致位置翻倍/错位。

**正确示例：使用相对起点偏移 dx/dy**

```js
const dx = x - this.dragStartPos.x;
const dy = y - this.dragStartPos.y;
btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
```

### 5.2 `transition: all` 导致拖拽发粘

**错误示例：**

```css
.floating-button {
  transition: all 0.3s ease;
}
```

**正确示例：**

```css
.floating-button {
  transition: box-shadow 0.2s ease, background 0.2s ease;
}

.floating-button.dragging {
  transition: none;
}
```

### 5.3 hover/active 的 transform 与拖拽 transform 冲突

**错误示例：**

```css
.floating-button:hover {
  transform: scale(1.1);
}

.floating-button:active {
  transform: scale(0.95);
}
```

拖拽中 JS 也在写 `transform: translate3d(...)`，CSS 的 `scale(...)` 会覆盖或叠加，导致抖动/跳变。

**正确示例：拖拽态禁止 transform 冲突**

```css
.floating-button.dragging {
  cursor: grabbing;
  transition: none;
}

.floating-button.dragging:hover,
.floating-button.dragging:active {
  transform: none;
}
```

### 5.4 测试环境中直接 `trigger('pointerdown', { clientX })` 出错

在 jsdom + @vue/test-utils 中，事件对象的一些属性是只读的，直接用 `trigger('pointerdown', { clientX: 100 })` 可能报错：

> TypeError: Cannot set property clientX of #\<MouseEvent> which has only a getter

**解决思路：**

- 在单元测试中直接调用组件实例方法，而不是用 `trigger` 去构造“伪事件对象”覆盖原生事件：

```js
const mockEvent = {
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  clientX: 100,
  clientY: 100,
  pointerId: 1,
  button: 0,
  currentTarget: {
    setPointerCapture: vi.fn(),
  },
};

wrapper.vm.startDrag(mockEvent);
await nextTick();

expect(wrapper.vm.isDragging).toBe(true);
```

---

## 六、小结：可复用的拖拽/浮动面板最佳实践

1. **性能方面**
   - move 中不改响应式，只更新目标坐标。
   - 使用 `requestAnimationFrame` 合帧写 DOM。
   - 拖拽位移用 `transform: translate3d(dx, dy, 0)`。

2. **交互方面**
   - Pointer Events + Pointer Capture，配合 `touch-action: none`。
   - 用位移阈值 + 时间窗口屏蔽拖拽后的 click。
   - 每次打开面板前用 reflowKey 触发位置重算。

3. **样式方面**
   - 避免 `transition: all`，只对非位移属性做过渡。
   - 拖拽态禁止 hover/active 的 transform 冲突。

你之后如果在其他组件里实现悬浮拖拽/浮动工具条，可以直接复用这套模式，并按需裁剪细节（是否需要持久化位置、是否需要面板定位等）。

