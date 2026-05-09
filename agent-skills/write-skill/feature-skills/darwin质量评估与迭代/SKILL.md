---
name: darwin质量评估与迭代
description: 当需要对刚写完或正在重构的 skill 套件执行 Darwin 式 baseline、受控试跑、优化迭代与 keep 或 revert 决策时使用。
---

# 核心任务
把 Darwin 方法变成可执行质量门禁，而不是口头建议。

## 优先桥接外部 Darwin skill
先检查：
- `./.cursor/darwin-skill`

若存在，优先读取：
- `./.cursor/darwin-skill/SKILL.md`
- `./.cursor/darwin-skill/template/受控试跑/`
- `./.cursor/darwin-skill/references/darwin-methodology.md`

## 缺失时的回退顺序
1. 请求人类提供 Darwin skill
2. 若人类也无法提供，再启用内部降级闭环：
   - baseline
   - 2-3 条测试提示词
   - controlled-trial 或 dry-run
   - keep / revert 规则

## 输出
- `darwinIntegrationMode`
- `baselineScorePlan`
- `trialPlan`
- `optimizationDecision`
- `keepOrRevertRule`

## 边界
- 它负责质量评估与试跑，不负责补齐结构空洞。
- 如果结构、内容或 Markdown 还没完成，先回到主套件流程补齐。
- 如果用户明确只做 baseline，不默认扩张成 optimize。

## 使用示例
```text
这个 skill 套件已经写完了，我想先做 Darwin baseline 和受控试跑，不直接优化。
使用 $darwin质量评估与迭代 输出 baseline、trial 和 keep / revert 规则。
```
