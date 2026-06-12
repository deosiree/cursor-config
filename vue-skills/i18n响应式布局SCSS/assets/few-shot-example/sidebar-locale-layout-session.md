# 侧栏 locale-layout 会话摘要（few-shot）

## 背景

- **apex_dev**：已有 `locale-layout`（formLabel/queryField/descriptions），**扩展** `sidebarWidth: Record<LayoutSize, string>`，LeftLayout 消费 `.md`。
- **microfb**：原无插件，**新建**精简 MVP（仅 sidebarWidth），并 **修复** `menu.scss` 200px 锁宽。

## 关键决策

| 决策 | 结论 |
|------|------|
| 折叠宽度分语言？ | **否**；折叠仅 icon，走 SCSS 54/58px |
| sidebarWidth 单字符串？ | **否**；与 formLabel 同构四档，消费 `.md` |
| microfb 复制 apex 全量 preset？ | **否**；无 formLabel 消费点，只保留 sidebarWidth |
| 容器变宽 menu 仍窄？ | 删 `200px !important`，`el-menu width:100%` |

## 路由示例

```text
用户：英文侧栏 icon 被裁切
→ 已有 $localeLayout？是 → 检查 menu.scss 200px → 修复-侧栏菜单SCSS撑满

用户：microfb 要侧栏随语言变宽
→ 无 locale-layout → 新建-locale-layout插件 → 修复-侧栏菜单SCSS撑满
```

## 样本路径

- apex after：`template/after/apex-dev/`
- microfb mvp：`template/mvp/microfb/`

## 参考

- [`references/responsive-breakpoints.md`](../references/responsive-breakpoints.md) — Element Plus + Bootstrap 档位说明
- [`assets/few-shot-example/pagetab-tablabel-session.md`](../assets/few-shot-example/pagetab-tablabel-session.md) — PageTabShell Tab 宽实跑
