---
name: 真实历史样本型模板-写mvp
description: 当需要把新增型能力的最小闭环真实样本整理成 template/mvp 时使用。
---

# 核心任务
把新增型能力的最小可运行闭环落成 `template/mvp`。

## 何时触发
- 模板类型已判定为新增型。
- 需要先给出最小可工作的真实模板，而不是完整快照。

## 输入 / 前置条件
- 新增型目标节点
- 最小闭环真实来源
- 需要保留的最小可运行信号

## 输出
- `selectedMvpSource`
- `mvpTemplateFiles`
- `minimumCompletionSignals`

## 边界
- 它只负责 `template/mvp`，不负责完整成品快照。
- 若已经有完整成品，转到 `[[../真实历史样本型模板-写snapshot/SKILL.md]]`。

## 使用示例
```text
这个新增型 skill 先给我一个真实最小闭环模板。
使用 $真实历史样本型模板-写mvp 生成 template/mvp。
```
