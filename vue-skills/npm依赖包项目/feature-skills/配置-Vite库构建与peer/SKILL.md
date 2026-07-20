---
name: 配置-Vite库构建与peer
description: 核对 Vite lib 模式、external、peerDependencies 与 style.css exports。Use when vite lib、peer、external、打包组件库。
---

# 配置-Vite库构建与peer

## 何时使用

- `taskKind=buildPeer` 或新组件 build 失败排查

## GREEN

1. `peerDependencies` 至少覆盖宿主已提供的：`vue`、`element-plus`、`echarts`、`@vueuse/core`。
2. Vite build：`build.lib` 入口 `src/index.ts`；`rollupOptions.external` 含 peer 与 `@element-plus/icons-vue`。
3. `package.json` `exports`：
   - `"."` → js + types
   - `"./style.css"` → css
4. `files`: `["dist"]`；确认 `pnpm build` 产出 umd/es/css/d.ts。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| peer 被打进 bundle | 补 external | 对比构建产物体积 |
| 无 style export | 补 exports 字段 | 宿主改手工引路径（不推荐） |

## 输出

- `peers[]`
- `externals[]`
- `buildOk`

## 使用示例

```text
检查 nebula-ui 的 peer 与 vite external 是否把 icons 外置。
```
