---
name: 扩展-PageTabShell-tabLabelMaxWidth
description: 当 PageTabShell Tab 标签需随语言切换宽度时，在 locale-layout 扩展 tabLabelMaxWidth 四档并绑定 $localeLayout；有 Tab 操作时须联动 PageTabShell 项总宽。
---

# 扩展 PageTabShell tabLabelMaxWidth

父级 agent：[`../../SKILL.md`](../../SKILL.md)。本节点负责 **Tab 标签国际化布局**，典型为菜单管理、安全配置等 `PageTabShell` 页面。

## 何时使用

- `PageTabShell` 的 `tab-label-max-width` 仍写死 `4em` / `200px`
- 切英文后 Tab 文案 ellipsis 过早，或与相邻 Tab **重叠**（项总宽未变）
- 需在 `locale-layout` 新增与 `formLabel` 同构的 `tabLabelMaxWidth`

## 何时不要使用

- 纯 `$t()` 翻译 Tab 文案、不涉及宽度 → [`i18n-server`](../../../nebula-skills/i18n-server/SKILL.md)
- 侧栏宽度问题 → [`../扩展-已有locale-layout侧栏/SKILL.md`](../扩展-已有locale-layout侧栏/SKILL.md)

## 规范样本（apex 实跑 2026-06）

| 样本 | 路径 |
|------|------|
| before preset | [`template/before/apex-dev/.../locale-layout.tab-label.fragment.ts`](../../template/before/apex-dev/src/plugins/locale-layout.tab-label.fragment.ts) |
| after preset | [`template/after/apex-dev/.../locale-layout.tab-label.fragment.ts`](../../template/after/apex-dev/src/plugins/locale-layout.tab-label.fragment.ts) |
| before 菜单 Tab | [`template/before/apex-dev/.../menu.menu-tab.fragment.vue`](../../template/before/apex-dev/src/views/system/menu.menu-tab.fragment.vue) |
| after 菜单 Tab | [`template/after/apex-dev/.../menu.menu-tab.fragment.vue`](../../template/after/apex-dev/src/views/system/menu.menu-tab.fragment.vue) |
| before 安全配置 Tab | [`template/before/apex-dev/.../securityConfig.tab.fragment.vue`](../../template/before/apex-dev/src/views/system/securityConfig.tab.fragment.vue) |
| after 安全配置 Tab | [`template/after/apex-dev/.../securityConfig.tab.fragment.vue`](../../template/after/apex-dev/src/views/system/securityConfig.tab.fragment.vue) |
| PageTabShell 项宽推导 | [`template/after/apex-dev/.../PageTabShell.tab-width.fragment.ts`](../../template/after/apex-dev/src/components/PageTabShell.tab-width.fragment.ts) |

会话摘要：[`assets/few-shot-example/pagetab-tablabel-session.md`](../../assets/few-shot-example/pagetab-tablabel-session.md)

## RED：扩展前核对

1. 页面是否用 `PageTabShell` + `SpanByTips`（默认 `tabLabelMaxWidth`）
2. `show-tab-actions` 是否为 `true` 且存在 `#tabLabelExtra`（齿轮等）→ 项总宽须含操作区
3. 是否只改了 `tab-label-max-width` 而项仍 **112px 固定**（见反模式 #8）
4. 安全配置等**无 Tab 操作**的页面是否误留 `showTabActions` 默认 `true`

## GREEN：落地步骤

### 1. 扩展 locale-layout preset

```typescript
/** PageTabShell / SpanByTips Tab 标签最大宽度，em 或 px */
tabLabelMaxWidth: Record<LayoutSize, string>;

// zh-CN 示例（短文案 Tab）
tabLabelMaxWidth: { sm: "3em", md: "4em", lg: "5em", xl: "6em" },

// en-US 示例（长文案 Tab，按业务调参）
tabLabelMaxWidth: { sm: "6em", md: "10em", lg: "14em", xl: "18em" },
```

`createEmptyLayoutState` / `applyLocaleLayout` 同步 `tabLabelMaxWidth`（与 `sidebarWidth` 同构）。

`useLocaleLayout.ts` 增加 `tabLabelMaxWidth(size = 'md')`（可选，模板可直接 `$localeLayout`）。

### 2. 页面绑定（禁止写死）

**有 Tab 操作（菜单管理）**：

```vue
<PageTabShell
  :show-tab-actions="true"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
>
  <template #tabLabelExtra="{ tab }">...</template>
</PageTabShell>
```

**无 Tab 操作（安全配置）**：

```vue
<PageTabShell
  :show-tab-actions="false"
  :tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"
/>
```

### 3. PageTabShell 项总宽（组件层，一次性）

`showTabActions=true` 且未传 `tab-item-width` 时：

```typescript
const tabWidthFromLabel = `calc(${labelMaxCss} + 3.5rem)`; // padding 40px + 齿轮区
```

见 [`PageTabShell.tab-width.fragment.ts`](../../template/after/apex-dev/src/components/PageTabShell.tab-width.fragment.ts)。

`showTabActions=false` 时项宽 `auto`，由文案自然撑开。

### 4. preset 调参原则

| 场景 | zh-CN md | en-US md 参考 |
|------|----------|---------------|
| 固定短 Tab（登录/密码/会话策略） | 4em | 10em |
| 动态长 Tab（根菜单名如 Management Center） | 4em | 按最长 Tab 名加大（可 20em+） |

档位消费默认 **`.md`**；切换语言后 `$localeLayout` 响应式更新，无需页面 watch。

## 验收

- [ ] 切 zh/en Tab 标签宽随 `$localeLayout.tabLabelMaxWidth.md` 变化
- [ ] 有齿轮时 Tab 项总宽 = `calc(labelMax + 3.5rem)`，无重叠
- [ ] 无齿轮页 `show-tab-actions="false"`
- [ ] `vue-tsc --noEmit` 无新增错误

## 使用示例

```text
菜单管理 PageTabShell 英文 Tab 与相邻项重叠；给 locale-layout 加 tabLabelMaxWidth 并绑 $localeLayout，确认 PageTabShell 项宽联动。
```
