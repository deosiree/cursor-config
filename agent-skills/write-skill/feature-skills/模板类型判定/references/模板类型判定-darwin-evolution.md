# 模板类型判定 Darwin 演化说明

## 当前已覆盖

- `add-skill`
- `update-skill`

## 当前边界

- 若未来任务模型既不属于新增型，也不属于更新型，需要停止自动套模板

## 新模型申请入口

当出现以下迹象时，输出 `human-requested-new-model`：

- 新任务没有明确的新增或更新前后态
- 现有模板无法表达目标结构
- 套用 `add-skill` 或 `update-skill` 都会误导实现者

## 何时继续 Darwin

- `add-skill` / `update-skill` 判断频繁误触发
- 出现第三种稳定任务模型
