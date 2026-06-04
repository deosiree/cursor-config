# 策略-设计权限点 — 设计方案输出模板

## 设计目标

- `designGoal`
- `analysisBasis`（引用盘点文档）
- `targetRepo`

## 人工决策记录

| 决策点 | 选项 | 决策 | 理由 |
|--------|------|------|------|
| 个人中心权限策略 | A/B/C | B：1 个 page 级 perm | 需要入口守卫，不需操作级拆分 |
| 租户跨模块 API | A/B/C | B：独立 perm | 跨模块操作独立性强 |

## 权限设计方案

### 模块：<模块名>

| 权限标识 | 权限名称 | 粒度 | 管控 API | 契约来源 |
|---------|---------|------|---------|---------|
| sys:dashboard:view | 查看首页 | page | POST /seccenter/v2/dashboard/query | seccenter.swagger.json |

### 豁免清单

| 接口 | 豁免原因 | 源码证据 |
|------|---------|---------|
| /direct/seccenter/v2/auth/loginSetting | direct + no-auth | route-channel.ts: DIRECT_AUTH_ACTIONS |

### Hidden Page 方案

| page name | route_path | 子 function |
|-----------|------------|------------|
| 状态管理 | /Apex/_state | sys:state:loginSetting |
| 个人中心 | /Apex/profile | sys:profile:view |

## 待人工裁决

- <仍需要人工确认的项>
