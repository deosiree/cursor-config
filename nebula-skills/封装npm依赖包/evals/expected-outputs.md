# test-prompt 期望输出快照（dim8 干跑锚点）

Agent 跑 `evals/test-prompts.json` 时，最终回复必须能映射到下列字段；缺字段 = 未通过该 case。

## Prompt 1 — 抽取 + link

```yaml
surface: nebula-ui  # 若同时改 consumers → cross-mfe + CHECKPOINT
dispatchedIntention: 分析-可抽离边界  # 确认后才编排-组件入库发版
extractDecision:
  mode: partial
  intoLib: [NeSecretInput / GuardedSecretInput 核]
  stayInRepo: [PwdField 等密码策略壳]
orchestrationResult:
  publishMode: link
  executedPublish: false
checkpoint:
  question: 确认 partial 边界后再写码
```

## Prompt 2 — 拒绝业务壳入库

```yaml
extractDecision:
  mode: none  # 或 partial 且 intoLib 不含策略壳
stayInRepo: [密码策略提示, 确认密码校验]
checkpoint:
  question: 🛑 STOP 整包入库被拒绝
```

禁止：把 formRules / 策略 tip 写进 `@nebula/ui`。

## Prompt 3 — 仅消费者替换

```yaml
dispatchedIntention: 编排-组件入库发版  # 从发版/替换步起，跳过实现
orchestrationResult:
  consumersUpdated: [apex_dev]
  leftoverLocalRefs: []  # grep 旧核路径须为 0
checkpoint:
  question: 跨仓替换已授权？
```
