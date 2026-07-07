# Darwin dry-run 推演（mock 异常 UI skill）

**模式**：dry_run — 对照 `test-prompts.json` 与 `apex_dev/hytests` 黄金样本推演 Agent 行为  
**日期**：2026-07-07

## 推演方法

1. 读 [[../SKILL.md]] RED → intention → feature 路由
2. 对照 `nebula/apex_dev` 已有 gitignored 实现（3545/3570/3571）
3. 按 Darwin 9 维 dim8「实测表现」打分（1–10）

---

## mvp-3545-replay

**Prompt**：csvPath 含 3545，deliverables=all

| 检查项 | 推演结果 |
|--------|----------|
| intention | `策略-新增异常Mock用例` ✓ |
| features | mock + registry + readme + scenario + 门禁 ✓ |
| mock 路径 | `forward/seccenter/v2/user/list` ✓ |
| workflow | `hytests/docs/workflow.md` 7 节 ✓ |
| mock README | `mock/README.md` ≤40 行 ✓ |
| 误路由 | 不写 pytest ✓ |

**dim8 分**：9/10（缺 full_test 实跑 curl 扣 1）

---

## batch-3570-3571

**Prompt**：caseIds=3570,3571

| 检查项 | 推演结果 |
|--------|----------|
| mock | role/create 40901、role/list 50001 ✓ |
| scenario | active 可切换 ✓ |
| automation | 两文件独立链 workflow ✓ |

**dim8 分**：9/10

---

## readme-only-negative

**Prompt**：只润色 README，不要 mock

| 检查项 | 推演结果 |
|--------|----------|
| 拒绝/不触发 | 反模式「仅润色却改 mock」✓ |
| 路由 | 不应进入 GREEN ✓ |

**dim8 分**：10/10

---

## perm-pending-human

**Prompt**：3465 权限不确定

| 检查项 | 推演结果 |
|--------|----------|
| perm_status | pending_human ✓ |
| 浏览器 | blocked ✓ |
| mock/curl | 可先交付 ✓ |
| AskQuestion | HL-2 兜底表 ✓ |

**dim8 分**：9/10

---

## dim8 汇总

| prompt | 分 |
|--------|---:|
| mvp-3545-replay | 9 |
| batch-3570-3571 | 9 |
| readme-only-negative | 10 |
| perm-pending-human | 9 |

**平均**：9.25 → dim8 取 **9/10**（加权 20.7/23）

## 与 apex_dev 产物对照

| 产物 | 存在 | 符合 skill |
|------|------|------------|
| `mock/csv-error.mvp.mock.ts` | ✓ | forward 路径、scenario 分支 |
| `hytests/docs/workflow.md` | ✓ | 7 节 + 注入脚本 |
| `hytests/docs/automation/3545.md` | ✓ | 链 workflow + curl |
| `mock/README.md` | ✓ | 瘦索引 |
| `cases_registry.yaml` | ✓ | schema 完整 |

**结论**：dim8 支持 Round 2 总分 ≥85。
