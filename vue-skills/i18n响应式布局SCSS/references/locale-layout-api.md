# locale-layout API 约定

## 插件位置

| 仓库 | 文件 | 说明 |
|------|------|------|
| apex_dev / opsdeck | `src/plugins/locale-layout.ts` | 全量 preset（formLabel、queryField、descriptions、sidebarWidth、tabLabelMaxWidth） |
| microfb | `src/plugins/locale-layout.ts` | **精简版**：仅 `sidebarWidth`（侧栏场景） |

注册：`setupLocaleLayout(app)`，必须在 `app.use(i18n)` **之后**。

## 类型

```typescript
export type LayoutSize = "sm" | "md" | "lg" | "xl";

export interface LocaleLayoutPreset {
  formLabel: Record<LayoutSize, string>;       // el-form :label-width
  queryField: Record<LayoutSize, string>;      // 查询区控件 width
  descriptionsLabel: string;                   // el-descriptions :label-width（单值）
  descriptionsItem: Record<LayoutSize, string>; // el-descriptions-item :width
  sidebarWidth: Record<LayoutSize, string>;     // 侧栏展开 width / minWidth
  tabLabelMaxWidth: Record<LayoutSize, string>; // PageTabShell / SpanByTips Tab 标签 max-width
}
```

新增布局维度时，**优先**使用 `Record<LayoutSize, string>`，与 `formLabel` / `queryField` 同构。

## preset 示例（sidebarWidth）

```typescript
"zh-CN": {
  sidebarWidth: { sm: "180px", md: "210px", lg: "230px", xl: "250px" },
},
"en-US": {
  sidebarWidth: { sm: "220px", md: "260px", lg: "280px", xl: "300px" },
},
```

`md` 对应当前桌面默认展开宽度；语言切换时整组档位一并切换。

## preset 示例（tabLabelMaxWidth）

```typescript
"zh-CN": {
  tabLabelMaxWidth: { sm: "3em", md: "4em", lg: "5em", xl: "6em" },
},
"en-US": {
  tabLabelMaxWidth: { sm: "6em", md: "10em", lg: "14em", xl: "18em" },
},
```

动态长 Tab 名（如根菜单「Management Center」）可按业务加大 en `md`；固定策略 Tab（登录/密码/会话）用较短 em 即可。

## 消费方式

### 模板（推荐）

```vue
<el-form :label-width="$localeLayout.formLabel.lg" />
<el-select :style="{ width: $localeLayout.queryField.md }" />
<el-descriptions-item :width="$localeLayout.descriptionsItem.md" />

<!-- 侧栏展开 -->
<div
  :style="{
    width: $localeLayout.sidebarWidth.md,
    minWidth: $localeLayout.sidebarWidth.md,
  }"
/>
```

### PageTabShell

```vue
<!-- 有 #tabLabelExtra 齿轮 -->
<PageTabShell
  :show-tab-actions="true"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
/>

<!-- 无 Tab 操作（安全配置） -->
<PageTabShell
  :show-tab-actions="false"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
/>
```

`showTabActions=true` 时组件项总宽默认 `calc(tabLabelMaxWidth + 3.5rem)`，见 `PageTabShell/index.vue`。

### 脚本（apex）

```typescript
const { sidebarWidth, formLabelWidth, tabLabelMaxWidth } = useLocaleLayout();
// tabLabelMaxWidth('md') → ComputedRef<string>
```

### 全局类型

`src/types/locale-layout.d.ts` 声明 `$localeLayout: LocaleLayoutState`。

## 同步机制

```typescript
watch(() => i18n.global.locale.value, () => applyLocaleLayout(state, locale));
```

`Object.assign` 更新各 `Record<LayoutSize, string>` 字段，保持 reactive 引用不变。

## apex 全量 vs microfb 精简

| | apex | microfb |
|---|------|---------|
| formLabel 等 | 有，页面已消费 | **不复制**（无消费点） |
| sidebarWidth | preset 一节 | 唯一 state 字段 |
| useLocaleLayout | 有 composable | 模板直接用 `$localeLayout` 即可 |
