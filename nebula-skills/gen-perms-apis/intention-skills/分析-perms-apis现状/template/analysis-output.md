# 分析-perms-apis现状 — 输出模板

## 分析目标

- `analysisGoal`
- `repoScanned`
- `contractsUsed`
- `focusApplied`

## 路由清单

| routePath | 页面组件 | 子孙组件数 | 已命中 perm | 未命中交互 |
|-----------|---------|-----------|-----------|-----------|
| /Apex/dashboard | src/views/dashboard/index.vue | 5 | 1 | 0 |
| /Apex/tenant | src/views/tenant/index.vue | 8 | 4 | 3 |

## 关键发现

| 发现 | 严重度 | 说明 |
|------|--------|------|
| 租户页调 devmgr API 无 perm | 高 | BindDeviceDialog 无入口守卫 |
| loginSetting 走 direct/no-auth | 信息 | 已豁免，建议登记到 hidden page |

## chainConfidence

- `high` / `medium` / `low`
- 依据：<说明>

## candidateNextIntentions

1. `策略-设计权限点`：为未命中交互设计 perm
2. `编排-权限点配置全流程`：进入全流程方案
3. ...

## 分析阻断未知项

- <需要人工确认或补充的信息>
