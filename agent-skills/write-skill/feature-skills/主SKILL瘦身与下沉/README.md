# 主SKILL瘦身与下沉

## 作用
控制主 `SKILL.md` 的上下文重量，让主文件继续承担高频规则入口，而不是演化成一整份实现文档。

## 适用场景
- 主 `SKILL.md` 已出现大量示例、案例或 supporting files 细节。
- 主文件每次被激活时都携带过多低频内容。
- 想把内容下沉，但又担心把主文档瘦成空壳。

## 与相邻节点边界
- 它不负责删除层级，只负责下沉内容。
- 若内容下沉后缺少 references / evals，同步进入 `[[../references与evals补全/SKILL.md]]`。
- 下沉完成后需要统一格式，进入 `[[../Markdown格式规范收尾/SKILL.md]]`。

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`
- callback 约束：`[[../../references/write-skill-callback-guardrails.md]]`

## 使用示例
```text
这个主 SKILL.md 太重了，但我又不想把它瘦成只有标题的空壳。
使用 $主SKILL瘦身与下沉 说明哪些内容保留在主文档，哪些内容下沉到 supporting files。
```
