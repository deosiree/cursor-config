# 模板类型判定

## 作用
判断当前能力应该用哪一种模板模型，并把人类或 agent 直接路由到真实模板。

## 输出

- `add-skill`
- `update-skill`
- `human-requested-new-model`

## 当前真源

- 新增型模板：`[[template/add-skill/README.md]]`
- 更新型模板：`[[template/update-skill/README.md]]`

## 边界

它负责“判模型”，不负责单独新增一个只服务新增型的执行节点。
新增型或更新型真正的内容落地，继续由：

- `[[../主SKILL瘦身与下沉/SKILL.md]]`
- `[[../references与evals补全/SKILL.md]]`
- `[[../历史版本回填为few-shot/SKILL.md]]`
- `[[../Markdown格式规范收尾/SKILL.md]]`

这些通用 feature 组合完成。

## 使用示例
```text
这个 skill 看起来像更新型任务，但我不确定要不要强行套 before/after。
使用 $模板类型判定 输出模板模型、真源路径和人工门禁条件。
```
