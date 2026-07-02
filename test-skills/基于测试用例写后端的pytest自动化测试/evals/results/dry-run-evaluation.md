# Darwin dry-run 推演（CSV hytests skill）

**模式**：dry_run — 对照 `test-prompts.json` 与 seccenter/hytests 黄金样本推演 Agent 行为  
**日期**：2026-07-02

## 推演方法

1. 读 [[../SKILL.md]] RED → intention → feature 路由
2. 对照 `nebula/seccenter/hytests` 已有实现
3. 按 Darwin 9 维 dim8「实测表现」打分（1–10）

---

## mvp-menu-export

**Prompt**：caseIds=9909-9913，deliverables=all

| 检查项 | 推演结果 |
|--------|----------|
| intention | `策略-从CSV写MVP用例` ✓ |
| features | csv_case + registry + gen_readme + 覆盖率 ✓ |
| 产物 | `test_mvp_menu_9909_9913.py` 已存在，5 marker ✓ |
| README | [9909] 实现位置 L25/L26 ✓ |
| 误路由 | 不会写 tests/ 替代 ✓ |

**dim8 分**：9/10（缺 full_test 实跑 pytest 扣 1）

---

## batch-auth-whitelist

**Prompt**：9919-9924 批量补

| 检查项 | 推演结果 |
|--------|----------|
| intention | `策略-批量补自动化` ✓ |
| 产物 | test_csv_auth.py / test_csv_whitelist.py ✓ |
| registry | 9919–9924 implemented ✓ |

**dim8 分**：9/10

---

## readme-only-fix

**Prompt**：deliverables=readme，修 Obsidian 格式

| 检查项 | 推演结果 |
|--------|----------|
| intention | `策略-仅生成README` ✓ |
| 禁止项 | 不改 test_*.py ✓ |
| 格式 | gen_readme 无 details ✓ |

**dim8 分**：10/10（round0 已验证 450 cases 生成）

---

## blocked-session-sdk

**Prompt**：9971-9976 blocked

| 检查项 | 推演结果 |
|--------|----------|
| marker + skip | test_csv_session_sdk.py ✓ |
| README 实现位置 | L5/L7 无测试类行（可接受）✓ |
| status | blocked ✓ |

**dim8 分**：8/10

---

## misroute-guard

**Prompt**：CSV 155 写 test_04_menu.py 官方套件

| 检查项 | 推演结果 |
|--------|----------|
| 拒绝/路由 | HL-2 + 反模式「用户要 test_NN 却写 hytests」✓ |
| 正确指引 | 写pytest集成测试 vs 本 skill 边界 ✓ |

**dim8 分**：9/10

---

## observability-9910（Round 6 新增）

**Prompt**：9910 必须 case_report + automation_doc + latest.log

| 检查项 | 推演结果 |
|--------|----------|
| intention | `策略-批量补自动化` ✓ |
| features | csv_case + 接入-用例验证摘要 + registry + README + G6 ✓ |
| 路由 | 主 SKILL feature 表含「接入-用例验证摘要与中文终端」✓ |
| 规范 | case-report-terminal-spec + pitfalls 可达 ✓ |
| 黄金样本 | 9909 已完整接入；9910 为迁移 backlog（skill 已写清单）△ |

**dim8 分**：8/10（路由与规范完备；9910 实码未迁移扣 1；无 full_test 扣 1）

---

## dim8 汇总

| promptId | dim8 |
|----------|------|
| mvp-menu-export | 9 |
| batch-auth-whitelist | 9 |
| readme-only-fix | 10 |
| blocked-session-sdk | 8 |
| observability-9910 | 8 |
| misroute-guard | 9 |

**平均 dim8**：8.83 → 加权 20.3/23

## full_test 缺口（P0）

在 Gateway 环境对 `pytest test_mvp_menu_9909_9913.py -k 9909 -v` **实跑 1 次**，可将 dim8 上限从 dry_run 推到 full_test 可信区间。详见 [[final-report.md]]。
