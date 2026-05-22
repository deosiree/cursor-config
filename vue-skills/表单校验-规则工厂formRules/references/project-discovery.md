# 项目发现（跨仓库）

实施前先写入当轮上下文：`resolvedRepoRoot`、`rulesModule`、`messageStrategy`。

## 1. 解析仓库根

从 `componentPath` 向上查找，命中任一即停：

- `package.json`
- `pnpm-workspace.yaml`

`repoRoot` + `moduleHint` 时：在 `repoRoot` 下 `glob` `**/*Form*.vue`、`**/*Dialog*.vue`，结合 hint 关键词过滤；**多文件命中必须暂停确认**。

## 2. 发现 rules 模块

默认搜索顺序：

1. 用户显式 `rulesModule`
2. `**/formRules.ts`
3. `**/validators/form*.ts`
4. `**/utils/*Rules.ts`

读取文件头 import，确认是否为 Element Plus `FormItemRule` 风格。

## 3. UI 框架

- `element-plus` 依赖或 `@/components` 下 `el-form` → 按 Element Plus 规则形态实施
- 其它 UI 库 → 走 **编排-未知规则MVP与落地**，调研该库校验 API

## 4. 路径别名

从 `tsconfig.json` / `vite.config` 读取 `@` 指向，页面 import 与单测 import 保持一致。

## 5. 错误消息策略（非 i18n 任务）

探测 `rulesModule` 是否：

| 策略 | 判定 | 实施 |
|------|------|------|
| `i18nKey` | 存在 `i18n.global.t` 或 `useI18n` | validator 内 `fail("稳定中文key")`，**不**改 locale 文件 |
| `plainText` | 无 i18n | `throw new Error("稳定中文文案")` |

无论哪种，新建 key/文案须 **≤12 个汉字**（表单项旁展示上限）。
