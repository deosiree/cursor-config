## DOM 问题易错清单（按问题类型分组，持续补充）

### 1. DOM 元素存在但看不见

- **1.1 忘记检查元素是否被放在视口外**
  - **风险类型**：元素已渲染到 DOM，但 `position: fixed/absolute` + `top/left` 组合导致元素跑出当前视口范围。
  - **典型现象**：组件在某个环境（如容器生产环境）中不显示，但控制台检查发现元素确实存在，且 `display: block`、`opacity: 1` 都正常。
  - **关键成因**：
    - 历史坐标被持久化到 `localStorage`，但恢复时未做边界校验
    - 之前在大分辨率窗口下拖拽保存的位置，在小分辨率窗口下恢复时直接越界
    - 不同环境的 `localStorage` 按 origin 隔离，导致只有特定环境出现历史坐标问题
  - **快速检查**：
    - 在控制台执行：`getComputedStyle(document.querySelector('.floating-tool-box'))`，重点看 `top`、`left`、`position`
    - 如果 `top` 或 `left` 非常大（如 `top: 1012px`），而当前窗口高度只有 `600px`，说明元素在视口外
    - 检查 `localStorage.getItem('floatingToolBoxPosition')` 中存储的坐标是否合理
  - **修复建议**：
    - 在位置恢复逻辑中增加边界检查：`0 <= x <= window.innerWidth - width`、`0 <= y <= window.innerHeight - height`
    - 一旦发现越界，清除 `localStorage` 并回到默认位置
    - 将位置恢复逻辑抽取为通用工具函数（如 `normalizeFloatingPosition`），统一处理边界校验

- **1.2 只看 display/opacity，忽略 position + top/left 组合**
  - **风险类型**：排查时只检查 `display: none` 或 `opacity: 0`，忽略了 `position: fixed` + 超大 `top/left` 的情况。
  - **典型现象**：元素样式显示 `display: block`、`opacity: 1`，但仍然看不见。
  - **快速检查**：
    - 使用 DevTools 的 Elements 面板，直接查看元素的 `position`、`top`、`left`、`z-index`
    - 如果 `position: fixed` 且 `top` 或 `left` 超出当前视口范围，元素就会“存在但看不见”

### 2. 本地和容器环境行为不一致

- **2.1 忽略 localStorage 按 origin 隔离**
  - **风险类型**：不同环境的 `localStorage` 按 origin（协议+域名+端口）隔离，导致历史数据不一致。
  - **典型现象**：
    - 本地开发环境（`localhost:8080`）正常显示
    - 本地生产环境（`localhost:8081`）也正常显示
    - 容器生产环境（`10.17.196.125:18000`）不显示
  - **关键成因**：
    - 容器环境的 `localStorage` 中可能保存了之前某个大分辨率窗口下的坐标
    - 本地环境的 `localStorage` 是干净的或坐标在合理范围内
  - **快速检查**：
    - 对比不同环境中的 `localStorage.getItem('floatingToolBoxPosition')` 内容
    - 确认是否只有某个特定环境的存储中有异常坐标
  - **修复建议**：
    - 在位置恢复时统一做边界校验，避免依赖“某个环境的存储是干净的”这一假设
    - 越界时自动清除存储，保证所有环境行为一致

- **2.2 容器运行窗口高度不同导致历史坐标越界**
  - **风险类型**：容器环境的窗口高度与本地不同，导致历史坐标在小窗口下越界。
  - **典型现象**：按钮在容器环境中 `top: 1012px`，但窗口高度只有 `600px`，按钮跑出视口。
  - **快速检查**：
    - 对比 `window.innerHeight` 在不同环境中的值
    - 检查 `localStorage` 中保存的 `y` 坐标是否超过当前窗口高度
  - **修复建议**：
    - 位置恢复时使用 `window.innerWidth/innerHeight` 动态计算边界，而不是硬编码固定值
    - 越界时清除存储并回到默认位置

### 3. 状态持久化逻辑不健壮

- **3.1 从 localStorage 读出来的值未做类型校验**
  - **风险类型**：直接使用 `JSON.parse` 的结果，未校验 `x`、`y` 是否为有效数字。
  - **典型现象**：存储中可能是 `null`、`undefined`、字符串 `"abc"` 等，直接赋值给组件导致位置异常。
  - **快速检查**：
    - 检查位置恢复逻辑是否使用了 `Number.isFinite(x)` 或类似方法校验
    - 检查是否对 `JSON.parse` 的结果做了 `try-catch` 处理
  - **修复建议**：
    - 使用 `Number()` 转换并配合 `Number.isFinite()` 校验
    - 非法值时清除存储并返回默认位置

- **3.2 恢复时不做边界检查，只在拖拽过程中限制边界**
  - **风险类型**：拖拽时做了边界限制，但组件挂载时从 `localStorage` 恢复位置未做边界检查。
  - **典型现象**：
    - 拖拽时按钮被限制在视口内，正常显示
    - 刷新页面后，按钮恢复到之前某个越界的位置，又看不见了
  - **快速检查**：
    - 检查 `loadButtonPosition` 或类似方法是否只做了 `localStorage.getItem` + `JSON.parse`，没有边界校验
  - **修复建议**：
    - 在位置恢复逻辑中增加边界检查，与拖拽时的边界限制保持一致
    - 越界时清除存储并回到默认位置

### 4. 测试与 mock 问题

- **4.1 组件改为依赖通用工具方法后，测试未同步更新 mock**
  - **风险类型**：组件重构后改为调用通用工具函数（如 `normalizeFloatingPosition`），但测试中仍直接 mock `localStorage`，未 mock 新的工具函数。
  - **典型现象**：测试报错 `TypeError: normalizeFloatingPosition is not a function`。
  - **快速检查**：
    - 检查组件测试中是否 mock 了对应的工具函数
    - 确认 mock 的函数签名是否与真实函数一致
  - **修复建议**：
    - 在组件测试中 mock 工具函数，而不是直接 mock `localStorage`
    - Mock 函数应返回符合测试场景的值（如 `{ x: 200, y: 300 }` 或 `{ x: null, y: null }`）
    - 工具函数的内部逻辑由工具函数的单测覆盖，组件测试只验证调用和返回值应用

- **4.2 单测对极端值的预期与实际业务约定不一致**
  - **风险类型**：单测中认为“坐标等于窗口尺寸”是合法边界，但实际业务约定是“完全越界应清除存储”。
  - **典型现象**：单测报错 `TypeError: actual value must be number or bigint, received "object"`，因为返回了默认位置对象而不是数字。
  - **快速检查**：
    - 检查单测中对边界值的断言是否符合业务约定
    - 确认工具函数在越界时返回的是默认位置对象还是数字
  - **修复建议**：
    - 统一业务约定：一旦坐标超出视口范围（包括等于边界的情况），就清除存储并返回默认位置
    - 单测中的断言应与业务约定保持一致

## 相关文件
- 通用工具函数：`src/utils/domUtils.js` - `normalizeFloatingPosition`
- 组件实现：`src/components/FloatingToolBox/index.vue`
- 测试文件：`tests/unit/utils/domUtils.test.js`、`tests/unit/components/FloatingToolBox.test.js`
- 详细排查步骤：`.cursor/skills/todolist/dom问题排查清单.md`
