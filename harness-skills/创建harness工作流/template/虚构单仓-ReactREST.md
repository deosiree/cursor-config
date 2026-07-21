# 模板：虚构单仓 React + REST（填空成品）

本文件是**无 Nebula 耦合**的最小 harness 骨架示例。创建真实项目时替换括号内容。

---

## AGENTS.md（节选）

```markdown
# Agent Instructions — {ProjectName}

## 本仓是什么
单仓 Web：React 前端 + 同仓 REST API（或 BFF）。

| 项 | 值 |
| --- | --- |
| 启动 | `{npm run dev}` |
| 检查 | `{npm run typecheck}`；单测 `{npm test}` |
| API 契约 | `{docs/openapi.yaml}` |

## 负责人主域
| 主题 | 路径 |
| --- | --- |
| {认证与会话 UI} | `{src/features/auth/}` |
| {订单} | `{src/features/orders/}` |

非上表主域：改前确认是否本任务范围。

## 硬约束
- 契约字段以 `{docs/openapi.yaml}` 为准，禁止臆造。
- 一次需求先标 `surface=`（见 FEATURE_INTAKE）。

### 🔴 CHECKPOINT
- `surface=` 不清或跨 ≥2 模块 → 先问人。
- 改本文件 / FEATURE_INTAKE / ADR / Eval 题面 → 跑 `{npm run harness:smoke}`。

## 不要做什么
1. 不要把假目录 `{app/domain/}` 当业务源码。
2. 不要盲升领域 skills 压过本文件。
3. 不要自评 DONE 而无测试/脚本外证。
```

## docs/FEATURE_INTAKE.md（节选）

```markdown
# 需求分拣
1. 判定车道：tiny / normal / high-risk
2. 标定 surface= `{auth|orders|api|harness-meta|...}`
3. 跨 surface → 拆 story 或问人
```

## docs/ARCHITECTURE.md（节选）

```markdown
# 架构地图
- 前端：`{src/}`
- API：`{server/}` 或 `{src/server/}`
- 契约：`{docs/openapi.yaml}`

## 负责人主域与排查范围
（与 AGENTS 表一致；业务 bug 默认只盯主域。）
```

## docs/QUALITY_LOOP.md（节选）

```markdown
# 质量 Loop
- L0：`{npm run typecheck}`
- L1：相关单测；没有则先补再跑
- L2：UI/集成用 `{npx playwright test}` 或仓内等价脚本；无则先补可重复步骤
- 禁自评 DONE；tiny 不做对抗审查与重量级 E2E
```

## docs/HARNESS_REVIEW.md（节选）

```markdown
# 审查导览
| 模块 | 权威 |
| Task | AGENTS + FEATURE_INTAKE |
| Environment | ARCHITECTURE |
| Tools | （工具登记或 README） |
| Trace | （可选） |
| Grader | evals/ |
| 质量 Loop | QUALITY_LOOP.md |
```

将以上 `{…}` 全部换成目标仓真实值后，即完成 P0 + 部分 P1 骨架。  
