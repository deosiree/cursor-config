---
name: 约定-目录与命名导出
description: 约定 Ne 前缀组件目录、index.vue 与 src/index.ts 命名导出。Use when 组件命名、目录结构、named export。
---

# 约定-目录与命名导出

## 何时使用

- 库内新建组件第一步

## 规则（可执行）

1. 目录：`src/components/{ComponentName}/`，名用 PascalCase，对外 `Ne` 前缀（如 `NeSecretInput`）。
2. 入口：`index.vue`；复杂逻辑拆 `use*.ts`、`constants.ts`。
3. 组件内 `name` / `__name` 与全局注册名一致。
4. `src/index.ts`：加入 components 数组 + `export { ComponentName }`。
5. 组件旁 `README.md`：用法 + Props 表。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 名称无 Ne 前缀 | 重命名对齐库 | 用户书面豁免 |
| 只改 dist 不改源 | 禁止；改 src 再 build | — |

## 输出

- `componentDir`
- `exportName`

## 使用示例

```text
为 NeFoo 选定目录与导出符号。
```
