# 改前：Hermes 全程跑

## 状态

编码/问答任务全部由 Hermes 主模型（DeepSeek）完成。每轮：
- 完整 system prompt 注入
- 所有 skill 列表扫描
- 重推理在 Hermes 循环内完成
- DeepSeek prefix cache 每轮被破坏

## 典型流程

```
用户：帮我写个 Python 脚本读取 CSV

→ Hermes 加载 system prompt（~2K token）
→ Hermes 加载 skill 列表（~25K token）
→ Hermes 加载会话历史（~5K token）
→ 调用 DeepSeek API：写 CSV 脚本
→ DeepSeek 返回代码
→ Hermes 格式化回复
→ 总消耗：~15K token（几乎全部 cache miss）
```

## 痛点

- 每轮 session 重启后系统 prompt + skill 列表重发，cache miss
- 编码类重推理走 Hermes 主 Agent 循环，开销大
- 辅助任务（vision/compression）若配错 provider，叠加上行成本
- 无法利用 Reasonix 的 Immutable Prefix 缓存优化
