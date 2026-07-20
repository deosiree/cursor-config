---
name: 搭建-examples演示站
description: 维护 nebula-ui examples 文档站：页面、demos、Attributes、dev:examples。Use when examples、DemoBlock、组件演示站。
---

# 搭建-examples演示站

## 何时使用

- 新组件或改文档演示

## GREEN

1. 脚本：`pnpm run dev:examples`（`vite.examples.config.ts`）。
2. `examples/demos/{name}/*.vue`：场景拆分；推荐空值+有值对照。
3. `examples/pages/{Name}Doc.vue`：说明 + demo 嵌入 + Attributes 表。
4. 导航注册到 examples 壳。
5. 文案：**用户意图优先**（如「开启浏览器密码提示」），实现细节放 Attributes。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 路由 404 | 补注册 | 对照 NeSecretInputDoc |
| 依赖 EP icons 报错 | examples 的 devDep 已装 `@element-plus/icons-vue` | — |

## 输出

- `docPage`
- `demoFiles[]`

## 使用示例

```text
给 NeSecretInput 加 native-pwd demo 页并挂导航。
```
