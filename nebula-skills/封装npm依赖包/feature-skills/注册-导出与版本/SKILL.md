---
name: 注册-导出与版本
description: 把新组件挂到 nebula-ui 插件与 named export，并 bump version、写 CHANGELOG。Use when 导出组件、升版、CHANGELOG、src/index.ts。
---

# 注册-导出与版本

## 何时使用

- 编排步 3：组件实现已可编译

## GREEN

1. 编辑 `src/index.ts`（及若有的 `components/index.ts`）：
   - import 组件
   - 加入 `components` 数组（全局注册）
   - `export { ... }` named export
2. `package.json` version 按 semver bump（新组件功能 → 至少 patch 或 minor，与仓库习惯一致）。
3. `CHANGELOG.md` 增加条目：组件名 + 一句话能力。
4. 跑 `pnpm build`，确认 `dist` 与类型声明包含新导出。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 全局有、按需 import 没有 | 补 named export | 查 vite-plugin-dts 入口 |
| build 失败缺类型 | 补 props 类型 / 导出 type | 对照 NeI18nInput 的 type export |
| 忘改 version | 阻断编排，先 bump 再继续 | — |

## 输出

- `version`
- `exportNames[]`
- `buildOk` boolean

## 使用示例

```text
注册 NeSecretInput 到 @nebula/ui，version 升到 1.0.4，写 CHANGELOG。
```
