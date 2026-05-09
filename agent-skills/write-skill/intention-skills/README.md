# intention-skills

这里的节点负责判断“当前到底要做哪一类 skill 改造”，而不是直接落具体实现。

## 节点
- `分析-skill现状`
- `策略-新建skill`
- `策略-升级旧skill`
- `迁移-主skill改造为agent`
- `迁移-拆分意图层与功能层`
- `主文档反空心化验收`
- `编排-skill质量迭代`

## 最小套件要求
每个 intention 节点至少应具备：
- `README.md`
- `SKILL.md`
- `template/README.md`
- `assets/few-shot-example/README.md`
- `assets/few-shot-example/SKILL.md`
- `assets/skill-output-checklist.md`
- `references/<node>-notes.md`
- `evals/evals.json`
