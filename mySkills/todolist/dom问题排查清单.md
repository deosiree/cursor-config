# DOM 问题排查清单（悬浮组件位置异常）

## 问题场景
当发现某个悬浮组件（如工具仓按钮）在某个环境（本地/容器/生产）中不显示，但权限和组件代码都正常时，按此清单排查。

## 排查步骤

### 1. 快速定位问题场景
- [ ] 确认问题是否只在某个特定环境出现（本地开发环境 / 本地生产环境 / 容器生产环境）
- [ ] 在浏览器控制台检查组件是否真的渲染了：
  ```js
  document.querySelector('.floating-tool-box')  // 或其他组件选择器
  ```
- [ ] 如果元素存在但看不见，检查其样式：
  ```js
  const el = document.querySelector('.floating-tool-box');
  getComputedStyle(el)  // 重点看 position, top, left, display, opacity
  ```

### 2. 检查权限与渲染条件
- [ ] 确认 `$currentDepartment` 是否存在且包含正确的权限：
  ```js
  const app = document.querySelector('#app').__vue_app__;
  const d = app.config.globalProperties.$currentDepartment;
  [d && d.ops, typeof d?.ops, d?.ops instanceof Set, d?.ops?.has?.('toolBox')]
  ```
- [ ] 检查布局组件是否正确挂载了目标组件（如 `FloatingToolBox`）
- [ ] 确认 `v-if` 条件是否满足（权限判断逻辑是否正确）

### 3. 检查位置与存储
- [ ] 检查 `localStorage` 中是否有历史位置记录：
  ```js
  localStorage.getItem('floatingToolBoxPosition')
  JSON.parse(localStorage.getItem('floatingToolBoxPosition') || 'null')
  ```
- [ ] 验证按钮是否因为坐标越界而跑出视口：
  - 如果 `top` 或 `left` 非常大（如 `top: 1012px`），而当前窗口高度较小，按钮就会在视口外
- [ ] 对比不同环境中的 `localStorage` 内容，确认是否因存储隔离导致行为不一致

### 4. 代码层面检查
- [ ] 确认组件挂载时是否调用了位置恢复逻辑（如 `loadButtonPosition`）
- [ ] 检查位置恢复逻辑是否做了边界校验：
  - 是否检查坐标是否在 `0 <= x <= window.innerWidth - width` 范围内
  - 是否检查坐标是否在 `0 <= y <= window.innerHeight - height` 范围内
- [ ] 确认越界时是否清除了 `localStorage` 并回到默认位置

### 5. 修复与重构
- [ ] 将位置恢复逻辑抽取为通用工具函数（如 `normalizeFloatingPosition`）
- [ ] 在工具函数中统一处理：
  - 从 `localStorage` 读取并解析坐标
  - 校验坐标是否为有效数字
  - 检查坐标是否在视口范围内
  - 越界时清除存储并返回默认位置
- [ ] 组件中只保留调用工具函数的逻辑，不重复实现边界检查

### 6. 测试与验证
- [ ] 为通用工具函数编写单元测试，覆盖：
  - 无存储记录时返回默认位置
  - 合法坐标正常恢复
  - 非法坐标（NaN、null、字符串）清除存储
  - 越界坐标清除存储并返回默认位置
- [ ] 在组件测试中 mock 工具函数，避免重复测试工具函数内部逻辑
- [ ] 在三种环境（开发/本地生产/容器生产）中验证：
  - 按钮拖拽到极端位置后刷新，是否自动回到默认位置
  - 切换用户/部门时，权限判断是否仍然正确
  - 清空 `localStorage` 后行为是否符合预期

## 相关文件
- 通用工具函数：`src/utils/domUtils.js` - `normalizeFloatingPosition`
- 组件实现：`src/components/FloatingToolBox/index.vue`
- 测试文件：`tests/unit/utils/domUtils.test.js`、`tests/unit/components/FloatingToolBox.test.js`
