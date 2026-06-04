# 权限设计决策框架

> 完整规则见父级 `[[../../../references/perm-design-rules.md]]`。
> 本文件聚焦本 skill 直接消费的决策流程。

## 设计输入

来自 `扫描源码权限点与API` 的输出：
- 已命中 perm 清单（参考命名约定）
- 未命中但调用 API 的操作（待设计 perm）
- 契约已确认的 API 清单

## 决策流程

```
盘点文档中的"未命中权限控制的权限点"
  → 1. 判断是否需要建 perm
  │    ├─ direct/no-auth → 豁免
  │    ├─ 纯前端状态/路由跳转 → 不建
  │    └─ 有后端 API → 继续
  → 2. 判断粒度
  │    ├─ 整页只有一个入口 → page 级
  │    ├─ 增删改查独立操作 → 操作级
  │    └─ 安全配置 Tab 独立 → 按 Tab 拆分
  → 3. 判断归属
  │    ├─ API 所属模块 = 页面模块 → 直接挂
  │    └─ API 跨模块（如租户调 devmgr）→ 挂在页面模块
  → 4. 命名
  │    └─ <模块缩写>:<资源>:<操作>
  → 5. 输出 perm → API 映射表
```

## 输出：perm → API 映射表

| 权限标识 | 权限名称 | 粒度 | 管控 API | 契约来源 |
|---------|---------|------|---------|---------|
| sys:dashboard:view | 查看首页 | page | POST /seccenter/v2/dashboard/query | seccenter.swagger.json |
| sys:tenant:query | 查询租户 | operation | POST /seccenter/v2/tenant/query | seccenter.swagger.json |
| sys:tenant:add | 新增租户 | operation | POST /seccenter/v2/tenant/add | seccenter.swagger.json |
| sys:tenant:bindDevice | 绑定边端设备 | operation | POST /forward/devmgr/device/activate | devmgr.swagger.json |
