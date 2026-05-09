---
name: 模板类型判定
description: 当需要根据任务本质和历史事实判断模板应使用 before/after 还是 mvp/snapshot 时使用。
---

# 核心任务

- 新增型能力：输出 `add-skill`
- 更新型能力：输出 `update-skill`
- 既不属于新增型也不属于更新型：输出 `human-requested-new-model`
- 不允许脱离真实历史事实瞎猜

## 模板真源

- 新增型：`[[template/add-skill/README.md]]`
- 更新型：`[[template/update-skill/README.md]]`

## 人工门禁

若命中 `human-requested-new-model`：

1. 暂停自动套模板
2. 请求人类确认新模型
3. 再把新模型回流到 `[[references/模板类型判定-darwin-evolution.md]]`

## 输入 / 前置条件
- 当前任务是新增型还是更新型
- 是否存在真实历史 before / after
- 是否已有可复用模板族

## 输出
- `templateModelDecision`
- `templateSource`
- `humanGateReason`

## 使用示例
```text
这个节点到底该用 before/after 还是 mvp/snapshot，我不想凭感觉决定。
使用 $模板类型判定 根据任务本质和历史事实输出模板模型。
```
