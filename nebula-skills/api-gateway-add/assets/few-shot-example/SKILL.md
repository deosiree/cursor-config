---
name: 新增 API 分层接入 few-shot
description: 给 agent 一个“如何输出新增接口四层最小改动设计”的最小成品示例。
---

# 示例输入
使用 $api-gateway-add 为菜单功能项新增 3 个写接口，读链路保持不动，只替换右侧 API 子项的新增、编辑、删除。

# 示例输出骨架
1. 现状链路
- 当前读链路继续使用聚合 `apis[]`
- 写链路仍通过整节点更新间接修改子资源

2. 最小改动边界
- 只切右侧 API 子项写链路
- 不改读链路和初始化逻辑

3. 四层改动
- `api`：新增 3 个原始接口和对应原始类型
- `types`：补稳定类型中的 `id`、`menuId`
- `gateway`：新增 `addFunctionApi/updateFunctionApi/deleteFunctionApi`
- `business`：替换右侧表格的提交函数

4. 字段来源
- `id` 来自新增接口返回体
- `menuId` 来自当前页面节点上下文
