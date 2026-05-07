---
name: after 示例
description: 路由判定后的推荐输出示意。
---

# 推荐输出
1. 首选
- skill: `api-gateway-add`
- 理由: 当前第一任务是接入新接口

2. 备选
- skill: `api-gateway-deprecate`
- 理由: 旧兼容层需要清理，但应放在接入完成后

3. 不推荐
- skill: `route-scatter-check`
- 原因: 当前不是路由散点问题

4. 执行顺序建议
- 先 `api-gateway-add`
- 再 `api-gateway-deprecate`
