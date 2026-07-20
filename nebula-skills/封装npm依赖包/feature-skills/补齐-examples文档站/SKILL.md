---
name: 补齐-examples文档站
description: 为新组件补齐 nebula-ui examples 演示站页面、demos 与 Attributes 表。Use when dev:examples、DemoBlock、组件文档站。
---

# 补齐-examples文档站

## 何时使用

- 编排步 4：导出完成后补文档站

## GREEN

1. 确认脚本：`package.json` → `"dev:examples": "vite --config vite.examples.config.ts"`。
2. 新增 `examples/demos/{kebab}/`：每场景一文件；**推荐每行两个字段**（空值 + 有值）便于对照。
3. 新增 `examples/pages/{Component}Doc.vue`：侧栏可导航、Attributes 表、与组件 README 意图一致（标题写用户意图，不写实现黑话）。
4. 把路由/菜单项挂到 examples 入口（现有 App 导航约定）。
5. 跑 `pnpm run dev:examples`，人工点开新页。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 演示站起不来 | 查 vite.examples.config、vue-router devDep | 对照已有 NeI18nInput 页 |
| 文档写「原生密码」用户听不懂 | 改成「开启浏览器密码提示」 | 与组件 README 统一 |
| demo 只有空值 | 补 filled 对照 | — |

## 输出

- `examplePaths[]`
- `devExamplesOk` boolean

## 使用示例

```text
为 NeSecretInput 补 examples：基础、native-pwd、无眼睛、无清空、禁用。
```
