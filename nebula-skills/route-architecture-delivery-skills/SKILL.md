---
name: route-architecture-delivery-skills
description: 在架构设计与交付推进类 skill 中快速路由。用于用户需求涉及“API 契约/接口设计/方案设计/Swagger/OpenAPI 对齐/ready 接口梳理、接口迁移、版本切换、原型驱动开发、计划测试闭环、分支规范、分批次 commit 命名与推送整理、微前端登录落点/路由前缀一致性、路由散点收束巡检、Vite 代理 v1/v2 分流与 404 排障、功能项-API-契约-网关注册链路梳理”但未明确 skill 名称的场景；其中凡涉及 API 契约必须先执行 seccenter swagger 契约浏览。
---

# 目标

把复杂工程诉求路由到最匹配的执行 skill，提升推进速度；并确保所有“API 契约/接口设计/方案设计”先以 Swagger 契约为单一事实源。

## 总原则（API 契约强制前置）

- 只要用户需求包含任一关键词：**API 契约 / 接口设计 / 方案设计 / 字段对齐 / ready 接口梳理 / Swagger / OpenAPI / operationId / definitions / $ref**
  - 必须先进入 skill：`seccenter-api-contract`
  - 并强制前置读取：`F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`

## 执行步骤

1. 识别诉求主轴（迁移/架构/流程/版本/协作）。
2. 对照 `references/decision-matrix.md` 选择首选 skill。
3. 若命中“功能项-API-契约-网关注册链路”场景，且需求包含 API 契约对齐，固定顺序：
   - 先 `seccenter-api-contract`
   - 后 `route-api-gateway-register`
4. 若诉求涉及路由代码修改（router/guard/menu/activeRule/base），优先评估 `route-scatter-check`。
5. 同时给出 1 个备选 skill，并说明适用边界。
6. 给出不推荐 skill（1-2 个）及简短理由。
7. 输出首选 skill 的直接下一步命令。

## 输出要求

1. 必须使用固定三档：`首选`、`备选`、`不推荐`。
2. 如跨域任务，补充“先后顺序”建议。
3. 明确首选 skill 的输入前置条件。
4. 结尾必须提供一条可直接复制的调用语句。

## 固定输出模板

1. 首选
   - skill: `<name>`
   - 理由: `<一句话>`
2. 备选
   - skill: `<name>`
   - 理由: `<一句话>`
3. 不推荐
   - skill: `<name>`
   - 原因: `<一句话>`
4. 直接执行
   - `使用 $<首选skill> <你的任务描述>`

## 外部最佳实践校验（必做）

1. 无论是否使用本 skill，都先进行一次 web search，确认当前任务的最佳实践与最新约束。
2. 优先来源顺序：官方文档 > 标准组织/维护者仓库 > 高质量技术文档。
3. 至少引用 2 个来源；高风险任务（生产、权限、安全、数据）至少 3 个来源交叉验证。
4. 输出中必须包含：来源链接、采纳点、未采纳点与原因。
5. 若检索结果不足或冲突，必须明确不确定性并给出保守方案。
