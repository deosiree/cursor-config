# 编排-skill质量迭代

## 作用
编排写完 skill 之后的 Darwin 质量闭环：baseline、试跑、优化、keep / revert。

## 适用场景
- 主结构和内容已经基本完成，准备进入质量门禁。
- 需要决定是只评估不改，还是继续受控试跑。
- 需要先决定桥接外部 Darwin，还是走内部降级方案。

## 与相邻节点边界
- 它负责编排，不直接执行 Darwin 评分。
- 具体执行交给 `feature-skills/darwin质量评估与迭代`。
- 若结构还不完整，先回到主套件或其他 intention 节点补齐。

## 主要产出
- Darwin 接入方式
- baseline 计划
- 试跑计划
- keep / revert 规则

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
当前 skill 套件已经接近完成，我想先决定 Darwin 的接入与试跑策略。
使用 $编排-skill质量迭代 给出 baseline、trial 和 keep / revert 规则。
```
