---
name: 路由-选择功能子skill
description: 当当前目标已收敛到"这一步该进入哪个源码级功能 skill"，并需要在必要时借助链路分析辅助判断时使用。
---

# 路由-选择功能子skill

## RED

- 没有本节点时，agent 容易在"当前一步选哪个功能 skill"问题上：
  - 直接给总方案
  - 直接进入源码实现
  - 或在 gap 不明确时硬猜功能节点

## GREEN

- 本节点只做单次功能路由
- gap 明确时直接选节点
- gap 不明确但仍属于单步功能路由时，可先消费 `[[../分析-perms-apis现状]]`
- 输出必须包含主节点、备选节点排除理由和返回条件

## 当前能力缺口分类

1. `no_scan_yet` — 尚未产出盘点文档
2. `scan_complete_design_needed` — 已有盘点，需要设计权限点
3. `design_complete_patch_needed` — 设计已确认，需要生成菜单补丁
4. `patch_generated_merge_needed` — 补丁已生成，需要合并菜单树
5. `design_complete_code_needed` — 设计已确认，需要改源码
6. `code_changed_verify_needed` — 源码已改，需要端到端验证
7. `menu_patch_import_needed` — 菜单补丁需要导入验证
8. `runtime_permission_bug` — 权限运行时异常需要排障
9. `single_step_unclear` — 当前一步不明确
10. `e2e_verify_needed` — 需要通过双会话做 E2E 验证（通用 perm 循环）
11. `e2e_menu_scenarios` — 菜单管理 8 场景矩阵 / 功能项依赖链验证
12. `csv_output_needed` — 验证结果需要落盘 CSV

## 工作流

1. 判断当前 gap 是否可直接识别
2. 若不可直接识别，但仍属于单次功能路由问题，先引用 `[[../分析-perms-apis现状]]` 的事实
3. 产出 `candidateFeatureSkills`
4. 选择 `selectedFeatureSkill`
5. 给出排除理由、前置条件与返回条件

## 路由规则

- 尚未扫描源码 → 进入 `[[../../feature-skills/扫描源码权限点与API]]`
- 已有盘点，需要设计权限点 → 进入 `[[../../feature-skills/设计权限点与API映射]]`
- 设计已确认，需要生成菜单 YAML 补丁 → 进入 `[[../../feature-skills/生成菜单树权限补丁]]`
- 补丁已生成，需要与已有菜单树合并 → 进入 `[[../../feature-skills/合并权限点到菜单树]]`
- 设计已确认，需要按集中式原则改源码 → 进入 `[[../../feature-skills/源码集中式权限改动]]`
- 源码已改，需要通过 SSH + OpenCLI 验证 → 进入 `[[../../feature-skills/OpenCLI端到端验证]]`
- 菜单补丁需要导入测试 → 进入 `[[../../feature-skills/菜单树导入验证]]`
- 权限运行时异常需要排查 → 进入 `[[../../feature-skills/权限运行时排障]]`
- 需要 OpenCLI 双会话执行单轮权限配置+验证 → 进入 `[[../../feature-skills/OpenCLI双会话权限验证]]`
- 菜单管理 8 场景 E2E / 功能项依赖链 / 跑 S1~S8 → 进入 `[[../../feature-skills/菜单管理功能项依赖链验证]]`（**首选 node 脚本**，非手操 opencli）
- 双会话环境首次搭建（profile 预检、双登录）→ 进入 `[[../../feature-skills/双会话OpenCLI环境初始化]]`
- 仅需在角色弹窗内快速勾选某页面功能项（非完整 E2E）→ 进入 `[[../../feature-skills/角色菜单权限树快速配置]]`
- 验证结果需要落盘为 CSV → 进入 `[[../../feature-skills/权限测试结果落盘CSV]]`

## 输出

每轮至少输出：

- `routingGoal`
- `currentGapClassification`
- `candidateFeatureSkills`
- `selectedFeatureSkill`
- `whyThisFeatureSkill`
- `whyNotOtherFeatureSkills`
- `prerequisites`
- `expectedArtifacts`
- `returnToParentWhen`

## Guardrails

- 一次只推荐 1 个主功能 skill
- 若问题已上升为策略或总编排问题，返回父 agent 或引导进入 `编排-权限点配置全流程`
- 不允许把多节点执行序列伪装成单次功能路由

## REFACTOR

- 若路由变为猜谜（不读分析直接猜功能节点），收紧：「gap 不明确时必须先消费分析-perms-apis现状」
- 若多节点执行序列被伪装成单次路由，补「一次只推荐 1 个功能 skill」的强制约束
- 若问题已上升到编排级别仍被路由到功能节点，补「应返回父 agent 或编排节点」的升级条件
- 若 `whyNotOtherFeatureSkills` 缺失，补排除理由的强制输出

## 使用示例

```text
我只想知道当前一步该进扫描、设计、补丁还是改码。
```

```text
gap 还不完全明确，但我仍然只想收敛到一个当前最优先的功能节点。
```

```text
如果这个问题其实已经需要总编排，请不要硬路由，直接告诉我该切到哪个意图 skill。
```

```text
直接用菜单管理跑一遍 E2E，8 个场景全过一遍。
```

预期：进入 `菜单管理功能项依赖链验证`，执行 `scripts/run-all.node.js`
