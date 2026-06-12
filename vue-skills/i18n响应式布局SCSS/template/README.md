# i18n响应式布局SCSS 模板索引

样本来自 **apex_dev**（扩展已有 locale-layout）与 **microfb**（新建 MVP + SCSS 修复）。维护时以业务仓工作区最终态为准。

## 目录

| 路径 | 类型 | 说明 | 来源 |
|------|------|------|------|
| [`before/apex-dev/.../locale-layout.sidebar.fragment.ts`](before/apex-dev/src/plugins/locale-layout.sidebar.fragment.ts) | before | apex RED：无 sidebarWidth | `git show HEAD:src/plugins/locale-layout.ts` |
| [`before/apex-dev/.../LeftLayout.sidebar.fragment.vue`](before/apex-dev/src/layouts/views/LeftLayout.sidebar.fragment.vue) | before | apex RED：SCSS `$sidebar-width` | `git show HEAD:src/layouts/views/LeftLayout.vue` |
| [`after/apex-dev/.../locale-layout.sidebar.fragment.ts`](after/apex-dev/src/plugins/locale-layout.sidebar.fragment.ts) | after | apex GREEN：sidebarWidth 四档 | apex 工作区/暂存 |
| [`after/apex-dev/.../LeftLayout.sidebar.fragment.vue`](after/apex-dev/src/layouts/views/LeftLayout.sidebar.fragment.vue) | after | apex GREEN：`.md` + menu 撑满 | 同上 |
| [`after/apex-dev/.../useLocaleLayout.sidebar.fragment.ts`](after/apex-dev/src/composables/useLocaleLayout.sidebar.fragment.ts) | after | composable `sidebarWidth('md')` | 同上 |
| [`before/apex-dev/.../menu.menu-tab.fragment.vue`](before/apex-dev/src/views/system/menu.menu-tab.fragment.vue) | before | 菜单 Tab RED：`4em` 写死 | 实跑前 |
| [`after/apex-dev/.../menu.menu-tab.fragment.vue`](after/apex-dev/src/views/system/menu.menu-tab.fragment.vue) | after | 菜单 Tab GREEN：`$localeLayout` | apex 工作区 |
| [`before/apex-dev/.../securityConfig.tab.fragment.vue`](before/apex-dev/src/views/system/securityConfig.tab.fragment.vue) | before | 安全配置 RED：`200px` 写死 | 实跑前 |
| [`after/apex-dev/.../securityConfig.tab.fragment.vue`](after/apex-dev/src/views/system/securityConfig.tab.fragment.vue) | after | 安全配置 GREEN + `show-tab-actions=false` | apex 工作区 |
| [`before/apex-dev/.../locale-layout.tab-label.fragment.ts`](before/apex-dev/src/plugins/locale-layout.tab-label.fragment.ts) | before | 无 tabLabelMaxWidth | 实跑前 |
| [`after/apex-dev/.../locale-layout.tab-label.fragment.ts`](after/apex-dev/src/plugins/locale-layout.tab-label.fragment.ts) | after | tabLabelMaxWidth 四档 | apex 工作区 |
| [`after/apex-dev/.../PageTabShell.tab-width.fragment.ts`](after/apex-dev/src/components/PageTabShell.tab-width.fragment.ts) | after | 项宽 `calc(label+3.5rem)` | apex 工作区 |
| [`before/microfb/.../menu.sidebar-lock.fragment.scss`](before/microfb/src/styles/custom/menu.sidebar-lock.fragment.scss) | before | microfb RED：200px 锁宽 | `git show HEAD:src/styles/custom/menu.scss` |
| [`before/microfb/.../App.sidebar-hardcode.fragment.vue`](before/microfb/src/App.sidebar-hardcode.fragment.vue) | before | microfb RED：侧栏 200px 硬编码 | `git show HEAD:src/App.vue` |
| [`mvp/microfb/.../locale-layout.sidebar.mvp.ts`](mvp/microfb/src/plugins/locale-layout.sidebar.mvp.ts) | mvp | 精简插件（仅 sidebarWidth grid） | microfb 工作区 |
| [`mvp/microfb/.../locale-layout.d.ts`](mvp/microfb/src/types/locale-layout.d.ts) | mvp | `$localeLayout` 类型 | 同上 |
| [`mvp/microfb/.../main.setup.fragment.ts`](mvp/microfb/src/main.setup.fragment.ts) | mvp | main 注册片段 | 手工摘录 |
| [`after/microfb/.../App.sidebar.fragment.vue`](after/microfb/src/App.sidebar.fragment.vue) | after | microfb GREEN：`.md` 消费 | microfb 工作区 |
| [`after/microfb/.../menu.sidebar.fragment.scss`](after/microfb/src/styles/custom/menu.sidebar.fragment.scss) | after | microfb GREEN：menu 100% | 同上 |

## 维护命令

```powershell
$skill = "F:\Documents\Repertory\Sieyuan\nebula\.cursor\vue-skills\i18n响应式布局SCSS"
cd F:\Documents\Repertory\Sieyuan\nebula\apex_dev
git show HEAD:src/plugins/locale-layout.ts | Out-File -Encoding utf8 "$skill\template\before\apex-dev\src\plugins\locale-layout.sidebar.fragment.ts"
git show HEAD:src/layouts/views/LeftLayout.vue | Out-File -Encoding utf8 "$skill\template\before\apex-dev\src\layouts\views\LeftLayout.sidebar.fragment.vue"
Copy-Item src\plugins\locale-layout.ts "$skill\template\after\apex-dev\src\plugins\locale-layout.sidebar.fragment.ts"
Copy-Item src\layouts\views\LeftLayout.vue "$skill\template\after\apex-dev\src\layouts\views\LeftLayout.sidebar.fragment.vue"
Copy-Item src\composables\useLocaleLayout.ts "$skill\template\after\apex-dev\src\composables\useLocaleLayout.sidebar.fragment.ts"
Copy-Item src\plugins\locale-layout.ts "$skill\template\after\apex-dev\src\plugins\locale-layout.tab-label.fragment.ts"
Copy-Item src\views\system\menu\index.vue "$skill\template\after\apex-dev\src\views\system\menu.menu-tab.fragment.vue"
Copy-Item src\views\system\securityConfig\index.vue "$skill\template\after\apex-dev\src\views\system\securityConfig.tab.fragment.vue"
Copy-Item src\components\PageTabShell\index.vue "$skill\template\after\apex-dev\src\components\PageTabShell.tab-width.fragment.ts"

cd F:\Documents\Repertory\Sieyuan\nebula\microfb
git show HEAD:src/styles/custom/menu.scss | Out-File -Encoding utf8 "$skill\template\before\microfb\src\styles\custom\menu.sidebar-lock.fragment.scss"
Copy-Item src\plugins\locale-layout.ts "$skill\template\mvp\microfb\src\plugins\locale-layout.sidebar.mvp.ts"
Copy-Item src\App.vue "$skill\template\after\microfb\src\App.sidebar.fragment.vue"
Copy-Item src\styles\custom\menu.scss "$skill\template\after\microfb\src\styles\custom\menu.sidebar.fragment.scss"
```

**注意**：更新 microfb after/mvp 前请确认工作区已为 grid + `.md` 消费，并与 `git add` 暂存一致。
