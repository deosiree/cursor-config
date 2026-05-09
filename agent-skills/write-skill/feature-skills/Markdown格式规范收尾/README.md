# Markdown格式规范收尾

## 作用
把 `[[../../references/markdown-format-rules.md]]` 从被动说明提升为可执行收尾动作，在 skill 套件写完后统一检查并修正 Markdown 结构问题。

## 输入前提
- 父级与子skill 的基础结构已补齐。
- README、SKILL、template、assets、references、evals 已有初稿。
- 本轮目标是先收紧 Markdown 规范，而不是继续扩能力。

## 产出
- 一套明确的 Markdown 收尾检查项。
- 模板、few-shot、README、SKILL 的统一标题策略。
- 进入 Darwin 前的 Markdown 完整性结论。

## 不负责
- 不负责命名策略。
- 不负责子skill 路由。
- 不负责 Darwin 评分。

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
现在结构和内容都补齐了，但 Markdown lint 还不稳定。
使用 $Markdown格式规范收尾 统一检查 H1、空行和模板一致性，再决定是否进入 Darwin。
```
