# 样例：Nebula Meta-Workspace（few-shot）

> **用途：** 展示「方法论如何被某一项目填实」。  
> **禁止：** 把下列业务事实当成其他仓库的必拷规则。迁到目标仓时，只保留左侧「方法论槽位」，右侧全部改写。

## 方法论槽位 → 本样例填法

| 方法论槽位 | 本样例填法（勿照搬） |
| --- | --- |
| 仓拓扑 | Meta-Workspace：基座 / 多子应用 / Go 后端 / 文档仓并列 |
| 工作表面 | `surface=` 分拣到具体子仓；跨仓 🔴 CHECKPOINT |
| 负责人主域 | 维护者日常前端主战场写进 AGENTS + ARCHITECTURE；非主域先确认 |
| 契约 SSOT | 人类资产下的 swagger 为业务 API 真相源；入口文档指向它 |
| 会话/鉴权约束 | 本产品选定 Cookie-Session；宪法禁止擅自改会话模型（**这是产品决策，不是通用 harness 真理**） |
| 命名陷阱 | 包名与微前端注册名不一致时，以注册名/路由为准（**项目事实**） |
| L0 验证 | 各子仓 `pnpm type-check` 等写在子仓 AGENTS |
| L1 / L2 | 单测 + 项目自有 UI/矩阵脚本；无则先补再 DONE |
| 改宪法门禁 | `node evals/scripts/ci-smoke.mjs`；人工/Agent 触发，不加自动 hook |
| 审查导览 | `docs/HARNESS_REVIEW.md` 五模块 + 心智索引 + 写入流程 |
| 质量 Loop | `docs/QUALITY_LOOP.md` 证据阶梯、对抗审查、停条件 |
| Skills 分层 | 宪法 > 领域 skills > write/darwin；禁盲升 |
| 提交边界 | 业务 commit 在子仓；父 harness 目录不 push |

## 读者改写检查

迁出本样例后，目标仓产物中若仍出现本表右侧专有名词，且不是「对比说明」，则迁移失败——回到幕1重填。  
