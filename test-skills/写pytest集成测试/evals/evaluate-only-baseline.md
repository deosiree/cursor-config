# Darwin evaluate-only 基线

**模式**：`evaluate-only` — 只评分与记录，**不**自动优化 SKILL 正文、不进入 keep/revert 改写循环。

## 何时触发

- `质量-集成测试自检` 通过后
- 用户显式要求「评估集成测试 skill 产出」
- 新 few-shot / 子 skill 落地后的回归

## 评分维度（每项 0–2，满分 12）

| 维度 | 2 分 | 0 分 |
|------|------|------|
| **命名合规** | `test_*.py` / `Test*` / `test_*` 符合 pytest.ini | 命名混乱或冲突 |
| **中文 docstring** | 文件 + 类 + 方法均有 | 任一层缺失 |
| **清理与 TEST_AUTO_** | 显式 teardown + 唯一测试数据 | 无清理或硬编码 id |
| **断言链** | `assert_success` + `unwrap` + 字段断言 | 仅 status_code |
| **无 mock 泄漏** | 无业务 HTTP mock | 出现 unittest.mock patch |
| **环境可配置** | BASE_URL/凭证走 env | 硬编码生产地址 |

## 通过线

- **≥10/12**：记录 baseline，可进入后续全量 Darwin 迭代（若用户授权）
- **8–9**：保留产出，补 violations 后重评
- **<8**：`keepOrRevertRule` → **回退**到 [[../assets/few-shot-example/租户CRUD最小样本/SKILL.md]] 模板重写，不改父 SKILL

## 试跑流程

1. 从 [[test-prompts.json]] 取一条 `prompt`
2. 按 [[../SKILL.md]] RED → intention → feature 执行
3. 跑 `质量-集成测试自检` 清单
4. 填下表写入 `evals/results/{id}-{date}.md`（目录首次评估时创建）

```markdown
## {id}
- score: /12
- violations: [...]
- keep: yes|no
- notes: ...
```

## 与 write-skill Darwin 关系

- 全量优化 → 见 [[results/final-report.md]]（2026-06-26 终局 **86.9 分**，HL-4 收手）
- 全量优化历史 → [[results/darwin-results.tsv]]
- 本文件 **12 分 rubric** 评的是 **产出代码**；Darwin **100 分 rubric** 评的是 **SKILL.md 套件**

## Baseline 记录（v1 初始）

| 日期 | 说明 |
|------|------|
| 2026-06-26 | 套件初建；test-prompts 5 条 |
| 2026-06-26 | Darwin 6 轮优化终局 **86.9 分** → [[results/final-report.md]] |

试跑命令示例（人工）：

```text
使用 $写pytest集成测试，按 evals/test-prompts.json 的 crud-new-tenant-test 执行并 evaluate-only 打分。
```
