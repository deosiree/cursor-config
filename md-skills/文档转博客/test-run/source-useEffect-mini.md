# useEffect 与依赖数组（技术说明摘录）

## 1. 什么是副作用

React 组件渲染 UI。请求接口、订阅事件、改 document.title 属于「渲染之外」的工作，统称副作用。

## 2. useEffect 的作用

在函数组件里用 `useEffect(fn, deps)`：本轮 DOM 更新后执行 `fn`。清理逻辑写在 `fn` 返回的函数里。

## 3. 依赖数组

- 不写第二个参数：每次渲染后都执行（易误用）。
- `[]`：仅挂载后执行一次。
- `[a, b]`：当 `a` 或 `b` 变化时执行。

## 4. 常见错误

在 effect 里 `setState` 且把该 state 放进 deps，会导致无限重渲染。

## 5. Strict Mode

开发环境可能双调用 effect，用于暴露缺少清理的订阅；生产环境通常单次。
