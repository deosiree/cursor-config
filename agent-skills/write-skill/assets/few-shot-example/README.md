# few-shot 索引

当前 `写skill` 默认复用三类正式案例。

## 1. 套件级真实案例

- `[[suite-cases/gen-README/README.md]]`
- `[[suite-cases/i18n-server/README.md]]`
- `[[suite-cases/ai-interview-coach/README.md]]` ← 从0新建+Darwin4轮迭代标杆

这两类目录里已经直接放入真实实现片段，而不再只是说明文档。

## 2. Darwin 质量闭环案例

- `darwin-skill`

它的真实试跑样例已经被分发到：

- `intention-skills/编排-skill质量迭代/assets/few-shot-example/example-01`
- `feature-skills/darwin质量评估与迭代/assets/few-shot-example/example-01`

## 3. 写 skill + Darwin 集成闭环案例

当需要"新建 skill + 自动接入 Darwin 评估"时，参考以下完整流程：

```
1. 策略-新建skill → 判断新建路径
2. 子skill路由决策 → 选择最少必要子skill
3. 编写 SKILL.md（RED + GREEN 流程）
4. 模板类型判定 → 确定 before/after/mvp/snapshot
5. 编写 template/ 和 assets/
6. references与evals补全 → 补充 references 和 evals
7. Darwin-集成评估闭环 → 自动接入 Darwin 评估
8. Markdown格式规范收尾 → 统一格式
```

输出产物：SKILL.md + intention-skills/ + feature-skills/ + template/ + references/ + evals/ + Darwin results.tsv

**真实标杆**：`[[suite-cases/ai-interview-coach/README.md]]` — 从0新建到Darwin 4轮迭代完整记录（起始69.8→终分85.6）

## 4. 子skill 局部 few-shot

每个 intention / feature 节点都应在自己的：

- `assets/few-shot-example/example-01/`

下提供局部真实片段，不再只依赖顶层索引。

对应方法说明见：

- `[[../references/旧skill升级为agent-skill案例说明.md]]`
- `[[../references/意图层与功能层拆分案例说明.md]]`
- `[[../references/darwin评估闭环案例说明.md]]`
