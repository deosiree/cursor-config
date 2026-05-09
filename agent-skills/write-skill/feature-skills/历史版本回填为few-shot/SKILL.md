---
name: 历史版本回填为few-shot
description: 当需要把真实历史提交、旧 skill 改造过程或多份成功案例回填为模板与 few-shot 时使用。
---

# 核心任务
多个同功能案例可以共享一个 skill，但每个案例都应是独立 few-shot。

## 何时触发
- 已有真实历史提交、旧 skill 改造记录或成功案例，想把它们回填成 few-shot。
- 当前节点只有抽象说明，没有真实案例支撑。
- 多个案例属于同一功能名，但还没有整理成同一 skill 下的独立样例。

## 输入 / 前置条件
- 历史版本或成功案例来源
- 功能名与目标 skill
- 需要沉淀到 few-shot 的关键差异

## 模板位置

- `[[template/README.md]]`
- `[[template/before]]`
- `[[template/after]]`
- `[[template/few-shots]]`

## 产出约束

- 主模板必须来自真实历史版本
- `before` 必须是错误态、失败产物或真实历史版本 `commit^` 片段
- `after` 必须是可复用的真实成品态样本
- 补充案例进入 `template/few-shots`
- 不允许把多个历史版本混写成一套模糊模板

## 输出
- `selectedHistorySources`
- `fewShotTargets`
- `caseGroupingRule`
- `followupSyncPoints`

## 边界
- 它负责把真实历史整理成 few-shot，不负责虚构 before / after。
- 如果模板类型还没定，先回到 `[[../模板类型判定/SKILL.md]]`。
- 如果主文档本身还是空壳，few-shot 不能替代主文档补全。

## 使用示例
```text
我已经有几次真实的旧 skill 改造记录了。
使用 $历史版本回填为few-shot 把这些案例整理成同一功能节点下的独立 few-shot，并说明分组规则。
```
