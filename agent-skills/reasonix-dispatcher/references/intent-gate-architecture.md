# Intent Gate 架构设计

## 为什么需要 intent gate

`dispatch()` 的调用链：

```
classify(query) → 返回 intent 类型
              ↓
         intent == 'orchestration'  → 直接返回 route=hermes（不走 Reasonix）
              ↓
         intent is 'code'|'qa'|'analysis'  → 走 Reasonix
```

没有 intent gate 时，orchestration 类任务（发通知、配 cron、管理 skill）也会被送进 Reasonix，白烧 token 且得不到更好的结果——这些任务不需要 DeepSeek 深度推理。

## 发现经过

首次 full_test 实测中发现。Three test prompts were run:

| Test | Query | classify() 结果 | 预期 route | 实际 route（修之前） | 结果 |
|------|-------|----------------|------------|-------------------|------|
| 1 | "帮我写个 Python 脚本" | code | reasonix | reasonix | ✅ 正确 |
| 2 | "分析仓库架构" | qa | reasonix | reasonix | ✅ 正确 |
| 3 | "在飞书发通知" | orchestration | hermes | reasonix | ❌ 错误 |

Test 3 暴露了问题：`classify()` 正确返回 `orchestration`，但 `dispatch()` 没有基于这个结果做路由决策——所有请求都无差别送 Reasonix。

## 修复

在 `_run_reasonix()` 前加一行门禁：

```python
if intent == 'orchestration':
    result['route'] = 'hermes'
    return result
```

## 为什么不把 gate 放在 classify() 里

`classify()` 是纯函数的分类器，调用者可能只想获取分类结果（例如用于日志统计），不应蕴含 routing 副作用。路由决策是 `dispatch()` 的职责。

## 验证

修复后 3/3 测试通过。Test 3 返回 `route=hermes`，消耗 0 推理 token。

## 教训

Python 代码 classify + dispatch 两层架构中，classify 的结果必须被 dispatch 消费。只检测不行动 = 白检测。
