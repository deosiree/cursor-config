# i18n响应式布局SCSS 产出清单

## 扩展-已有 locale-layout

- [ ] `sidebarWidth: Record<LayoutSize, string>` 已写入 preset/state/applyLocaleLayout
- [ ] 模板消费 `$localeLayout.sidebarWidth.md`（展开含 minWidth）
- [ ] 折叠宽仍用 SCSS，未进 preset
- [ ] `useLocaleLayout().sidebarWidth('md')` 已补（apex）
- [ ] menu 内部已撑满（必要时走 SCSS 修复子 skill）

## 新建 locale-layout MVP

- [ ] `src/plugins/locale-layout.ts` 与 template/mvp 对齐（仅 sidebarWidth 时可精简）
- [ ] `locale-layout.d.ts` + `main.ts` 在 `app.use(i18n)` 后注册
- [ ] 未整份复制 apex formLabel preset（无消费点时）
- [ ] 链式完成 SCSS 修复

## SCSS 撑满

- [ ] 删除 `200px !important` 锁宽
- [ ] 展开态 `el-menu { width: 100% }`
- [ ] icon `flex-shrink: 0`；标题 ellipsis
- [ ] zh/en 切换后 icon 与折叠按钮对齐正常

## 验收

- [ ] `vue-tsc` 无新增错误
- [ ] template 样本与业务仓无 drift（见 template/README.md 维护命令）
