---
name: 达尔文式技能优化
description: 当需要评估、对比、逐轮优化一个或一组 SKILL.md，并通过基线评分、测试提示词、受控试跑与 git 棘轮机制只保留改进时使用。适用于“优化skill”“skill评分”“仅评估不改”“自动优化skill”等场景。
---

# 目标
把 skill 优化从“拍脑袋改文案”收敛成可复盘实验：先做基线评估，再做单点改进，最后用 keep / revert 机制只保留可验证的提升。

## 何时使用
- 需要评估一个 skill 的质量，并给出结构短板与试跑建议。
- 需要对一个或一组 SKILL.md 做逐轮优化，而不是一次性重写。
- 需要把“带 skill / 不带 skill”的效果差异固化为可追踪记录。

## 何时不要使用
- 只是想新建 skill 套件，没有现成 target skill 需要评分或优化。
- 只是想做普通代码 review、文档润色、README 排版。
- 没有 target SKILL.md，只有模糊想法。

## 输入契约
调用时至少提供：
- `targetSkillPath` 或可发现的目标范围
- `mode`
  - `evaluate-only`
  - `controlled-trial`
  - `optimize`
- `scope`
  - 单个 skill
  - 多个 skill
- 是否允许 git 提交与回滚

如未提供路径，先按以下顺序发现：
1. 用户显式给出的绝对路径或目录
2. 当前仓库下的 `.cursor/**/SKILL.md`
3. 当前仓库下的 `.claude/**/SKILL.md`
4. 已知 skills 根目录下的 `**/SKILL.md`

## 核心约束
- 不改变 target skill 的核心用途，只优化写法、触发、流程和验证材料。
- 第一轮默认只做 `evaluate-only` 或 `controlled-trial`，不要直接全量自动优化。
- 每轮只改一个最低分维度，避免无法归因。
- 改进后总分必须严格高于旧分才保留；否则回滚。
- 优先 `git revert`，禁止 `reset --hard`。
- 如果没有 git，可退化为带时间戳的文件备份，但必须显式告知用户。
- 维度 8“实测表现”优先用独立子 agent；做不到时允许 `dry_run`，但必须标注。

## RED：先做失败基线
1. 读取 target `SKILL.md`、相邻 `README.md`、模板与资产目录，确认当前套件形态。
2. 记录没有优化前的失败基线：
   - 用户会怎么提需求
   - agent 会跳过哪些关键步骤
   - 哪些触发词会误触发
   - 哪些输出结构不稳定
3. 为每个 target skill 生成或复用 2-3 条测试提示词：
   - 典型 happy path
   - 一个稍复杂或含歧义的场景
4. 产出基线材料：
   - `test-prompts.json`
   - 基线评分
   - 最弱维度与原因

如果没有失败基线，不进入优化循环。

## GREEN：执行受控优化
### A. 先做基线评估
按 8 个维度给基线分，并记录：
- 结构评分：Frontmatter、工作流、边界、检查点、具体性、资源整合、整体架构
- 效果评分：实测表现

### B. 首轮受控试跑
首轮默认采用以下门槛：
1. 只选 1 个 target skill
2. 只跑 `evaluate-only` 或 `controlled-trial`
3. 优先 `dry_run` 或 baseline，不直接进入自动 commit / revert

### C. 进入优化循环
当且仅当首轮试跑稳定后，再进入逐轮优化：
1. 找出最低分维度
2. 只提出 1 个针对性改动
3. 编辑 target `SKILL.md`
4. 重新评估：
   - 结构维度重打分
   - 效果维度重新跑测试提示词或 `dry_run`
5. 判定：
   - `new_score > old_score`：保留
   - 否则：回滚
6. 展示给用户：
   - diff 摘要
   - 分数变化
   - 下一轮是否继续

## REFACTOR：收敛触发与验证资产
当出现以下问题时，不要继续堆正文，先修资产：
- 误触发多：收紧 frontmatter 与适用场景
- 不触发：补典型触发词和 should-trigger
- 输出结构漂移：补 `template/` 与 `assets/few-shot-example/`
- 评分口径不稳：补 `evals/evals.json`
- 路径写死：下沉到 `[[references/darwin-methodology.md]]` 的兼容策略

## 8 维评分口径
| 维度 | 权重 | 最低可接受信号 |
|---|---:|---|
| Frontmatter 质量 | 8 | `name`、`description` 语义明确，触发词足够 |
| 工作流清晰度 | 15 | 步骤线性可执行，输入输出清楚 |
| 边界条件覆盖 | 10 | 有异常处理、fallback、暂停点 |
| 检查点设计 | 7 | 关键决策前有人工确认 |
| 指令具体性 | 15 | 有格式、参数、样例，不是空话 |
| 资源整合度 | 5 | 引用的模板、脚本、references 可达 |
| 整体架构 | 15 | 套件分层清晰，主文件不过重 |
| 实测表现 | 25 | 带 skill 明显优于 baseline，或 dry run 推演成立 |

总分计算、示例与结果卡片说明见 `[[references/darwin-methodology.md]]`。

## 输出契约
每次运行至少输出：
- `targetSkills`
- `mode`
- `testPrompts`
- `baselineScorecard`
- `weakestDimensions`
- `evalMode`
  - `full_test`
  - `dry_run`
- `nextAction`

如果发生修改，还要输出：
- `diffSummary`
- `keepOrRevert`
- `resultsRecord`

## 资源入口
- 维护说明：`[[README.md]]`
- 受控试跑模板：`[[template/受控试跑/README.md]]`
- few-shot 入口：`[[assets/few-shot-example/README.md]]`
- 方法论细节：`[[references/darwin-methodology.md]]`
- 检查清单：`[[assets/skill-output-checklist.md]]`
- 触发验证：`[[evals/evals.json]]`

## 使用示例
### 示例 1：仅评估不改
```text
使用达尔文式技能优化评估 F:\Documents\Repertory\Sieyuan\nebula\.cursor\nebula-skills\gen-perms-apis\SKILL.md，
只做 baseline 评分和测试提示词设计，不要修改文件。
```

### 示例 2：受控试跑
```text
使用达尔文式技能优化对 .cursor/md-skills/gen-README/SKILL.md 做一次受控试跑，
只跑 1 个 skill，允许 dry_run，不直接进入自动回滚闭环。
```

## 常见错误
- 一上来就“优化所有 skills”
- 还没做 baseline 就直接改正文
- 同一轮同时改多个维度
- 把 README 式展示内容堆回主 `SKILL.md`
- 只说“实测更好”，却没有 `test-prompts` 或 `results.tsv`
