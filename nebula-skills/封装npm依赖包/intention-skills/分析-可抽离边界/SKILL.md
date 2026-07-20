---
name: 分析-可抽离边界
description: 判定业务仓组件哪些可进 @nebula/ui、哪些必须留业务壳。Use when 抽离边界、业务壳、PwdField、可复用核。
---

# 分析-可抽离边界

## 何时使用

- 抽取前需要「可抽 / 不可抽 / 部分可抽」结论
- 存在成对组件（通用输入 + 业务校验壳）

## 何时不要使用

- 边界已书面确认，直接实现 → [[编排-组件入库发版]]
- 无业务源、只在库内加组件 → `npm依赖包项目`

## 输入

| 字段 | 说明 |
|---|---|
| `sourceRepo` | 业务仓 |
| `sourceComponentPath` | 主组件路径 |
| `relatedPaths` | 可选：壳/组合组件路径 |

## GREEN 步骤

1. **读源码依赖**：列出 import（store、api、gateway、i18n 业务 key、路由）。
2. **分类**：
   - **可入库**：纯 UI、v-model、与宿主无关的交互（掩码、眼睛、清空）。
   - **留仓**：密码策略、`formRules`、租户/用户 API、登录步骤状态机。
3. **对照先例**：apex/microfb 的 `GuardedSecretInput`（核）vs `PwdField`（壳）。
4. **输出 `extractDecision`**：

```yaml
extractDecision:
  mode: partial # full | none | partial
  intoLib: [组件/职责列表]
  stayInRepo: [组件/职责列表]
  proposedName: NeSecretInput
  risks: []
```

5. **🔴 CHECKPOINT**：把 `extractDecision` 展示给用户，确认后再进入编排。

## 判定规则（可执行）

| 信号 | 结论 |
|---|---|
| 仅依赖 vue / element-plus / @vueuse | 倾向可入库 |
| import `@/api`、`@/gateway`、业务 store | 倾向留仓或拆核 |
| 组件名含 Guarded/Shared 且被多仓复制 | 倾向抽核 |
| 文案强绑定登录/改密流程 | 壳留仓；输入核可抽 |

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 核与壳缠在同一文件 | 列出拆分提案（核 props / 壳 props） | STOP：等人选拆法 |
| 两仓实现不一致 | 做 diff 表，以「更通用」列为核 | 问人以哪仓为 SSOT |
| 完全不可抽 | `mode=none` + 理由 | 输出「仅可在业务仓 examples 演示，不发版」；结束流程 |

## 输出

- `extractDecision`（上表）
- `nextIntention`：确认后为 `编排-组件入库发版`；`none` 则结束

## 使用示例

```text
分析 apex GuardedSecretInput 与 microfb PwdField 边界，
输出哪些进 NeSecretInput、哪些留仓。
```
