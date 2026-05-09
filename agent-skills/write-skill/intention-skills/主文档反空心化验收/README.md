# 主文档反空心化验收

## 作用
先判断主文档和模板是否已经空心化，再决定回流哪个功能节点修复。

## 适用场景
- 想先判断一个 skill 是“主文档空心”还是“模板空心”。
- `template/after` 只有说明壳，想先做门禁而不是直接补内容。
- `template/` 已有实体样本，但没有说明样本是怎么从历史事实中抽出来的。
- 需要在 Darwin 前先收敛模板实体化问题。

## 与相邻节点边界
- 它只负责意图判定与门禁，不直接重写正文或模板。
- 主文件过重：交给 `[[../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- 缺真实 before：交给 `[[../../feature-skills/真实历史样本型模板-基于RED写before/SKILL.md]]`
- 缺真实 after：交给 `[[../../feature-skills/真实历史样本型模板-基于GREEN写after/SKILL.md]]`
- 缺 few-shot 来源矩阵：交给 `[[../../feature-skills/历史版本回填为few-shot/SKILL.md]]`

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`
- callback 基线：`[[../../../../write-skill-single/SKILL.md]]`

## 使用示例
```text
我现在不想直接补模板，先帮我判断这个节点是主文档空心，还是 template/after 还是说明壳。
使用 $主文档反空心化验收 输出验收结论和回流 feature。
```
