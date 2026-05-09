# 历史版本回填为few-shot

## 作用
把真实历史版本、旧 skill 改造过程或多份成功案例回填为 few-shot，而不是继续依赖口头说明。

## 适用场景
- 想把成功案例沉淀成可复用样例。
- 一个功能节点已经有多个真实来源，需要统一整理。
- 现有模板过于抽象，缺少真实 before / after 支撑。

## 与相邻节点边界
- 模板类型未定：先进入 `[[../模板类型判定/SKILL.md]]`
- references / evals 缺失：再进入 `[[../references与evals补全/SKILL.md]]`
- few-shot 回填不能替代主文档补全

## 资源入口
- 模板：`[[template/README.md]]`
- 历史错误态：`[[template/before]]`
- 历史成品态：`[[template/after]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
这个功能节点已经有几次真实成功案例，但还没整理成 few-shot。
使用 $历史版本回填为few-shot 把这些历史版本变成结构化样例，并保留来源关系。
```
