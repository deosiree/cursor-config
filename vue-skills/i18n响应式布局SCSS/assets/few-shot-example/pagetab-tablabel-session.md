# PageTabShell tabLabelMaxWidth 实跑摘要（few-shot）

## 背景

apex_dev 菜单管理、安全配置使用 `PageTabShell`。切英文后 Tab 文案变长，但宽度不随语言变或项间重叠。

## 实跑改动（2026-06）

| 文件 | 改动 |
|------|------|
| `src/plugins/locale-layout.ts` | 新增 `tabLabelMaxWidth: Record<LayoutSize, string>` 三语 preset |
| `src/composables/useLocaleLayout.ts` | `tabLabelMaxWidth('md')` |
| `src/views/system/menu/index.vue` | `:tab-label-max-width="$localeLayout.tabLabelMaxWidth.md"` + `show-tab-actions` 保持 true |
| `src/views/system/securityConfig/index.vue` | 同上绑定 + `:show-tab-actions="false"`（无齿轮） |
| `src/components/PageTabShell/index.vue` | `showTabActions` 时项宽 `calc(tabLabelMaxWidth + 3.5rem)`，替代旧 112px 固定 |

## 根因（重叠）

只改 `SpanByTips` 的 `max-width` 不够：`PageTabShell` 在 `showTabActions=true` 时曾把 **`.el-tabs__item` 固定 112px**，文案溢出叠到相邻 Tab。

## 关键决策

| 决策 | 结论 |
|------|------|
| 只绑页面还是改组件？ | **两者**：preset + 页面 `$localeLayout` 绑定；组件层项宽随 `tabLabelMaxWidth` 推导 |
| 安全配置为何 `show-tab-actions=false`？ | 无 `#tabLabelExtra`，避免多算 3.5rem；项宽 `auto` |
| 写死 `200px` / `4em`？ | **禁止**；必须 `$localeLayout.tabLabelMaxWidth.md` |
| en preset 用多少 em？ | 按最长 Tab 名调参；固定策略 Tab ~10em；动态根菜单名可更大 |

## 路由示例

```text
用户：英文 Tab 叠到下一个 Tab 上
→ 查 PageTabShell 项宽是否仍 112px → 组件 calc 联动
→ 查页面是否写死 tab-label-max-width → 改绑 $localeLayout

用户：安全配置切语言 Tab 宽不变
→ 查是否仍 tab-label-max-width="200px" → 改绑 $localeLayout
→ 无齿轮则 show-tab-actions=false
```

## 样本路径

- preset after：`template/after/apex-dev/src/plugins/locale-layout.tab-label.fragment.ts`
- 菜单 after：`template/after/apex-dev/src/views/system/menu.menu-tab.fragment.vue`
- 安全配置 after：`template/after/apex-dev/src/views/system/securityConfig.tab.fragment.vue`
