# DOM 工具函数检查与改造 Skill

## Skill 目的

- 当你**遇到 DOM 相关工具函数变更后引起组件显示异常或测试大量报错**时，帮助你：
  - 快速定位问题（元素存在但看不见、位置越界、存储异常等）
  - 按规范拆分职责（组件 vs 工具函数）
  - 设计清晰的工具函数接口
  - 编写完整的测试用例
  - 在多环境中验证修复效果

## 如何触发（对 Cursor 说）

- 推荐用法：
  - `@dom-utils-check 悬浮按钮在容器环境不显示，帮我检查一下是不是位置越界问题`
  - `@dom-utils-check 工具函数改了之后测试全挂了，帮我看看怎么修复`
  - `@dom-utils-check 这个位置恢复逻辑应该怎么重构，让它更健壮`

> Skill 本身会**分析和定位问题，并给出重构建议**，如需真正修改代码，由你再明确下一个指令（例如“现在开始帮我重构这个工具函数”）。

## 分析步骤

### 1. 快速现场确认（只读）

- **检查组件是否真的渲染了**：
  ```js
  document.querySelector('.floating-tool-box')  // 或其他组件选择器
  ```
  - 如果返回 `null`：说明组件根本没渲染，可能是权限问题或 `v-if` 条件不满足
  - 如果返回元素：继续检查样式

- **如果元素存在但看不见，检查样式**：
  ```js
  const el = document.querySelector('.floating-tool-box');
  getComputedStyle(el)  // 重点看 position, top, left, display, opacity
  ```
  - 如果 `display: none` 或 `opacity: 0`：可能是权限或状态控制问题
  - 如果 `position: fixed` 且 `top` 或 `left` 非常大（如 `top: 1012px`）：可能是位置越界问题

- **检查持久化存储**：
  ```js
  localStorage.getItem('floatingToolBoxPosition')
  JSON.parse(localStorage.getItem('floatingToolBoxPosition') || 'null')
  ```
  - 如果存储中有坐标，但坐标超出当前视口范围：说明恢复时未做边界检查

- **检查权限与渲染条件**：
  ```js
  const app = document.querySelector('#app').__vue_app__;
  const d = app.config.globalProperties.$currentDepartment;
  [d && d.ops, typeof d?.ops, d?.ops instanceof Set, d?.ops?.has?.('toolBox')]
  ```
  - 如果权限正常但组件不显示：可能是位置问题，不是权限问题

### 2. 拆分职责：组件 vs 工具函数

- **组件职责**：
  - 什么时候调用工具函数（如 `mounted` 时调用 `loadButtonPosition`）
  - 如何把返回值应用到样式或数据（如 `this.buttonPosition = pos`）
  - 不负责：解析 `localStorage`、校验坐标、处理边界

- **工具函数职责**：
  - 从 `localStorage` 读取并解析坐标
  - 校验坐标是否为有效数字（`Number.isFinite`）
  - 检查坐标是否在视口范围内（`0 <= x <= window.innerWidth - width`）
  - 越界时清除存储并返回默认位置
  - 统一处理所有边界情况和异常情况

- **判断标准**：
  - 如果组件中有大量 `localStorage.getItem`、`JSON.parse`、边界检查逻辑：应该抽取到工具函数
  - 如果多个组件都有类似的位置恢复逻辑：应该抽取为通用工具函数

### 3. 为 DOM 工具函数设计清晰的输入输出

- **函数签名建议**：
  ```js
  /**
   * 从 localStorage 恢复悬浮组件位置
   * @param {string} storageKey - localStorage 键名
   * @param {{x: number|null, y: number|null}} defaultPosition - 默认位置
   * @param {{width: number, height: number}} size - 组件自身宽高
   * @returns {{x: number|null, y: number|null}} - 恢复后的位置或默认位置
   */
  export function normalizeFloatingPosition(storageKey, defaultPosition, size)
  ```

- **输入参数明确**：
  - `storageKey`：存储键名，便于复用（如 `'floatingToolBoxPosition'`）
  - `defaultPosition`：默认位置，当无存储或越界时返回（如 `{ x: null, y: null }`）
  - `size`：组件尺寸，用于计算边界（如 `{ width: 50, height: 50 }`）

- **返回值统一**：
  - 始终返回 `{ x, y }` 格式的对象
  - `x`、`y` 可能是数字（合法坐标）或 `null`（使用默认位置）
  - 出错或越界时返回 `defaultPosition`，并清除 `localStorage`

- **窗口尺寸来源**：
  - 使用 `window.innerWidth`、`window.innerHeight` 动态获取当前视口大小
  - 不要硬编码固定值，因为不同环境窗口大小可能不同

### 4. 先写 / 补工具层单测

- **覆盖场景**：
  - ✅ 无存储记录时返回默认位置
  - ✅ 合法坐标正常恢复（在视口范围内）
  - ✅ 非法坐标（`NaN`、`null`、字符串）清除存储并返回默认位置
  - ✅ 越界坐标（超出视口范围）清除存储并返回默认位置
  - ✅ 边界坐标（等于窗口尺寸）按业务约定处理（通常视为越界）
  - ✅ JSON 解析异常时清除存储并返回默认位置

- **测试技巧**：
  - Mock `window.innerWidth`、`window.innerHeight` 模拟不同窗口大小
  - Mock `localStorage` 模拟不同存储状态
  - 使用纯函数思路验证逻辑正确性，不依赖 DOM 环境

- **示例测试结构**：
  ```js
  describe('normalizeFloatingPosition', () => {
    beforeEach(() => {
      // Mock window.innerWidth/innerHeight
      // Mock localStorage
    })

    it('无存储记录时返回默认位置', () => {
      // ...
    })

    it('合法坐标正常恢复', () => {
      // ...
    })

    it('越界坐标清除存储并返回默认位置', () => {
      // ...
    })
  })
  ```

### 5. 再适配组件层测试

- **Mock 策略**：
  - 在组件测试中 **mock 对应的工具函数**，而不是重复实现逻辑
  - Mock 函数应保持签名一致，只返回适合测试场景的值
  - 例如：`normalizeFloatingPosition` 返回固定 `{ x: 200, y: 300 }` 或 `{ x: null, y: null }`

- **组件测试只验证**：
  - ✅ 是否正确调用工具函数（如 `loadButtonPosition` 中调用了 `normalizeFloatingPosition`）
  - ✅ 是否把返回值正确写入自身状态（如 `this.buttonPosition = pos`）
  - ✅ 组件渲染是否正常（如按钮是否显示、样式是否正确）
  - ❌ 不直接验证工具函数内部边界细节（那是 utils 单测的责任）

- **示例 Mock**：
  ```js
  vi.mock('@/utils/domUtils', () => ({
    normalizeFloatingPosition: vi.fn((storageKey, defaultPosition, size) => {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const pos = JSON.parse(saved);
        return { x: pos.x, y: pos.y };
      }
      return defaultPosition;
    })
  }))
  ```

### 6. 最后做多环境验证

- **验证场景**：
  - ✅ 在不同分辨率窗口下，拖拽到极端位置后刷新，按钮是否自动回到默认位置
  - ✅ 切换用户/部门时，权限判断是否仍然正确（组件是否正常显示/隐藏）
  - ✅ 清空 `localStorage` 后行为是否符合预期（按钮回到默认位置）
  - ✅ 三种环境（开发/本地生产/容器生产）行为是否一致

- **验证方法**：
  - 在浏览器控制台手动设置异常坐标：`localStorage.setItem('floatingToolBoxPosition', JSON.stringify({ x: 0, y: 2000 }))`
  - 刷新页面，检查按钮是否自动回到默认位置
  - 检查 `localStorage.getItem('floatingToolBoxPosition')` 是否被清除

## 输出要求

- **问题定位**：
  - 给出问题类型（位置越界 / 权限异常 / 存储异常等）
  - 给出具体检查命令和预期结果
  - 给出可能的原因分析

- **重构建议**：
  - 给出工具函数的设计方案（函数签名、输入输出、边界处理逻辑）
  - 给出组件层的改造建议（如何调用工具函数、如何应用返回值）
  - 给出测试策略（工具函数单测覆盖哪些场景、组件测试如何 mock）

- **如需真正修改代码**：
  - 由你再明确下一个指令（例如“现在开始帮我重构这个工具函数”）
  - 或直接说“实现”，我会按建议方案自动修改代码

## 相关文件

- 排查清单：`.cursor/skills/todolist/dom问题排查清单.md`
- 易错清单：`.cursor/skills/todolist/dom问题易错清单.md`
- 通用工具函数示例：`src/utils/domUtils.js` - `normalizeFloatingPosition`
- 组件实现示例：`src/components/FloatingToolBox/index.vue`
- 测试示例：`tests/unit/utils/domUtils.test.js`、`tests/unit/components/FloatingToolBox.test.js`
