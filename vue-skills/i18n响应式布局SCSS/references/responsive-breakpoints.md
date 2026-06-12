# 响应式档位规范（本项目约定）

## 声明

- **全球没有统一的断点像素标准**；Bootstrap、Tailwind、Element Plus 各自略有差异。
- 本项目使用 **Element Plus / Element UI 生态**，并参照 **Bootstrap 五档语义**（xs / sm / md / lg / xl）组织 `locale-layout` preset。
- 断点数值以 **本仓库 preset + 后续 breakpoint composable** 为准，不要死记某一框架的 px。

## 档位对照（参考）

| 档位 | 语义 | Bootstrap 5 常见 | Element Plus 常见 | 本项目 `LayoutSize` |
|------|------|------------------|---------------------|---------------------|
| xs | 超小屏 / 手机竖屏 | &lt;576px | — | **未纳入 preset**（与 apex 现有 sm 起一致，可后续扩展） |
| sm | 小屏 | ≥576px | — | `sm` |
| md | 中屏 / 平板 | ≥768px | ≥768px | **`md`（当前默认消费档位）** |
| lg | 大屏 / 桌面 | ≥992px | ≥992px | `lg` |
| xl | 超大屏 | ≥1200px | ≥1200px | `xl` |

### 其他框架（仅供对照，非本项目真源）

| 框架 | sm | md | lg | xl | 2xl/xxl |
|------|----|----|----|----|---------|
| Tailwind 默认 | 640px | 768px | 1024px | 1280px | 1536px |
| Bootstrap 5 | 576px | 768px | 992px | 1200px | 1400px |

## 本项目当前用法

1. **按语言切换 preset**：`i18n.global.locale` 变化 → `applyLocaleLayout` 写入 `$localeLayout`。
2. **按档位消费尺寸**：模板写 `$localeLayout.formLabel.md`、`$localeLayout.sidebarWidth.md` 等。
3. **尚未接入 `@media`**：暂不按视口自动切换 sm/lg/xl；档位结构是为后续 `useBreakpoint → LayoutSize` 预留。
4. **折叠侧栏宽度**：与语言、档位无关，走 SCSS 常量（如 `$sidebar-width-collapsed`、microfb `58px`）。

## 后续响应式扩展（规划）

```text
视口宽度 → resolveLayoutSize() → 'sm'|'md'|'lg'|'xl'
                                    ↓
                         $localeLayout.sidebarWidth[size]
```

接入前仍可在全站统一使用 `.md` 作为桌面默认档位。
