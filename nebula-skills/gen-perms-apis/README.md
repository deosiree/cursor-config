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
- `约束与边界文件`：可选，默认 `[[references/default-project-boundary.md]]`
- `路由入口`：可选，默认 `src/router/index.ts`
- `视图根目录`：可选，默认 `src/views`
- `组件根目录`：可选，默认 `src/components`
- `网关根目录`：可选，默认 `src/gateway`
- `原始 API 根目录`：可选，默认 `src/api`

以上全部参数都必须进入输出文档的笔记属性，且属性头必须从文件第一行开始。
属性头同时保留中文字段和英文字段，中文优先给人读，英文保留给 agent / 脚本消费。

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

第一份文件用于验证最终结构是否可读，不作为通用模板本体。
第二份文件用于演示“契约不全 -> 人工介入 -> 二次补完”的完整闭环。
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
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/default-project-boundary.md]]`
- `[[references/template-tuning-notes.md]]`
