# API 分层链路路由说明

## 这条链路只管什么
只管：

`Swagger/OpenAPI -> src/api 原始接口与原始类型 -> src/types 稳定类型 -> src/gateway 映射与编排 -> 业务层消费`

不管：
- registry / permission metadata
- router / guard / menu / activeRule 散点
- 纯契约浏览

## 路由判定规则
### 命中新增
- 用户要接入新接口
- 用户要新增 gateway 稳定入口
- 用户要补稳定类型或映射
- 用户要评估 `api/types/gateway/business` 四层最小改动

### 命中退化
- 用户确认旧版本接口已下线
- 用户要删除旧兼容层、旧 API、旧测试
- 用户需要根据契约判断哪些可以删、哪些只是命名不一致

### 同时命中
- 默认先新增后退化
- 若旧兼容层已经让现状链路判断失真，可先退化再新增

## 为什么父 skill 不做编排
父 skill 只做判定，避免两个问题：
1. 用户无法在中途按阶段提交 commit
2. agent 容易把“新增设计”和“退化清理”混成一把梭
