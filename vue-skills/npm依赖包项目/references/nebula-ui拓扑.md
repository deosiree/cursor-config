# nebula-ui 拓扑

```text
nebula-ui/
  package.json              # @nebula/ui；peer；publishConfig；dev:examples
  vite.config.ts            # lib build
  vite.examples.config.ts   # 文档站
  src/
    index.ts                # 插件 + named export
    components/
      NeI18nInput/
      NeSecretInput/
      ECharts/ Pagination/ LetterInput/ ...
  examples/
    pages/                  # *Doc.vue
    demos/                  # 场景 demo
  dist/                     # 发布物
```

链路：实现 → index 导出 → build →（examples 验证）→ Artifactory → 宿主 `pnpm add` + `app.use` + `style.css`。
