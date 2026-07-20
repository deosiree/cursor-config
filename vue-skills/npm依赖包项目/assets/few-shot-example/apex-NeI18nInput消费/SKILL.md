# apex NeI18nInput 消费 few-shot

## 宿主

`apex_dev`

## 全局接入（main.ts）

```ts
import NebulaUI from "@nebula/ui"
import "@nebula/ui/style.css"

app.use(NebulaUI as any, {
  i18nInput: {
    currentLanguage: () => useLangStore().lang,
    loadLanguages: () => i18nAPI.getLanguageList().then((res) => res.items || []),
  },
})
```

## 按需引入（页面）

例如 `src/views/system/auditConfig/components/AuditFormDialog.vue`：

```ts
import { NeI18nInput } from "@nebula/ui"
```

模板中使用 `<NeI18nInput ... />`。

## 依赖

`package.json`：`"@nebula/ui": "^1.0.3"`（以仓库当前版本为准）。

## 要点

- 样式必须引 `@nebula/ui/style.css`
- `NeI18nInput` 需要通过插件 options 注入语言加载，否则能力不完整
- 同模式可扩展到 `NeSecretInput` / `NeECharts`
