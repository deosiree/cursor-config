---
name: API 分层链路路由 few-shot
description: 给 agent 一个“只判断当前该走新增还是退化 skill”的最小成品示例。
---

# 示例输入
我现在要把新接口接到菜单功能项管理里，但旧 v1 兼容壳也准备下线，应该先用哪个 skill？

# 示例输出骨架
1. 首选
- skill: `api-gateway-add`
- 理由: 先把新接口接入稳定链路，避免退化后还要重新补入口

2. 备选
- skill: `api-gateway-deprecate`
- 理由: 旧兼容层确实相关，但不是第一阻塞项

3. 不推荐
- skill: `route-scatter-check`
- 原因: 当前主轴不是路由散点

4. 执行顺序建议
- 先 `api-gateway-add`
- 业务验证通过后，再执行 `api-gateway-deprecate`

5. 直接执行
- `使用 $api-gateway-add 接入菜单功能项新接口，默认契约为 F:\Documents\Repertory\Sieyuan\nebula\docs\api\seccenter.swagger.json`
