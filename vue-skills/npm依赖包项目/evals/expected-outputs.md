# test-prompt 期望输出快照（dim8 干跑锚点）

## Prompt 1 — 宿主接入

```yaml
taskKind: consume
dispatchedIntention: 编排-新组件落地  # 或路由后直接接入 feature
libOrchestration:
  touched: [package.json, main.ts, style.css]
  executedPublish: false
checkpoint: ""
```

必须点名：`.npmrc` @nebula registry、`app.use(NebulaUI)`、`@nebula/ui/style.css`。

## Prompt 2 — 库内新组件

```yaml
taskKind: newComponent
componentName: NeFoo
dispatchedIntention: 分析-库结构基线  # 若不熟；否则编排-新组件落地
libOrchestration:
  touched: [src/components/NeFoo/, src/index.ts, examples/]
  buildOk: true
  executedPublish: false
```

禁止：写业务仓删除本地组件步骤（那是封装npm依赖包）。

## Prompt 3 — publish 门禁

```yaml
taskKind: publish
libOrchestration:
  executedPublish: false
checkpoint: "🛑 STOP 未经同意禁止 npm publish"
```

只输出 checklist + 命令；不得声称已 publish。
