---
name: 真实历史样本型模板-写snapshot
description: 当需要把新增型能力的完整真实成品整理成 template/snapshot 时使用。
---

# 核心任务
把新增型能力的完整成品态落成 `template/snapshot`。

## 何时触发
- 模板类型已判定为新增型。
- 已有完整真实成品，需要给出高保真快照。

## 输入 / 前置条件
- 新增型目标节点
- 完整真实成品来源
- 需要保留的关键完成信号

## 输出
- `selectedSnapshotSource`
- `snapshotTemplateFiles`
- `completionSignalsPreserved`

## 边界
- 它只负责 `template/snapshot`，不负责最小闭环裁剪。
- 若当前只需要最小可运行样板，转到 `[[../真实历史样本型模板-写mvp/SKILL.md]]`。

## 使用示例
```text
这个新增型 skill 已经有完整成品了。
使用 $真实历史样本型模板-写snapshot 生成 template/snapshot。
```
