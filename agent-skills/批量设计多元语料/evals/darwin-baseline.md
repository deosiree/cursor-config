# Darwin Baseline — 批量设计多元语料

> mode: `optimize`（用户要求迭代至 HL-4）  
> eval_mode: `dry_run`  
> target: `agent-skills/批量设计多元语料`（主评父 `SKILL.md`；子 skill 抽检）  
> date: 2026-07-23  
> git: 套件尚为 `??` 未跟踪 → 回滚用 `.bak.YYYYMMDD-HHMM` 备份，非 git revert

## RED 失败基线（优化前）

| 用户说法 | agent 易跳过 | 误触发风险 |
|----------|--------------|------------|
| 继续语料 Goal | 新开空计划、不跑脚本 | 低（路由表已写） |
| 升阈值 | 静默改 MIN_* | 中（需 🔴 仍易漏） |
| 补跨模块 | 只加 atoms/单模块 FAQ | 中 |
| 导出 raw | 宣称导出=PASS | 高（导出 feature 步骤偏软） |

## testPrompts（复用 evals）

1. `continue-goal` — 继续语料 Goal  
2. `raise-thresholds` — 升汉字量/金标阈  
3. `cross-module-mine` — 补 Excel 类跨模块旅程  

## dry_run 推演（baseline）

| id | 期望路由 | 推演 | 缺口 |
|----|----------|------|------|
| continue-goal | 核验 feature | ✅ 路由命中 | 缺「先读 GOALS 最近摘要」硬步骤 |
| raise-thresholds | 分析-缺口 + 🔴 | ✅ | 缺提案表字段级样例 |
| cross-module-mine | 挖掘-跨模块 | ✅ | 缺 journey_id 命名规则示例 |

## baselineScorecard（父 SKILL）

公式：`总分 = Σ(维度分×权重)/10`，维度分 0–10。

| 维度 | 权重 | 分 | 加权/10 | 理由 |
|------|-----:|---:|--------:|------|
| Frontmatter 质量 | 8 | 8 | 6.4 | name/desc 可用；触发词未在 description 穷举 |
| 工作流清晰度 | 15 | 8 | 12.0 | 主链清晰；缺每步退出标准 |
| 边界条件覆盖 | 10 | 8 | 8.0 | RED+fallback 好；误路由表弱 |
| 检查点设计 | 7 | 8 | 5.6 | 4 条 🔴；缺「降阈值」门禁 |
| 指令具体性 | 15 | **6** | **9.0** | Intake 无填值样例；无金标/命令级契约 |
| 资源整合度 | 5 | 9 | 4.5 | 路径可达 |
| 整体架构 | 15 | 8 | 12.0 | 分层清；父文略长但仍可路由 |
| 实测表现 | 25 | 6.5 | 16.25 | 3/3 dry_run 路由对；无独立 A/B |

**总分 baseline：73.8 / 100**

### 子 skill 抽检（非正式加权）

| skill | 估分 | 最弱维 |
|-------|-----:|--------|
| 编排-语料Goal到门禁PASS | ~76 | 指令具体性（缺退出标准样例） |
| 分析-语料缺口与阈值提案 | ~78 | 检查点 OK |
| 核验-门禁脚本与续跑 | ~80 | 较强 |
| 导出-多格式raw与数据集 | ~68 | **指令具体性**（无 jsonl schema/命令） |
| 挖掘-跨模块旅程 | ~75 | 具体性（命名规则） |

## weakestDimensions

1. **指令具体性（6/10）** — 父级 + 导出 feature  
2. **实测表现（6.5/10）** — dry_run 上限，full_test 另议  
3. 工作流退出标准（8/10）

## nextAction

Round 1：只改父 `SKILL.md` 的**指令具体性**（Intake 填值样例 + 续跑命令 + 输出一行模板 + description 触发词）。
