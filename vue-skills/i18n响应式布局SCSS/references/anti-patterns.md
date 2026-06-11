# 反模式清单

## 1. 折叠宽度按语言分 preset

**错误**：`sidebarWidth.collapsed` 或 per-locale 折叠 px。

**原因**：折叠态只显示图标，与文案长度无关。

**正确**：展开宽走 `$localeLayout.sidebarWidth.md`；折叠宽走 SCSS `$sidebar-width-collapsed` / `layout-sider--collapsed`。

## 2. 只改侧栏容器，不改内部 menu

**症状**：切换 en-US 后容器变宽，但 icon 裁切、折叠按钮不右移。

**原因**：`menu.scss` 仍锁 `width: 200px !important` 于 `.el-sub-menu__title`；或 `el-menu` 默认 200px。

**正确**：见 [`feature-skills/修复-侧栏菜单SCSS撑满`](../feature-skills/修复-侧栏菜单SCSS撑满/SKILL.md)。

## 3. sidebarWidth 用单字符串而非 Record

**错误**：`sidebarWidth: "260px"`。

**正确**：`sidebarWidth: { sm: "...", md: "...", lg: "...", xl: "..." }`，消费 `.md`。

## 4. microfb 整份复制 apex preset

**错误**：复制 formLabel/queryField/descriptions 但全仓无 `$localeLayout.formLabel` 消费。

**正确**：MVP 仅 `sidebarWidth`；待有表单页接入再扩展或共享包。

## 5. setupLocaleLayout 顺序错误

**错误**：在 `app.use(i18n)` 之前注册。

**正确**：`app.use(i18n)` → `setupLocaleLayout(app)` → `useLangStore().init()`（microfb）。

## 6. 展开/折叠共用 inline width

**错误**：折叠态仍绑 `$localeLayout.sidebarWidth.md`。

**正确**：`:style` 仅在展开时设置；折叠用 class + SCSS 固定窄宽。

## 7. 忘记 minWidth（flex 侧栏）

**症状**：flex 布局下侧栏被压缩。

**正确**：展开时同时设 `width` 与 `minWidth` 为同一 preset 值。
