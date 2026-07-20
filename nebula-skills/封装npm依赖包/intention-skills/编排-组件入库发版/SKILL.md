---
name: 编排-组件入库发版
description: 端到端编排：库内实现→导出版本→examples→link/发版→消费者替换。Use when 组件入库、@nebula/ui 发版、本地 link、升版替换。
---

# 编排-组件入库发版

## 何时使用

- `extractDecision` 已确认（或用户明确跳过分析）
- 需要从实现走到消费者可用

## 何时不要使用

- 边界未确认 → 先 [[分析-可抽离边界]]
- 只改 Vite peer / examples 结构、无业务抽取 → `npm依赖包项目`

## 前置

- `componentName`、`libRepo`（默认 nebula-ui）
- `publishMode`：`link`（默认）或 `artifactory`
- `consumers[]` 可选

🔴 **CHECKPOINT · STOP**：跨 ≥2 业务仓替换时，先确认 surface=`cross-mfe` 或双 surface，禁止静默双仓大改。

## GREEN（固定顺序）

每步调用 **一个** feature；步失败按该 feature 的 fallback，不跳步假装完成。

| 步 | feature | 完成标准 |
|---|---|---|
| 1 | [[对照-现有组件模式]] | 目录/文件清单对齐 NeI18nInput 或指定参照 |
| 2 | [[实现-薄壳双分支组件]] | 组件可编译；API 无业务依赖 |
| 3 | [[注册-导出与版本]] | index 导出 + version/CHANGELOG |
| 4 | [[补齐-examples文档站]] | `dev:examples` 可打开该组件页 |
| 5 | [[联调-本地link与peer]] | 至少一消费者 link 可渲染（link 模式） |
| 6 | [[替换-消费者引用]] | 若 `consumers` 非空：删本地核、改 import |

`publishMode=artifactory` 时：步 5 改为 build + publish（**不自动 publish**，列出命令等人执行），再步 6 bump 版本。

## 失败分支

| 步失败 | 一线 | 兜底 |
|---|---|---|
| 步 2 API 渗入业务 | 回 [[分析-可抽离边界]] 重切 | STOP |
| 步 5 link 失败 | 修 pnpmfile / file: | 允许先合库仓，消费者另开 story |
| 步 6 消费者仍引用旧路径 | grep 旧组件名清干净 | 列残留清单给人 |

## 输出

```yaml
orchestrationResult:
  componentName: NeSecretInput
  libPaths: []
  version: 1.0.4
  examplesOk: true
  publishMode: link
  consumersUpdated: []
  leftoverLocalRefs: []
```

## 使用示例

```text
extractDecision 已确认：核进 NeSecretInput，PwdField 留仓。
使用 $编排-组件入库发版，publishMode=link，consumers=[apex_dev]。
```
