---
name: 路由鉴权前缀模糊匹配
description: 【已废弃】请使用 [[../路由鉴权迭代剥离匹配/SKILL.md]]。旧版 fuzzyMatchByPrefix 单次回退已被迭代剥离匹配取代。
---

# 路由鉴权前缀模糊匹配（已废弃）

> **本 skill 已重命名为 `路由鉴权迭代剥离匹配`。**  
> 请使用：`[[../路由鉴权迭代剥离匹配/SKILL.md]]`  
> 权威参考：`[[../../references/route-scope-auth-chain.md]]`

废弃原因：

- `fuzzyMatchByPrefix` 已从 apex_dev 删除
- 新算法为迭代剥离路径 + directory 拒绝 + `fuzzyRejected` 诊断字段；URL 拦截归基座，子应用仅 `load`
- 旧文档中的 opsdeck 行号与算法均已过期
