---
name: 新建-locale-layout插件
description: 当目标仓尚无 plugins/locale-layout.ts，需侧栏等布局随 i18n locale 切换时使用；从 template/mvp 落地精简插件。
---

# 新建 locale-layout 插件

父级 agent：[`../../SKILL.md`](../../SKILL.md)。典型路径：**microfb 基座**首次接入侧栏 locale 宽度。

## 何时使用

- 无 `src/plugins/locale-layout.ts`
- 需要 `$localeLayout.sidebarWidth.md` 随语言变化
- 当前仅侧栏消费，无需复制 apex 全量 formLabel preset

## 何时不要使用

- 已有 locale-layout → [`../扩展-已有locale-layout侧栏/SKILL.md`](../扩展-已有locale-layout侧栏/SKILL.md)
- 仅需改 i18n JSON 翻译

## 规范样本

| 样本 | 路径 |
|------|------|
| MVP 插件 | [`template/mvp/microfb/.../locale-layout.sidebar.mvp.ts`](../../template/mvp/microfb/src/plugins/locale-layout.sidebar.mvp.ts) |
| MVP 类型 | [`template/mvp/microfb/.../locale-layout.d.ts`](../../template/mvp/microfb/src/types/locale-layout.d.ts) |
| main 片段 | [`template/mvp/microfb/.../main.setup.fragment.ts`](../../template/mvp/microfb/src/main.setup.fragment.ts) |
| after App | [`template/after/microfb/.../App.sidebar.fragment.vue`](../../template/after/microfb/src/App.sidebar.fragment.vue) |

## RED：新建前核对

1. 是否已 `app.use(i18n)`
2. 侧栏容器 class（microfb：`.layout-sider`）
3. 勿整份复制 apex 的 formLabel/queryField（无消费点）

## GREEN：落地步骤

### 1. 复制 MVP 插件

对齐 [`locale-layout.sidebar.mvp.ts`](../../template/mvp/microfb/src/plugins/locale-layout.sidebar.mvp.ts) 到 `src/plugins/locale-layout.ts`。

要点：

- `LayoutSize = 'sm'|'md'|'lg'|'xl'`
- `SIDEBAR_WIDTH_BY_LOCALE` 与 apex **sidebarWidth 数值一致**
- `LocaleLayoutState` 仅 `{ sidebarWidth: Record<LayoutSize, string> }`

### 2. 类型声明

复制 [`locale-layout.d.ts`](../../template/mvp/microfb/src/types/locale-layout.d.ts)。

### 3. 注册插件

```typescript
import { setupLocaleLayout } from "@/plugins/locale-layout";

app.use(i18n);
setupLocaleLayout(app);
```

### 4. 侧栏模板

```vue
:style="
  appStore.sidebar.opened
    ? { width: $localeLayout.sidebarWidth.md, minWidth: $localeLayout.sidebarWidth.md }
    : undefined
"
```

删除 SCSS 中展开态 `width: 200px` 硬编码。

### 5. 链式：SCSS 修复

新建后几乎总是需要 [`../修复-侧栏菜单SCSS撑满/SKILL.md`](../修复-侧栏菜单SCSS撑满/SKILL.md)（去掉 menu 200px 锁宽）。

## 验收

- [ ] 切换 en-US 侧栏展开 260px
- [ ] 折叠 58px（microfb SCSS，与语言无关）
- [ ] `vue-tsc -b` 通过

## 使用示例

```text
microfb 无 locale-layout，参照 apex 侧栏宽度 preset，新建 MVP 插件并注册 main.ts。
```
