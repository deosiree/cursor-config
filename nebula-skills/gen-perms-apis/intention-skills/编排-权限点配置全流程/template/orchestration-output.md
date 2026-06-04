# 编排-权限点配置全流程 — 编排输出模板

## 编排目标

- `planningGoal`
- `analysisBasis`

## 候选方案矩阵

### 方案 A：<方案名>

- `planId`
- `planSummary`
- `intentionPath`：分析 → 设计 → 补丁 → 合并 → 改码 → 验证
- `featureSkillSequence`：扫描 → 设计 → 补丁 → 合并 → 集中式改码 → OpenCLI验证
- `changeSurfaceSize`：<小/中/大>
- `beforeChain`：需先产出盘点文档
- `afterChain`：导入菜单树 + 角色配置 + 回归验证
- `verificationPoints`：dry_run 通过 / bypass 有效 / Header 显隐正确
- `risks`：菜单补丁 ID 回填遗漏 / computed 缓存

### 方案 B：<方案名>
...

## 推荐方案

- `recommendedPlan`：方案 A
- `whyRecommended`：覆盖全流程，改动面可控
- `rejectedPlans`：方案 B 缺验证阶段 / 方案 C 缺补丁阶段

## 验证策略

- `verificationStrategy`
- `stopCondition`

## 共享前置条件

- 盘点文档已产出
- 权限设计人工决策已确认
- targetRepo 已指定
