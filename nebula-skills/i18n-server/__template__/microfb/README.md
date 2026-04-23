# microfb i18n Commit Playbook

本目录沉淀 `microfb` 仓库从 `ac05eebfbe5f2d35125cec76ba84a545d35d1067` 到 `f3f6f109a3900577f5f56718813f95e82db5ab17` 的真实 i18n 迁移提交链，并把它拆成可复用于其他微服务的父子 skill 组合。

所有内容都落在 `F:\Documents\Repertory\Sieyuan\nebula\.cursor\nebula-skills\i18n-server\__template__\microfb` 下，不新增额外顶层命名空间。

## 提交链总览

| 步骤 | 提交 | 子 skill | 主题 |
| --- | --- | --- | --- |
| 1 | `ac05eeb` | `commit-01-static-deprecation` | 退化 i18n 的旧方案：全部硬切静态化 |
| 2 | `aca321d` | `commit-02-plugin-install` | i18n 实例初始化：安装插件 |
| 3 | `4d51b5b` | `commit-03-runtime-bootstrap` | i18n 实例初始化：其他样板代码 |
| 4 | `06624c8` | `commit-04-lang-select-recovery` | 修改语言选择器，定义语言下拉框常量 |
| 5 | `198a60a` | `commit-05-locale-json-fill` | 补充翻译 JSON |
| 6 | `1763c88` | `commit-06-vue-template-dollar-t` | 修改 Vue 模板中使用 $t() |
| 7 | `462a31d` | `commit-07-form-rules-consumption-boundary` | 修改规则中心 formRules，校验器的 i18n 消费点在 formRules |
| 8 | `e87b6d1` | `commit-08-script-setup-runtime-t` | 修改 ts 或 script setup 中使用 t()，可以包变量 |
| 9 | `c05f40d` | `commit-09-trans-key-marking-mvp` | MVP：trans 让抽取脚本识别这是一条国际化 key，不翻译；引用处再调用 t() |
| 10 | `6a3e495` | `commit-10-dynamic-function-text-callback` | MVP：解决函数的动态拼接翻译文件，通过业务层回调 t 到函数定义中 |
| 11 | `f3f6f10` | `commit-11-foundation-cleanup` | trans 收尾：基座国际化的收尾 |

## 哪些步骤是必经步骤

- `commit-01-static-deprecation`：所有存在旧 `src/lang` 依赖的微服务先做这一层退化。
- `commit-02-plugin-install`：安装新 runtime 依赖。
- `commit-03-runtime-bootstrap`：建立 `src/i18n` 基座。

## 哪些步骤按代码形态选择性使用

- `commit-04-lang-select-recovery`：仓库有语言切换入口时使用。
- `commit-05-locale-json-fill`：准备迁移模板或 TS 文案前先补 key。
- `commit-06-vue-template-dollar-t`：模板中仍有静态文案时使用。
- `commit-07-form-rules-consumption-boundary`：存在表单规则工厂或校验消息时使用。
- `commit-08-script-setup-runtime-t`：`script setup` / TS 中仍有硬编码文案时使用。
- `commit-09-trans-key-marking-mvp`：默认 props、常量默认值需要被抽词工具识别时使用。
- `commit-10-dynamic-function-text-callback`：存在动态拼接 MFA/OTP/通知文案时使用。
- `commit-11-foundation-cleanup`：完成最终收尾和 util 边界清理。

## 如何路由到子 skill

优先看 `templates/migration-routing-table.md`，按仓库症状选入口，再沿 `templates/orchestration-flow.md` 的顺序推进。

常见路由原则：
- 先清理旧链路，再接新基座，不要在旧 runtime 上叠加新 runtime。
- 先补 locale key，再改模板和运行时消费点。
- `trans()` 只负责标记 key，最终展示一律由 `t()` / `$t()` 在消费点触发。
- 动态文本不要强行塞回 util 的静态字符串函数里。

## 目录说明

- `SKILL.md`：父 skill，负责编排 11 个子 skill。
- `subskills/`：11 个提交级 skill，每个目录对应一个真实提交。
- `templates/`：父 skill 的全局路由表、编排图、迁移检查单。
- `subskills/*/template/mvp/`：该提交的最小必要样例。
- `subskills/*/template/snapshot/`：该提交完成后的阶段性代码快照。
