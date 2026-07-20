---
name: 编排-新组件落地
description: 在组件库内按 taskKind 编排：目录约定→构建peer→examples→宿主接入→发布检查。Use when 库内新组件、改 examples、接入宿主、准备发布。
---

# 编排-新组件落地

## 何时使用

- `libBaseline` 已知或用户跳过分析
- `taskKind` 已明确

## 前置

🔴 **CHECKPOINT**：`taskKind=publish` → 只准备清单，不执行 publish。

## 按 taskKind 裁剪步骤

| taskKind | 步骤（feature） |
|---|---|
| `newComponent` | 约定目录 →（可选构建核对）→ examples |
| `buildPeer` | [[配置-Vite库构建与peer]] |
| `examples` | [[搭建-examples演示站]] |
| `consume` | [[接入-宿主应用消费]] |
| `publish` | [[发布-Artifactory升版]] |
| 全量新组件 | 约定 → 构建核对 → examples →（可选）接入说明 |

跨仓实现+替换不在此编排；转 `封装npm依赖包`。

## 失败分支

| 触发 | 一线 | 兜底 |
|---|---|---|
| 中途发现要抽业务仓 | STOP 转封装 skill | — |
| examples 与实现不同步 | 先改 README/Attributes | 阻塞宣称完成 |

## 输出

```yaml
libOrchestration:
  taskKind: newComponent
  touched: []
  buildOk: true
  publishReady: false
```

## 使用示例

```text
taskKind=newComponent，componentName=NeFoo，在 nebula-ui 落地目录与 examples。
```
