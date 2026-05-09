---
name: 真实历史样本型模板-基于RED写before
description: 当需要把真实历史错误样本、失败产物或 commit^ 片段整理成 template/before 时使用。
---

# 核心任务
把 RED 阶段观察到的真实失败态收敛成可复用的 `template/before` 模板实体。

## 何时触发
- 已经找到真实历史错误样本或失败产物。
- 节点缺 `before`，或现有 `before` 只是说明壳。
- 需要把 `commit^`、失败快照或错误态文档整理成模板。

## 输入 / 前置条件
- 目标节点
- 真实错误样本来源
- 需要保留的失败信号

## 输出
- `selectedFailureSource`
- `beforeTemplateFiles`
- `failureSignalsPreserved`
- `sourceTraceabilityNotes`

## 边界
- 它只负责生产 `before` 模板实体，不负责生成 `after`。
- 若模板类型未定，先回到 `[[../模板类型判定/SKILL.md]]`。

## 使用示例
```text
我已经找到这个 skill 改造前的真实失败版本了。
使用 $真实历史样本型模板-基于RED写before 把它整理成 template/before。
```
