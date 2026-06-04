# Darwin Baseline — opencli-ux-api-whitelist

**模式**: evaluate-only（结构静态评分 + test-prompts 干跑推演，未 spawn 独立 agent full_test）  
**日期**: 2026-06-04  
**Skill 路径**: `自生长的OpenCLI自动化知识体系/opencli-ux-api-whitelist/`

## Runtime 适配性（gate）

```text
grep 红灯措辞 → 无命中（runtime_warn=0）
```

## 9 维评分

| # | 维度 | 权重 | 分/10 | 得分 | 说明 |
|---|------|------|-------|------|------|
| 1 | Frontmatter 质量 | 7 | 9 | 6.3 | name/description 含触发词；should-trigger/not-trigger 齐全；无空话尾巴 |
| 2 | 工作流清晰度 | 12 | 7 | 8.4 | RED/GREEN 路由表 + 三示例清晰；缺编号 Phase0→N 主链路；fallback 多在 references 未入主 SKILL |
| 3 | 失败模式编码 | 12 | 9 | 10.8 | RED 五条 + pitfalls if-then + template/before；卡验证码/并发/滚动容器均有分支 |
| 4 | 检查点设计 | 6 | 5 | 3.0 | 有执行前 checklist，无 🔴/STOP 显性门禁；插种 50 条前缺强制用户确认 |
| 5 | 可执行具体性 | 17 | 9 | 15.3 | URL/profile/testid/脚本参数极具体；示例可直跑 |
| 6 | 资源整合度 | 4 | 6 | 2.4 | scripts/config/template/evals 齐全；**断链** `pitfalls`→`scripts/README-e2e.md`（实为 `references/README-e2e.md`）；无 lib/ |
| 7 | 整体架构 | 12 | 8 | 9.6 | 与 opencli-ux-user-perm 同级套件；intention/feature 分层合理 |
| 8 | 实测表现 | 23 | 7.5 | 17.3 | **dry_run**；见下表 test-prompts 推演 |
| 9 | 反例与黑名单 | 6 | 8 | 4.8 | frontmatter should-not-trigger + evals +「何时不要使用」 |

**总分: 76.5 / 100** — **GOOD**（较迁移前 apex 散落脚本约 +40 分量级）

`eval_mode`: 100% dry_run（维度 8 未跑独立 agent 对比 baseline）

## test-prompts 干跑（维度 8）

| id | 预期路由 | 推演结果 |
|----|----------|----------|
| whitelist-scroll-full | 子 skill → `-BindOnly` → seed oneline → scroll oneline | ✅ Agent 应命中；优于无 skill（不会指向 apex_dev/scripts） |
| whitelist-scroll-skip-seed | `-BindOnly -SkipSeed` | ✅ 意图层「判断执行模式」可解析 |

**相对 baseline（无 skill）**：常误用 8081、q5prwymq、body-wrapper eval、apex 旧路径；本 skill 可显著减少。

## 主要短板（优化优先级，未执行）

| 优先级 | 项 | 预期增益 |
|--------|-----|----------|
| P1 | 修复 `api-whitelist-table-e2e-pitfalls.md` 内 README-e2e 路径 | dim6 +1 |
| P1 | 主 SKILL 增加 🔴 CHECKPOINT：插种前确认环境/租户 | dim4 +2~3 |
| P2 | 主 SKILL 增加 if-then fallback 表（bind 失败/按钮 not_found） | dim2/3 簇 |
| P2 | `test-prompts.json` 追加第 3 条：权限缺失导致按钮不出现 | dim8 覆盖 |
| P3 | 补 `evals/darwin-round1` 或 lib 薄封装（可选） | dim6/7 |

## 结论

write-skill 沉淀目标**已达成**：可独立触发、脚本可复用、RED/GREEN 模板与 evals 齐全。  
进入 Phase 2 优化前建议：先修断链 + 显性 CHECKPOINT；维度 8 需至少 1 次 **full_test**（真实 opencli 跑 `-BindOnly -SkipSeed`）再信分数。
