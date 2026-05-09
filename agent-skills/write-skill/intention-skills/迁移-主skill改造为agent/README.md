# 迁移-主skill改造为agent

## 作用
把主 skill 从“单体总说明书”迁移成“父级 agent 路由器”，让高频规则保留在主文件，执行细节下沉到子 skill。

## 适用场景
- 主 skill 过重且持续膨胀。
- 已经存在多个独立子能力，但还没拆成正式节点。
- 希望显式引入质量门禁和分层路由。

## 与相邻节点边界
- 只是内容太多：可先配合 `feature-skills/主SKILL瘦身与下沉`
- 已经分层，但中间层多余：配合 `feature-skills/子skill上提与中间层删除`
- 从 0 新建：进入 `策略-新建skill`

## 资源入口
- 模板：`[[template/README.md]]`
- few-shot：`[[assets/few-shot-example/README.md]]`
- 校验：`[[evals/evals.json]]`

## 使用示例
```text
这个主 skill 已经承担了太多职责，我想把它迁移成父级 agent，并把细节下沉到子skill。
使用 $迁移-主skill改造为agent 输出新的分层方案和主文件保留项。
```
