---
name: 联调-本地link与peer
description: 用 pnpm link / pnpmfile / file 协议让消费者本地联调 @nebula/ui，并核对 peer 与 vite external。Use when 本地 link、pnpmfile、peerDependencies、联调组件库。
---

# 联调-本地link与peer

## 何时使用

- 编排步 5：`publishMode=link`
- 发版前要在 apex/microfb 看到真实渲染

## GREEN

1. 库仓：`pnpm build`。
2. 核对 `peerDependencies`：vue、element-plus、echarts、@vueuse/core；**不要**把 peer 放进 dependencies 打进包。
3. 核对 vite lib `external`（含 `@element-plus/icons-vue` 等）。
4. 消费者联调（按仓库已有方式择一）：
   - `.pnpmfile.cjs` 钩子指到本地 nebula-ui
   - 或 `pnpm.overrides` / `file:../nebula-ui`
5. 消费者安装后重启 dev；确认 `import '@nebula/ui/style.css'` 已存在（apex `main.ts` 已有）。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 解析仍走 Artifactory 旧版 | 清 store、重装、查 pnpmfile | 临时 file: 依赖 |
| 运行时报缺 Element Plus | 宿主未装 peer | 在宿主 pnpm add |
| icons 被打包进 umd | external 补 icons | 重建 dist |

## 输出

- `linkMethod`
- `consumerSmokeOk` boolean

## 使用示例

```text
用 .pnpmfile.cjs 把 apex_dev 链到本地 nebula-ui，验证 NeSecretInput。
```
