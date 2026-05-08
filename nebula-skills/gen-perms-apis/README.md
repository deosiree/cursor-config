# gen-perms-apis

## 定位
`gen-perms-apis` 是一个中文 skill 套件，用来输入仓库路径，梳理静态路由、页面组件、`v-hasPerm` 权限点与真实 API 调用，并输出单份盘点文档：

- `路由-组件-权限点-API 源码梳理.md`

原本独立的“未命中 `v-hasPerm`”设计文档在这里被收敛进每个路由下的：

- `未命中权限控制的组件`
- `未命中权限控制的权限点`

## frontmatter 模式
本 skill 采用“本地中文模式”：

- `SKILL.md` 的 `name` 使用中文
- `SKILL.md` 的 `description` 使用中文触发描述

## 输入契约
- `仓库路径`：必填
- `输出目录`：可选，默认 `<repo>/docs/plans`
- `输出文件名`：可选，默认 `路由-组件-权限点-API 源码梳理.md`
- `api契约`：可选，默认 `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- `补充契约路径`：可选，支持 0 到多个路径
- `关注模块`：可选，支持 0 到多个模块名或路由前缀；未提供或为空时表示全量关注
- `关注路由`：可选，支持 0 到多个 routePath；未提供或为空时表示全量关注
- `非关注路由处理策略`：可选，仅当 `关注模块` 或 `关注路由` 非空时启用
- `约束与边界文件`：可选，默认 `[[references/default-project-boundary.md]]`
- `路由入口`：可选，默认 `src/router/index.ts`
- `视图根目录`：可选，默认 `src/views`
- `组件根目录`：可选，默认 `src/components`
- `网关根目录`：可选，默认 `src/gateway`
- `原始 API 根目录`：可选，默认 `src/api`

以上全部参数都必须进入输出文档的笔记属性，且属性头必须从文件第一行开始。
属性头同时保留中文字段和英文字段，中文优先给人读，英文保留给 agent / 脚本消费。

## 关注范围参数
- `关注模块` 与 `关注路由` 均为空时，不是缺参，而是默认扫描并重点处理全部路由。
- 二者同时提供时取并集；命中任一条件即视为本轮关注范围。
- `关注路由` 按 routePath 精确匹配，例如 `/Apex/profile`。
- `关注模块` 支持模块名与路由前缀匹配，例如 `system` 可匹配 `/Apex/system/*`，`/Apex/system` 可按前缀匹配。
- 只有用户提供了关注模块或关注路由时，才启用“非关注路由处理策略”；否则不要把任何路由弱化为非关注。

## API 反查能力
API 不能只看页面是否直接 import `src/api`。正式输出前必须完成 `[[references/api-backtrace-rules.md]]` 中的三类反查：

- `业务层 -> gateway -> api -> 契约`
- `业务层 -> api -> 契约`
- `子组件 emit/prop/v-model -> 父组件/组合式函数 -> gateway/api -> 契约`

gateway 内部的映射函数、模型转换函数、常量、模板字符串、`direct/forward` base URL 都必须继续解析到最终 API URL。不得把 `/${BASE_URL}/xxx`、错误 `/menu/*`、未追完链路时的“当前无后端 API 调用”当成最终结论。

## 多轮补全模式
本 skill 不再假设一次调用就能产出最终完整文档。

当默认契约与已提供的补充契约都无法覆盖某个源码消费的接口时：

- 不再允许把正式 `description` 写成 `源码语义推断`
- 先输出当前已确认部分
- 再在文末 `# 待人工介入` 中提出缺失问题
- 等用户补充契约路径、接口说明或人工判断后，再次调用同一个 skill 继续完善

## 目录说明
- `SKILL.md`：主执行规则，保留 `RED / GREEN / REFACTOR`
- `template/`：给人类看的结构模板、边界样例、样本试跑产物
- `assets/`：给 agent 读的轻量素材
- `references/`：长说明、边界规则、实现计划、样本调优结论
- `evals/`：触发与输出验收样例

## 样本试跑
本次以 `F:\Documents\Repertory\Sieyuan\nebula\apex_dev` 作为样本仓库，试跑产物放在：

- `[[template/sample-run/apex_dev-route-component-perm-api.md]]`
- `[[template/sample-run/apex_dev-route-component-perm-api-iteration.md]]`
- `[[template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]`

第一份文件用于验证最终结构是否可读，不作为通用模板本体。
第二份文件用于演示“契约不全 -> 人工介入 -> 二次补完”的完整闭环。
第三份文件用于演示“漏看 gateway / 子组件 emit / 补充契约 / 关注路由”的 API 反查回归。
样本试跑可以只覆盖部分路由；正式 skill 仍要求扫描每个路由页面及其所有业务子孙组件。

## 二次调用示例
```text
第一次调用：
使用 $梳理权限点与apis 扫描 apex_dev，
默认 API 契约为 seccenter.swagger.json，补充契约路径为 dbres.json。
如果还有找不到契约的接口，请在文末输出待人工介入问题。
```

```text
第二次调用：
继续使用 $梳理权限点与apis 完善上一次输出文档，
这次补充 /menu/export 对应的契约路径或人工接口说明。
```

```text
关注路由调用：
继续使用 $梳理权限点与apis 扫描 apex_dev，
关注路由只关心 /Apex/tenant、/Apex/system/securityConfig、/Apex/profile。
非关注路由保留扫描证据，但结论统一标记为非本轮关注范围。
```

## 使用示例
```text
使用 $梳理权限点与apis 扫描
F:\Documents\Repertory\Sieyuan\nebula\apex_dev
并基于默认 seccenter swagger 输出一份路由-组件-权限点-API 源码梳理文档。
```

```text
使用 $梳理权限点与apis 扫描一个 Vue 仓库，
把没有挂 v-hasPerm 但真实调用 API 的操作也一并设计成建议权限点，
输出到 docs/plans。
```

## 模板与素材入口
- `[[template/README.md]]`
- `[[template/route-component-perm-api-output.md]]`
- `[[template/boundary-file-example.md]]`
- `[[template/sample-run/apex_dev-route-component-perm-api.md]]`
- `[[template/sample-run/apex_dev-api-backtrace-focus-iteration.md]]`
- `[[assets/few-shot-example]]`
- `[[assets/few-shot-example/api-backtrace-regression.md]]`
- `[[assets/few-shot-example/api-backtrace-regression/01-baseline-failures.md]]`
- `[[assets/few-shot-example/api-backtrace-regression/02-gateway-contract-corrections.md]]`
- `[[assets/few-shot-example/api-backtrace-regression/03-focus-and-backend-todo.md]]`
- `[[assets/few-shot-example/api-backtrace-regression/04-emit-lift-and-profile-security.md]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/default-project-boundary.md]]`
- `[[references/api-backtrace-rules.md]]`
- `[[references/template-tuning-notes.md]]`
