---
名称: "示例项目级约束与边界"
适用对象: "路由-组件-权限点-API 源码梳理"
权限统计范围: "仅统计真实命中的 v-hasPerm"
API路径规则: "输出业务路径，不保留 direct/forward 前缀"
描述回退规则: "默认契约 -> 补充契约 -> 待人工介入"
未命中权限规则: "每个路由补充未命中权限控制的组件与权限点"
多轮补全规则: "契约不全时先输出已确认部分，再请求人工介入"
挂起策略: "后端未实现或版本不一致时，可保留挂起痕迹，不强行闭环"
title: "示例项目级约束与边界"
doc_type: "skill-reference"
applies_to: "路由-组件-权限点-API 源码梳理"
permission_scope: "仅统计真实命中的 v-hasPerm"
api_url_rule: "输出业务路径，不保留 direct/forward 前缀"
description_rule: "default contract -> extra contracts -> human intervention"
non_perm_api_rule: "每个路由补充未命中权限控制的组件与权限点"
multi_round_rule: "contract incomplete -> partial output -> human intervention"
pending_rule: "backend not implemented or version mismatch may stay pending"
---

## 口径说明

- 权限范围只看真实消费点，不看后台理论配置。
- API 范围只看源码真实调用，不看菜单后台理论绑定。
- 子组件权限并入父路由页面，并递归扫描该页面全部业务子孙组件。

## 契约说明

- `description` 优先读取默认契约。
- 默认契约未命中时，再查补充契约。
- 所有已知契约都未命中时，不主观推断正式 `description`，而是进入 `# 待人工介入`。

## 未命中项说明

- 每个路由下都允许存在：
  - `未命中权限控制的组件`
  - `未命中权限控制的权限点`
- 若后端未实现、前后端版本不一致或用户明确要求暂不处理，可保留挂起痕迹，不强行闭环。
