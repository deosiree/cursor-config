# Round 0 技能自检（evaluate-only）

**日期**：2026-07-07  
**范围**：技能套件骨架 + apex_dev 文档重构 + 3545/3570/3571 few-shot 对齐

## 产物 12 分制自评

| # | 维度 | 分 | 备注 |
|---|------|---|------|
| 1 | CSV 全量 | 2 | 分析 skill 声明不二次筛选 |
| 2 | mock 路径 | 2 | references + few-shot 含 forward |
| 3 | scenario | 2 | error-scenario 文档齐全 |
| 4 | curl 门禁 | 2 | 质量门禁 + workflow 含 curl |
| 5 | workflow | 2 | 7 节 + pending_human |
| 6 | 用例 README | 2 | 模板 + automation 样例 |
| 7 | mock README | 2 | slim 样例 ≤40 行 |
| 8 | registry | 2 | schema + snippet |
| 9 | 权限门禁 | 2 | 人工门禁已编码 |
| 10 | gitignore | 2 | references 约定 |
| 11 | vite 零改动 | 2 | SKILL 明确禁止 |
| 12 | 误路由 | 2 | 负例 test-prompt |

**总分：12/12** → keep

## test-prompts 覆盖

- mvp-3545-replay ✓
- batch-3570-3571 ✓
- readme-only-negative ✓
- perm-pending-human ✓

## 下一步

Darwin Round 3 终局 87.3/100，HL-4 触顶 → 见 `evals/results/final-report.md`。  
用户传入新 CSV 批次时做 end-to-end 试跑以补强 dim8 live 实证。
