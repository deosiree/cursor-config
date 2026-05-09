# Few-shot Index

本节点的 few-shot 重点不是“如何改代码”，而是“如何在事实不足时先把链路分析做完整”，并让后续意图节点可以直接消费分析结论。

当前主 few-shot 来源：

- `template/microfb-i18n-chain.md`

抽取重点：

- 如何画出最小可用 `sequenceDiagram`
- 如何把参与者、变量、函数、文件落到源码锚点
- 如何产出 `chainConfidence`、`legacyPresenceAssessment`、`newI18nReadinessAssessment`
- 如何给出 `candidateNextIntentions`
