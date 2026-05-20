---
name: after 示例
description: 新增接口接入后的目标设计示意。
---

# 目标设计
1. `src/api/**`
- 新增契约同名原始类型
- 新增原始接口方法

2. `src/types/**`
- 补稳定类型字段 `id`、`menuId`

3. `src/gateway/**`
- 新增 `addFunctionApi/updateFunctionApi/deleteFunctionApi`
- 新增 `mapWire2StableXXX` / `mapStable2WireXXX`

4. 业务层
- 只替换右侧 API 子项提交函数
- 成功后复用现有刷新逻辑
