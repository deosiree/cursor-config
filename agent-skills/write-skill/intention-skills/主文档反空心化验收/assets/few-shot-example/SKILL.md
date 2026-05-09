---
name: 会话示例：主文档反空心化验收
description: 当需要展示如何判定一个 skill 的主文档是否已经空心化时使用。
---

# 会话示例
这个示例关注的是一个更新型闭环，而不是单次静态判定。

## 输入状态
- 目标 feature 结构齐全
- 主 `README.md` 没有验收方式
- 主 `SKILL.md` 没有输出字段
- 示例只存在于 few-shot

## 门禁判定
- `hollowDocFindings`
  - 主文档缺少摘要级任务信息
  - 示例覆盖不足
- `acceptanceDecision`
  - `needs_fix`
- `recommendedFollowupFeatures`
  - `references与evals补全`
  - `历史版本回填为few-shot`

## 修复后目标
- 主 `README.md` 补上定位、结构职责与验收方式
- 主 `SKILL.md` 补上输出字段
- few-shot 继续保留，但不再替代主文档
- 复验结果变成 `pass`

## 使用示例
```text
请检查这个 skill 套件的主文档是否已经空心化，并输出验收结论。
```
