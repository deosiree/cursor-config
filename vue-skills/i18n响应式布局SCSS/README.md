# i18n响应式布局SCSS

Vue + Element Plus 项目的 **locale-layout 国际化布局** skill：preset 四档（sm/md/lg/xl）+ 侧栏 SCSS + **PageTabShell Tab** 消费。

## 解决什么问题

- 切换语言后布局尺寸不变（侧栏、form label、查询框、**Tab 标签**）
- 侧栏容器变宽但 menu 仍 200px、icon 裁切
- PageTabShell Tab 英文重叠，或安全配置等页 Tab 宽写死不随语言
- 新仓需接入 `$localeLayout`，不确定扩展还是新建 MVP

## Agent 结构

```text
SKILL.md（父级：RED + 路由 + 验收）
├── feature-skills/扩展-已有locale-layout侧栏        → template/before|after/apex-dev 侧栏
├── feature-skills/扩展-PageTabShell-tabLabelMaxWidth → menu / securityConfig / PageTabShell
├── feature-skills/新建-locale-layout插件              → template/mvp/microfb
└── feature-skills/修复-侧栏菜单SCSS撑满              → menu.scss / LeftLayout deep
```

## 真相源（维护）

| 类型 | 来源 | 说明 |
|------|------|------|
| apex 扩展 before | `apex_dev` `git show HEAD:...` | 无 sidebarWidth |
| apex 扩展 after | `apex_dev` 工作区/暂存 | sidebarWidth + tabLabelMaxWidth + LeftLayout |
| apex PageTabShell after | `menu/index.vue` `securityConfig/index.vue` `PageTabShell/index.vue` | Tab 动态宽实跑 |
| microfb MVP | `microfb` 工作区 | 精简 locale-layout |
| microfb SCSS before | `microfb` `git show HEAD:menu.scss` | 200px 锁宽 |

维护命令见 [`template/README.md`](template/README.md)。

## 目录说明

```text
i18n响应式布局SCSS/
├── SKILL.md
├── README.md
├── agents/openai.yaml
├── feature-skills/
├── template/before|after|mvp/
├── references/
├── assets/few-shot-example/
└── evals/
```

## 触发词

locale-layout、$localeLayout、sidebarWidth、tabLabelMaxWidth、PageTabShell、tab-label-max-width、国际化布局、响应式布局、LayoutSize、formLabel.md、侧栏宽度、menu.scss 200px、切换语言布局、Tab 重叠、i18n响应式布局SCSS

## 质量状态

- 首轮交付：结构 + 真实样本 + evals 清单
- Darwin（2026-06-11）：baseline 70 → **87**（3 轮）；见 [`evals/darwin-results.tsv`](evals/darwin-results.tsv)
- 回归用例：[`test-prompts.json`](test-prompts.json)（dry_run 已对齐路由）

## 关键约定摘要

- 消费：**`.md`** 档位（桌面默认）
- 折叠宽：**不进 preset**，SCSS 常量
- PageTabShell：绑 `$localeLayout.tabLabelMaxWidth.md`；有齿轮时项宽 `calc(label+3.5rem)`
- microfb：**不复制** apex 全量 formLabel preset
