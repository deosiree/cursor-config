---
name: 主文档反空心化验收
description: 当需要先判断一个 skill 套件的主文档或 template 是否已经空心化，并决定是否进入模板修复流或人工门禁时使用。
---

# 核心任务
把“主文档 / 模板是否空心化”提升为意图层门禁，先判定问题类型，再回流到对应修复 feature。

## 何时触发
- 主 `SKILL.md` 已明显变短，但不确定是否已经瘦成空壳。
- `README.md` 与 `SKILL.md` 结构齐全，但怀疑任务、输入、输出、边界或示例被过度下沉。
- `template/after` 只有 README / SKILL 说明，没有真实成品样本。
- 需要在 Darwin 试跑前做一次文档与模板质量门禁。

## 检查范围
- 主 `README.md`
- 主 `SKILL.md`
- `template/before`、`template/after`、`template/mvp`、`template/snapshot`
- `assets/`、`references/`、`evals/` 与主文档、模板之间的分层关系

## 输出
- `hollowDocFindings`
- `missingMainDocSections`
- `exampleCoverageStatus`
- `layeringViolations`
- `acceptanceDecision`
- `recommendedFollowupFeatures`

## 验收判定
- `pass`
  - 主文档与模板都保留摘要级可读内容，`after` / `snapshot` 是真实成品样本。
- `needs_fix`
  - 主文档缺关键段落、模板只有说明壳、或真实样本被 supporting files 取代。
- `human_review`
  - 当前文档不完全空心，但模板类型或历史来源仍有争议。

## 回流映射
- 主文件过重但未空心：`[[../../../../../feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- references / evals 缺失：`[[../../../../../feature-skills/references与evals补全/SKILL.md]]`
- 示例与真实案例不足：`[[../../../../../feature-skills/历史版本回填为few-shot/SKILL.md]]`
- 缺真实历史错误态：`[[../../../../../feature-skills/真实历史样本型模板-基于RED写before/SKILL.md]]`
- 缺真实历史成品态：`[[../../../../../feature-skills/真实历史样本型模板-基于GREEN写after/SKILL.md]]`
- Markdown 结构不一致：`[[../../../../../feature-skills/Markdown格式规范收尾/SKILL.md]]`

## 特例
- 只有当前节点自身，允许 `template/before` 表现为“空心问题态”。
- 其他节点的 `before` 都必须是错误示例、失败产物或真实历史版本片段。

## 使用示例
```text
这个 skill 的主文档和 template 看起来都有文件，但我怀疑 after 只是说明壳。
使用 $主文档反空心化验收 先做门禁判断，再告诉我应该回流到哪个修复 feature。
```
