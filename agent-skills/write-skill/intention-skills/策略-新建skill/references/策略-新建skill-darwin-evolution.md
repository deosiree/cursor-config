# 策略-新建skill Darwin 演化说明

## 当前已覆盖

- 从 0 创建中文 skill
- 先定结构，再定模板模型，再补 references / evals

## 当前边界

- 若未来出现新增型之外的新模型，需要交给 `模板类型判定` 输出 `human-requested-new-model`

## 何时继续 Darwin

- 新建任务被误路由到更新型路径
- 新建后缺少真实模板或 few-shot
