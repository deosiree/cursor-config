# 消费方 checklist

宿主首次接入 `@nebula/ui`：

1. [ ] `.npmrc` 配置 `@nebula` registry
2. [ ] `pnpm add @nebula/ui`
3. [ ] peer：vue、element-plus、echarts、@vueuse/core 已存在
4. [ ] `import '@nebula/ui/style.css'`
5. [ ] `app.use(NebulaUI, options?)`
6. [ ] 冒烟：模板使用一个导出组件
7. [ ] 若用 NeI18nInput：配置 `i18nInput` options

本地联调未发版包：见 `封装npm依赖包` → `联调-本地link与peer`。
