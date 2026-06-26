# Darwin dry_run 实测推演（dim8）

对 [[../test-prompts.json]] 6 条 prompt 按优化后 SKILL.md 推演执行质量。

| id | 能否完成意图 | 路由正确 | 输出符合 expectedOutput | 分(1-10) |
|----|:-----------:|:--------:|:----------------------:|:--------:|
| crud-new-tenant-test | ✓ | ✓ | ✓ 有 CRUD feature + 自检 | 8 |
| permission-403-scenario | ✓ | ✓ | ✓ 隔离 feature | 8 |
| new-module-file-whitelist | ✓ | ✓ | ✓ 新建 intention + 策略头 few-shot | 8 |
| scaffold-empty-tests | ✓ | ✓ | ✓ template/after + 三件套 feature | 8 |
| swagger-migrate-suspend | ✓ | ✓ | ✓ 迁移 intention + backlog 契约 | 7 |
| red-stop-missing-facts | ✓ | ✓ | ✓ RED CHECKPOINT STOP | 9 |

**dim8 均值：8.0 → 加权 18.4/23**

## 相对 baseline 提升点

- Round 1：失败兜底表 → swagger/登录失败不瞎写代码
- Round 2：输出模板 → `pytestOutputPlan` 结构稳定
- Round 4：`red-stop` prompt 验证 CHECKPOINT 生效

## 局限（诚实标注）

- **eval_mode=dry_run**，未对 `nebula/seccenter` 实仓跑 pytest
- dim8 满分需 ≥1 条 **full_test**（Gateway+DB 就绪后补跑）

## 建议 full_test 优先级

1. `crud-new-tenant-test` — 最常见 happy path
2. `red-stop-missing-facts` — 验证误触发防护
