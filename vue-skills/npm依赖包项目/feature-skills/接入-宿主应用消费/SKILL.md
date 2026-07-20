---
name: 接入-宿主应用消费
description: 在 Vue 宿主安装 @nebula/ui，全局注册并引入样式，或按需 import 组件。Use when apex 接入、app.use NebulaUI、style.css、按需引入。
---

# 接入-宿主应用消费

## 何时使用

- `taskKind=consume`
- 新仓首次依赖 `@nebula/ui`

## GREEN（apex 真样本）

1. `.npmrc`：`@nebula:registry=http://10.17.196.25:28081/artifactory/api/npm/platform-npm-dev-local/`
2. `pnpm add @nebula/ui`；确保 peer 已装。
3. `main.ts`：

```ts
import NebulaUI from "@nebula/ui"
import "@nebula/ui/style.css"
app.use(NebulaUI, { /* 可选 i18nInput 等 */ })
```

4. 按需：`import { NeI18nInput } from "@nebula/ui"`（见告警/审计表单）。
5. 冒烟：模板使用一个已导出组件。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 401 registry | 查 npmrc / 网络 | file: 本地包 |
| 有组件无样式 | 补 style.css | 查 exports |
| i18n 输入无语言列表 | 传 `i18nInput.loadLanguages` | 读 nebula-ui config |

## 输出

- `consumerWired` boolean
- `registrationMode`: global \| named

## 使用示例

```text
说明 apex_dev 如何已经接入 @nebula/ui，并给出 opsdeck 首次接入步骤。
```
