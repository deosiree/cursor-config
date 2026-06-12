---
name: 扩展-已有locale-layout侧栏
description: 当目标仓已有 plugins/locale-layout.ts（含 formLabel 等），需新增 sidebarWidth 等 Record<LayoutSize> 布局维度并在侧栏消费时使用。
---

# 扩展-已有 locale-layout 侧栏

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点负责 **在已有 preset 上扩展字段**，典型为 apex_dev 增加 `sidebarWidth`。

## 何时使用

- 存在 [`src/plugins/locale-layout.ts`](../../template/after/apex-dev/src/plugins/locale-layout.sidebar.fragment.ts) 且已有 `formLabel` / `queryField`
- 需侧栏（或其它区域）宽度随 **语言 + 档位** 变化
- 独立运行 LeftLayout 或类似侧栏布局

## 何时不要使用

- 仓库无 locale-layout → [`../新建-locale-layout插件/SKILL.md`](../新建-locale-layout插件/SKILL.md)
- 仅 menu 内部 200px 锁宽 → [`../修复-侧栏菜单SCSS撑满/SKILL.md`](../修复-侧栏菜单SCSS撑满/SKILL.md)
- qiankun 子应用无侧栏（仅改表单 label）→ 只改 preset 字段即可，不必动 LeftLayout

## 规范样本

| 样本 | 路径 |
|------|------|
| before preset | [`template/before/apex-dev/.../locale-layout.sidebar.fragment.ts`](../../template/before/apex-dev/src/plugins/locale-layout.sidebar.fragment.ts) |
| after preset | [`template/after/apex-dev/.../locale-layout.sidebar.fragment.ts`](../../template/after/apex-dev/src/plugins/locale-layout.sidebar.fragment.ts) |
| after LeftLayout | [`template/after/apex-dev/.../LeftLayout.sidebar.fragment.vue`](../../template/after/apex-dev/src/layouts/views/LeftLayout.sidebar.fragment.vue) |
| after composable | [`template/after/apex-dev/.../useLocaleLayout.sidebar.fragment.ts`](../../template/after/apex-dev/src/composables/useLocaleLayout.sidebar.fragment.ts) |

API 约定：[`references/locale-layout-api.md`](../../references/locale-layout-api.md)

## RED：扩展前核对

1. `LocaleLayoutPreset` / `LocaleLayoutState` 是否已有同名字段
2. 新字段是否为 `Record<LayoutSize, string>`（非单字符串）
3. 折叠宽度是否误放进 preset（应走 SCSS，见 [`anti-patterns.md`](../../references/anti-patterns.md)）

## GREEN：落地步骤

### 1. 扩展 preset

在 `LOCALE_LAYOUT_PRESETS` 各 locale 增加 `sidebarWidth` 四档，例如 zh-CN：

```typescript
sidebarWidth: { sm: "180px", md: "210px", lg: "230px", xl: "250px" },
```

`createEmptyLayoutState` / `applyLocaleLayout` 增加：

```typescript
sidebarWidth: { ...preset.sidebarWidth },
Object.assign(state.sidebarWidth, preset.sidebarWidth);
```

### 2. 侧栏模板消费 `.md`

```vue
:style="
  isSidebarOpen
    ? { width: $localeLayout.sidebarWidth.md, minWidth: $localeLayout.sidebarWidth.md }
    : undefined
"
```

删除展开态 SCSS 固定 `width: $sidebar-width`；**保留** `&--collapsed { width: $sidebar-width-collapsed }`。

### 3. composable（可选）

在 `useLocaleLayout.ts` 增加 `sidebarWidth(size = 'md')`，与 `queryFieldWidth` 同构。

### 4. 类型注释

更新 `src/types/locale-layout.d.ts` 注释。

### 5. SCSS 撑满

若侧栏变宽后 menu 仍窄，继续委派 **修复-侧栏菜单SCSS撑满**。

## 验收

- [ ] `$localeLayout.sidebarWidth.md` 随语言切换（zh 210 → en 260）
- [ ] 折叠仍为 SCSS 常量宽
- [ ] `vue-tsc --noEmit` 无新增错误

## 使用示例

```text
apex_dev 已有 locale-layout，给 LeftLayout 加 sidebarWidth 四档，模板消费 .md。
```
