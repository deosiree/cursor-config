---
name: 分析-库结构基线
description: 读取组件库 package.json、exports、src/index 与现有组件目录，输出结构地图。Use when nebula-ui 基线、exports、组件列表盘点。
---

# 分析-库结构基线

## 何时使用

- 编排前不熟悉库
- 排查「导出了但宿主没有」类问题的前置

## GREEN

1. 读 `package.json`：`name`、`version`、`exports`、`peerDependencies`、`publishConfig`、scripts（`build`、`dev:examples`、`release`）。
2. 读 `src/index.ts`：插件注册列表 + named exports。
3. 列 `src/components/*` 目录名。
4. 若存在 `examples/`，记入口与页面命名习惯。
5. 输出：

```yaml
libBaseline:
  packageName: "@nebula/ui"
  version: "1.0.4"
  components: [NeECharts, NePagination, ...]
  exports: [".", "./style.css"]
  peers: [vue, element-plus, echarts, "@vueuse/core"]
  examples: true
```

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 无 src/index.ts | 搜 main 入口字段 | 问人 |
| exports 与 files 不一致 | 记入 risks | 编排时修 |

## 输出

- `libBaseline`
- `risks[]`
- `nextIntention`：通常 `编排-新组件落地`

## 使用示例

```text
分析 nebula-ui 当前导出了哪些组件、peer 是什么。
```
