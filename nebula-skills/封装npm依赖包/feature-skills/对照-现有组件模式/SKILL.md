---
name: 对照-现有组件模式
description: 对照 nebula-ui 已有 Ne* 组件目录与导出习惯，产出新组件文件清单。Use when 对齐 NeI18nInput、组件目录约定、入库前对照。
---

# 对照-现有组件模式

## 何时使用

- 编排步 1：入库实现前对齐现有模式
- 用户指定「像 NeI18nInput 一样做」

## 输入

| 字段 | 说明 |
|---|---|
| `libRepo` | 默认 nebula-ui |
| `referenceComponent` | 默认 `NeI18nInput` |
| `componentName` | 新建名 |

## GREEN

1. 打开 `src/components/{reference}/`：记录文件角色（`index.vue`、子组件、composable、constants、README）。
2. 打开 `src/index.ts`：确认 default 插件注册数组 + named export。
3. 输出 **新组件文件清单**（必须落地的路径）：

```text
src/components/{componentName}/
  index.vue          # 薄壳
  *.ts               # composable / constants（按复杂度）
  README.md          # 组件用法
```

4. 若参照有 `examples/pages` + `demos/`，记下 examples 侧需新增的路径（交给 [[补齐-examples文档站]]）。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 参照组件不存在 | 改用 `NePagination` / `LetterInput` | 问人指定参照 |
| 参照是单文件无 composable | 简单组件可单 `index.vue`+README | 复杂交互仍强制拆 composable |

## 输出

- `fileManifest[]`
- `exportTouchPoints`: `[src/index.ts, ...]`

## 使用示例

```text
对照 NeI18nInput，为 NeSecretInput 列出应创建的文件。
```
