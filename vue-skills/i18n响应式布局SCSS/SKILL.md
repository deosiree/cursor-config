---
name: i18n响应式布局SCSS
description: locale-layout 侧栏/表单 sm-md-lg-xl 档位与 SCSS 撑满。触发：切换语言布局宽、sidebarWidth、menu.scss 200px 锁宽、icon 裁切。先路由扩展已有/新建 MVP/修 SCSS，勿用于纯 i18n 翻译。
---

# i18n响应式布局SCSS

**locale-layout** 插件：按 **语言** 切换 preset，按 **LayoutSize 档位**（sm/md/lg/xl）消费尺寸。当前默认消费 **`.md`**；折叠侧栏宽度与语言无关。

**TL;DR 路由**：有 locale-layout → **扩展**；没有 → **新建 MVP**；容器已宽 menu 仍窄 → **修 SCSS**。

## Agent 执行步骤（按序）

1. **读 RED 五问**（下节）与目标仓 `locale-layout.ts` / 侧栏模板 / `menu.scss`
2. **走路由表**，选定唯一子 skill（microfb 全量 = 新建 → SCSS）
3. **打开** [`assets/skill-output-checklist.md`](assets/skill-output-checklist.md)，边改边勾
4. **对照** `template/before|after|mvp` 片段，禁止凭记忆写 preset
5. **GREEN 六项**自验 + `vue-tsc`；仍异常查 **失败 fallback 表**
6. 产出变更说明：改了哪些文件、为何折叠宽不进 preset

## 何时使用

- 切换语言后表单 label、查询框、**侧栏**宽度需变化
- 新增 `$localeLayout.{field}` 布局维度（须 `Record<LayoutSize, string>`）
- 侧栏容器变宽但 menu/icon 仍裁切（200px 锁宽）
- microfb 等仓首次接入 locale-layout 侧栏

## 何时不要使用

- 纯 i18n 翻译 JSON / `$t()` 文案
- 表格 `v-loading`、useLoading 全屏遮罩 → [`hook-loading`](../hook-loading/SKILL.md)
- qiankun 子应用无侧栏，仅改 formLabel → 只扩展 preset，不必动 LeftLayout

## RED：失败基线（先判定再改码）

1. 是否存在 `src/plugins/locale-layout.ts`（对照 [`template/before`](template/before/apex-dev/) / 目标仓）
2. 新字段是否应为 **四档** 而非单字符串（见 [`references/locale-layout-api.md`](references/locale-layout-api.md)）
3. 折叠宽度是否误放进 preset（见 [`references/anti-patterns.md`](references/anti-patterns.md)）
4. 容器宽已变但 `.el-menu` 仍 200px → SCSS 未撑满
5. 档位语义见 [`references/responsive-breakpoints.md`](references/responsive-breakpoints.md)（Element Plus + Bootstrap 约定）

对照样本：

- apex 扩展：[`template/before`](template/before/apex-dev/) vs [`template/after`](template/after/apex-dev/)
- microfb 新建：[`template/mvp`](template/mvp/microfb/) + [`template/after`](template/after/microfb/)

## 路由表（必先执行）

| 场景 | 判定信号 | 委派子 skill |
|------|----------|--------------|
| **扩展侧栏** | 已有 locale-layout（含 formLabel 等） | [`feature-skills/扩展-已有locale-layout侧栏`](feature-skills/扩展-已有locale-layout侧栏/SKILL.md) |
| **新建插件** | 无 locale-layout，需侧栏随语言 | [`feature-skills/新建-locale-layout插件`](feature-skills/新建-locale-layout插件/SKILL.md) |
| **SCSS 撑满** | 已绑 `$localeLayout.sidebarWidth.md` 但 menu 仍窄 | [`feature-skills/修复-侧栏菜单SCSS撑满`](feature-skills/修复-侧栏菜单SCSS撑满/SKILL.md) |
| **microfb 全量** | 无插件 + 侧栏 + menu 锁宽 | **新建 → SCSS 修复** |

判定口诀：**有 locale-layout 就扩展；没有就 MVP；宽了还窄就修 SCSS。**

## CHECKPOINT · STOP

| 触发条件 | 必须动作 |
|----------|----------|
| 不确定有无 locale-layout | 读 `src/plugins/locale-layout.ts` |
| 用户只要翻译不要布局 | **停止**，不走本 skill |
| 仅 qiankun 子应用 formLabel | 只改 preset，不碰侧栏 SCSS |
| 要求 xs 档位接入 @media | 先读 breakpoints 文档，另开响应式任务 |

## 常见失败 · 一线修复 · 仍失败兜底

| 症状 | 一线修复 | 仍失败兜底 |
|------|----------|------------|
| 切语言侧栏宽不变 | 查模板是否仍写死 `200px` / SCSS 常量；改绑 `$localeLayout.sidebarWidth.md` | 读 [`扩展-已有locale-layout侧栏`](feature-skills/扩展-已有locale-layout侧栏/SKILL.md)；确认 preset 已 `Object.assign` |
| 容器变宽 icon 仍裁切 | 删 `menu.scss` 的 `200px !important`；`el-menu { width:100% }` | 走 [`修复-侧栏菜单SCSS撑满`](feature-skills/修复-侧栏菜单SCSS撑满/SKILL.md) |
| microfb 无 `$localeLayout` | `main.ts` 在 `app.use(i18n)` 后 `setupLocaleLayout` | 走 [`新建-locale-layout插件`](feature-skills/新建-locale-layout插件/SKILL.md) |
| 折叠态宽度随语言变 | **错误**：折叠宽应 SCSS 常量，移出 preset | 见 [`anti-patterns.md`](references/anti-patterns.md) #1 |
| 只复制 apex 全量 preset | microfb 无 formLabel 消费点时只保留 `sidebarWidth` 四档 | 对照 [`template/mvp/microfb`](template/mvp/microfb/) |
| agent 误走 i18n 翻译 | 用户要 JSON/`$t()` 时 **停止** | 转 [`i18n-server`](../../nebula-skills/i18n-server/SKILL.md) |

## GREEN 验收

1. 新布局字段为 `Record<LayoutSize, string>`，与 `formLabel` 同构
2. 模板默认 `$localeLayout.{field}.md`（侧栏：`sidebarWidth.md`）
3. 展开：`width` + `minWidth` inline；折叠：SCSS class 常量
4. `el-menu` 展开 `width:100%`；icon `flex-shrink:0`；标题 ellipsis
5. `setupLocaleLayout` 在 `app.use(i18n)` 之后
6. `vue-tsc` 无新增错误

## 使用示例

```text
使用 $i18n响应式布局SCSS：microfb 英文侧栏 icon 被裁切，参照 apex 加 locale-layout sidebarWidth 四档并修 menu.scss。
```

```text
使用 $i18n响应式布局SCSS：apex_dev 已有 locale-layout，给 LeftLayout 加 sidebarWidth，消费 .md。
```

## 相关文档

- [`assets/skill-output-checklist.md`](assets/skill-output-checklist.md) — 交付勾选项
- [`test-prompts.json`](test-prompts.json) — Darwin / 路由回归用例（3 条）
- [`references/responsive-breakpoints.md`](references/responsive-breakpoints.md)
- [`references/locale-layout-api.md`](references/locale-layout-api.md)
- [`references/anti-patterns.md`](references/anti-patterns.md)
- [`template/README.md`](template/README.md)
- [`evals/darwin-results.tsv`](evals/darwin-results.tsv) — 质量迭代记录

## 禁止事项（meta-skill 黑名单）

- 勿把折叠宽度写进 `$localeLayout` preset
- 勿在未读 `locale-layout.ts` 前整仓复制 apex 插件
- 勿只改容器 inline 宽而不修 `el-menu` / `menu.scss`
- 勿将纯翻译、hook-loading、qiankun 语言同步混为本 skill 范围
