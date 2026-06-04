# 路由-选择功能子skill — 路由输出模板

## 路由目标

- `routingGoal`

## 当前缺口分类

- `currentGapClassification`

## 候选功能 skill

| 功能 skill | 适用条件 | 选择/排除 |
|-----------|---------|----------|
| 扫描源码权限点与API | 尚未有盘点文档 | ← 选择 |
| 设计权限点与API映射 | 已有盘点 | 排除：盘点未产出 |
| 生成菜单树权限补丁 | 设计已确认 | 排除：设计未开始 |

## 选择

- `selectedFeatureSkill`：扫描源码权限点与API
- `whyThisFeatureSkill`：当前无盘点文档，必须先产出事实基础
- `whyNotOtherFeatureSkills`：其他功能 skill 均依赖盘点结果

## 前置条件

- 确认仓库路径
- 确认 API 契约路径

## 返回条件

- 盘点文档产出后，返回父 agent 或进入策略-设计权限点
