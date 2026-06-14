# ai-interview-coach 套件级 few-shot

这是一个"从 0 新建 agent skill 套件 + Darwin 多轮迭代优化至收益拐点"的真实案例。完整展示了：从需求分析 → 四层架构搭建 → 子 skill 分层 → Darwin 基线评估 → 4 轮 hill-climbing 优化 → 触顶 break 的全流程。

## 本目录怎么看

- `add-skill/`
  观察从零新建 agent 套件的真实结构：主入口 SKILL.md、intention/feature 子 skill、references、scripts、templates、evals
- `darwin-iteration/`
  观察完整的 Darwin 质量闭环：baseline 评分 → 缺陷诊断 → 逐轮优化 → keep/revert → 收益拐点判断

## 适合被哪些节点复用

- `策略-新建skill`
- `子skill路由决策`
- `主SKILL瘦身与下沉`
- `references与evals补全`
- `Darwin-集成评估闭环`
- `编排-skill质量迭代`

## 数字看板

| 指标 | 值 |
|------|-----|
| 子 skill 总数 | 10（4 intention + 6 feature） |
| Darwin 迭代轮次 | 4 轮 |
| 起始评分 | 69.8/100 |
| 最终评分 | 85.6/100 |
| 总提升 | +15.8 |
| 触顶原因 | 连续 2 轮 Δ < 2 |
| 持续追赶 | 需真实用户测试（full_test） |

## 关键设计决策

1. **四层架构**：intention（编排/分析）→ feature（执行）→ references（知识库）→ scripts（工具）
2. **题库严格只读**：`01-AI万能表达框架-实战面经.md` 只读不写，除非面经沉淀（需 Y/N 人类回环）
3. **幂等打卡**：同一天不重复插入打卡记录
4. **自我迭代**：实跑后自动诊断能力缺口，连续 3 次同一缺口才触发
