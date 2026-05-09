---
name: 真实历史样本型模板-基于GREEN写after
description: 当需要把真实修复后成品、稳定输出或历史成功样本整理成 template/after 时使用。
---

# 核心任务
把 GREEN 阶段的真实成品态收敛成可直接复用的 `template/after` 模板实体。

## 何时触发
- 已有真实修复后成品或稳定输出。
- 节点缺 `after`，或现有 `after` 只是说明壳。
- 需要把真实成功样本沉到模板而不是只写 README。

## 输入 / 前置条件
- 目标节点
- 真实成品来源
- 需要保留的关键信号

## 输出
- `selectedSuccessSource`
- `afterTemplateFiles`
- `completionSignalsPreserved`
- `sourceTraceabilityNotes`

## 边界
- 它只负责生产 `after` 模板实体，不负责生成 `before`。

## 使用示例
```text
这个节点修复后的真实成品已经有了。
使用 $真实历史样本型模板-基于GREEN写after 把它整理成 template/after。
```
