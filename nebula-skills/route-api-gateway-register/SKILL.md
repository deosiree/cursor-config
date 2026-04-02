---
name: route-api-gateway-register
description: Use when documenting or designing nebula's permission-routing-registration chain for module onboarding, micro-service integration, or registry downstream consumption, and you need explicit source-of-truth mapping for actions/pages under src/registry/sources/* plus the unified @/registry entry.
---

# route-api-gateway-register

## 目标
为 nebula 输出“可审计链路文档”：每个节点都明确 `src/registry/sources/*` 下的 actions/pages 等真相源文件、变量、属性、单写点，以及通过 `@/registry` 对外消费的上下游关系。

## 使用顺序（父 skill 只做路由编排）
1. 先按诉求选择子 skill：
   - 功能项/API/契约/网关：`01-function-api-contract-chain`
   - 组件/路由/页面注册：`02-component-route-chain`
   - 上送/聚合/下发：`03-registry-reporting-flow`
   - 新模块/新微服务接入：`04-module-onboarding-playbook`
   - 新领域模块最小模板：`05-registry-module-template`
2. 如果涉及 API 契约对齐，先执行 `seccenter-api-contract`。
3. 最后用父 README 汇总“总链路 + 总清单 + 验收项”。

## 强制约束（必须满足）
1. 每个部分都要有“真相源表”：
   - 节点名
   - 来源文件
   - 来源变量
   - 关键属性
   - 下游消费点
2. 每个部分都要标“单写点”与“禁止第二写点”。
3. 如果节点位于业务层、网关层、API 层或权限层，必须额外说明它是“消费者”还是“真相源”，并标出是否经 `@/registry` 统一入口消费。
4. 每个部分都要给出“新增模块”和“新增微服务”时的改动入口。

## 固定输出模板
1. 链路概览
   - `<本段链路覆盖范围>`
2. 真相源表
   - 节点: `<name>`
   - 来源文件: `<path>`
   - 来源变量: `<symbol>`
   - 关键属性: `<fields>`
   - 下游消费: `<path + symbol>`
3. 单写点
   - 允许修改: `<single write points>`
   - 禁止重复声明: `<dup points>`
4. 统一消费入口
   - 模块聚合入口: `<src/registry/sources/<module>/index.ts + <module>RegistrySource>`
   - 对外消费入口: `<src/registry/index.ts + @/registry>`
5. 接入清单
   - 同微服务新增模块: `<files + symbols>`
   - 新增微服务: `<host + subapp files>`
6. 验收
   - `<命令/检查项>`

## 最终验收（引用 TODOLIST）
- 必须逐项满足：`TODOLIST.md`。
