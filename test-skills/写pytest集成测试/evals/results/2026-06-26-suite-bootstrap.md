# Darwin evaluate-only — 套件初建基线

**日期**：2026-06-26  
**模式**：evaluate-only（文档化基线，未对 live Agent 试跑打分）

## 套件自检（结构）

| 检查项 | 结果 |
|--------|------|
| 父 SKILL.md + README | pass |
| intention-skills ×3 | pass |
| feature-skills ×6 | pass |
| references ×4 | pass |
| few-shot ×2 | pass |
| template before/after | pass |
| test-prompts.json ×5 | pass |
| 与 CSV skill 触发词区分 | pass（roadmap 已改名） |

## test-prompts 覆盖

| id | intention | 状态 |
|----|-----------|------|
| crud-new-tenant-test | 策略-补场景用例 | 待试跑 |
| permission-403-scenario | 策略-补场景用例 | 待试跑 |
| new-module-file-whitelist | 策略-新建模块测试文件 | 待试跑 |
| scaffold-empty-tests | 策略-新建模块测试文件 | 待试跑 |
| swagger-migrate-suspend | 策略-迁移存量接口 | 待试跑 |

## 说明

v1 建立评分 rubric 与 prompt 集；**≥10/12** 通过线见 [[evaluate-only-baseline.md]]。  
对 `nebula/seccenter` 实仓试跑需在 Gateway+DB 就绪环境执行，不在本文件伪造分数。
