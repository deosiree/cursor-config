---
name: API 分层链路路由
description: 当需求涉及 API 契约、原始类型、稳定类型、gateway 映射、新增接口接入或旧兼容层退化，但用户没有明确应该使用新增还是退化 skill 时，用于快速判定当前场景。
---

# API 分层链路路由

## 目标

只做条件判断，把当前诉求路由到：

1. `api-gateway-add`
2. `api-gateway-deprecate`

本 skill 不做执行编排，不代替用户连续跑完两个流程。

先看：

- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`

需要长说明时再看：

- `[[references/api-gateway-routing-core.md]]`

## 共享契约输入

- 默认 `spec_path`：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
- 允许显式传入 `spec_path`
- 凡涉及接口、字段、原始类型、旧版本识别、名称对齐、退化边界判断，都必须先读取契约

## RED：先识别失败基线

先判断如果路由错了，会错在哪：

1. 用户是要接入新能力，还是要清理旧能力。
2. 当前问题的核心是“新增链路设计”，还是“旧兼容层退场”。
3. 如果两者都涉及，是先新增再退化，还是先退化再新增。

若没有先把诉求主轴判清，不要直接推荐 skill。

## GREEN：按条件路由

1. 命中 `api-gateway-add`
   - 新增接口、新增写链路、新增 gateway 能力
   - 要设计 `api/types/gateway/business` 四层最小改动
   - 要补稳定类型、映射函数、稳定入口

2. 命中 `api-gateway-deprecate`
   - 旧版本接口已下线
   - 要删除旧兼容层、旧 API、旧测试、旧 mock
   - 要结合契约判断哪些是旧版本、哪些是命名不一致但应保留

3. 同时命中两者时给顺序建议
   - 默认：先 `api-gateway-add`，再 `api-gateway-deprecate`
   - 例外：若旧兼容层已明显干扰现状判断，建议先 `api-gateway-deprecate`

4. 不推荐场景
   - 只改路由散点：改用 `route-scatter-check`
   - 只看 Swagger 契约本身：先用 `seccenter-api-contract`

## 固定输出

1. `首选`
2. `备选`
3. `不推荐`
4. `执行顺序建议`
5. `直接执行`

执行时可配合：

- `[[assets/few-shot-example]]`
- `[[assets/skill-output-checklist.md]]`

## REFACTOR：补边界与误触发

1. 如果新增/退化判定摇摆，先解释摇摆点。
2. 如果两个 skill 都该执行，只给顺序建议，不展开执行步骤。
3. 如果用户只是在问契约，不要误路由到新增或退化。

## 直接执行模板

```text
1. 首选
   - skill: <name>
   - 理由: <一句话>
2. 备选
   - skill: <name>
   - 理由: <一句话>
3. 不推荐
   - skill: <name>
   - 原因: <一句话>
4. 执行顺序建议
   - <先后建议>
5. 直接执行
   - 使用 $<首选skill> <你的任务描述>
```

## 使用示例

```text
使用 $route-api-gateway 扫描某个模块，
判断当前更像新增接口接入场景还是旧兼容层退化场景，
并输出首选、备选、不推荐和执行顺序建议。
```
