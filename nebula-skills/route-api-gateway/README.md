# route-api-gateway

## 定位
`route-api-gateway` 是这条 API 分层链路的总入口：

`Swagger/OpenAPI -> src/api 原始接口与原始类型 -> src/types 稳定类型 -> src/gateway 映射与编排 -> 业务层消费`

它只做条件路由，不做执行编排。

## frontmatter 模式
本 skill 采用“本地中文模式”：
- `SKILL.md` 的 `name` 使用中文
- `SKILL.md` 的 `description` 使用中文触发描述

## 路由范围
- `api-gateway-add`
  - 新增接口
  - 新增或替换业务写链路
  - 补稳定类型、映射函数、gateway 稳定入口
- `api-gateway-deprecate`
  - 旧版本接口下线
  - 删除旧兼容层、旧 API、旧测试、旧 mock
  - 结合契约确认退化边界

## 共享契约输入
- 默认 `spec_path`：
  `F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path`
- 父 skill 与两个子 skill 都使用同一契约输入规则

## 不处理的场景
- 路由散点、router/guard/menu 对齐：改用 `route-scatter-check`
- 只浏览 Swagger 契约：先用 `seccenter-api-contract`
- registry / permission / runtime metadata：不归本 skill 管

## 输出格式
1. `首选`
2. `备选`
3. `不推荐`
4. `执行顺序建议`
5. `直接执行`

## 使用示例
```text
使用 $route-api-gateway 扫描“菜单功能项管理”模块，
基于当前代码链路和默认契约判断该场景更像待新增还是待退化，
并输出首选、备选、不推荐和执行顺序建议。
```

```text
使用 $route-api-gateway 扫描某个仓库路径，
判断当前项目中是否存在待新增的 API 接入点，或待退化的旧兼容层候选。
```

```text
使用 $route-api-gateway 根据一段现状链路描述，
判断当前应该优先走新增还是退化，
并给出首选、备选、不推荐和执行顺序建议。
```

## agent 素材入口
- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`
- `[[references/api-gateway-routing-core.md]]`

## 模板与素材
- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`
- `[[assets/few-shot-example]]`
- `[[references/api-gateway-routing-core.md]]`
