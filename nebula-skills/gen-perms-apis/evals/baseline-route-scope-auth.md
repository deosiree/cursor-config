# Darwin Baseline：路由作用域鉴权改造前

> 记录时间：2026-07-03  
> 对照提交：`apex_dev` `1851a7dd`（fix(services): 鉴权链路更新为路由路径+路由参数+权限标识）

## 基线结论

| 维度 | 改造前状态 | 风险 |
|------|-----------|------|
| 鉴权真相源文档 | 缺失 `route-scope-auth-chain.md` | agent 无权威参考 |
| 运行时排障口径 | 12+ 处仍以 `permsMap` / `hasPermissionBypass` 为主 | 排障方向错误 |
| 菜单 YAML 规范 | page 节点无 `params` 消歧说明 | 同路径多页面 ambiguous |
| 新模块编排 | 无专用 intention 节点 | 用户说「新模块配置」易走旧全流程 |
| evals 覆盖 | 0 条路由作用域用例 | 无法回归 RoutePermDict |
| RoutePermDict 引用 | 套件内 0 处 | 与 apex_dev 源码脱节 |

## permsMap 误引用分布（改造前）

| 文件 | 引用次数 | 类型 |
|------|---------|------|
| `references/perm-runtime-debugging.md` | 2 | 核心链路 + 根因 |
| `feature-skills/权限运行时排障/SKILL.md` | 3 | 决策树 + 对照表 |
| `feature-skills/权限运行时排障/references/diagnostic-tree.md` | 4 | 控制台命令 |
| `feature-skills/OpenCLI双会话权限验证/SKILL.md` | 1 | sessionStorage 说明 |
| `feature-skills/OpenCLI双会话权限验证/references/dual-session-procedures.md` | 4 | eval 脚本 + 对照表 |
| `feature-skills/OpenCLI双会话权限验证/assets/few-shot-e2e.md` | 3 | few-shot |
| `feature-skills/OpenCLI端到端验证/template/verification-checklist.md` | 1 | 验收清单 |
| `feature-skills/双会话OpenCLI环境初始化/SKILL.md` | 1 | 环境初始化 |
| `intention-skills/编排-权限E2E测试/references/e2e-orchestration-strategy.md` | 1 | checkHasPerm 公式 |
| `feature-skills/菜单管理功能项依赖链验证/SKILL.md` | 1 | 维护说明 |

## evals 缺口（改造前）

- `should_trigger` 共 18 条，**无**「新模块配置」「route params 消歧」「RoutePermDict 排障」类用例
- 排障类 eval（`权限运行时排障`）expect 仅覆盖 isOwner / computed / parent_id，**未**要求 RoutePermDict 口径
- 父 agent 路由表**无** `编排-新模块权限配置` 入口

## 改造目标（GREEN 验收线）

1. `permsMap` 仅出现在 `before-03` 历史对比，不作为 `checkHasPerm` 真相源
2. 新增 4 条路由作用域 eval，trial 通过率 100%
3. 父 agent 核心约束 #7 声明路由作用域鉴权
4. 新模块 prompt 稳定路由到 `编排-新模块权限配置`
