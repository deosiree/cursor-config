# skill-tracker 设计原理

## 为什么用 LFU 而不是 LRU

本系统用 **LFU（Least Frequently Used）** 而非 LRU（Least Recently Used），原因：

| 特性 | LFU | LRU |
|------|-----|-----|
| 计分维度 | **累计使用频率** | 最近一次使用时间 |
| 适用场景 | skill 库有稳定高频集（日常必用） | 有突发热点（一次性的） |
| 老化策略 | 需额外衰减机制 | 自然过期 |
| 稳定性 | 高频 skill 稳定保留，不抖动 | 节假日回来全变，冷启动 |

**选择 LFU 的理由**：Hermes 的 skill 使用模式是「每天用那十来个 + 偶尔用冷门」。LFU 配合 0.85 每日衰减，既能保留长期高频 skill，又不会让冷门 forever 0。

## 为什么 Top-30

299 个 main skill → 只暴露 Top-30 在 `available_skills`：

- **token 节省**：每轮推理约 25K chars 的 skill 列表 → 30 个是性价比拐点
- **实际使用**：用户日常高频 skill 不超过 20 个（验证：top 10 占总使用 80%+）
- **余量**：30 = 15 个日常 + 10 个近期热门 + 5 个缓冲
- **控制反转**：太小的 Top-N（如 10）会频繁淘汰，增加 config.yaml 修改频率

## 为什么 0.85 老化因子

```
count = max(1, floor(count × 0.85))
```

- 经过 7 天后，count=10 → 3.2（降至 ~1/3）
- 经过 14 天后，count=10 → 1.0（≈归零）
- 0.5（过慢）：14 天仍在 6 → 旧 skill 占坑
- 0.95（过快）：7 天就从 10 到 6 → 高频也会被衰减

**0.85 ≈ 14 天自然淘汰周期**。与 `session_reset.at_hour: 4` 配合，每天 4am 触发一轮。

## 为什么排除子 skill

只有带 SKILL.md 的**主 skill** 参与 LFU 排名，以下目录类型不计数：

- `feature-skills/` — 功能子 skill
- `intention-skills/` — 意图路由子 skill
- `subskills/` — 通用子技能
- `assets/`, `templates/`, `references/`, `scripts/` — 支持文件

**原则**：主 skill 被启用时，其整棵子树自动可用。子 skill 不独立进出，不单独计数。

## 工具限制（非 bug）

| 约束 | 原因 | 替代方案 |
|------|------|---------|
| `column -t` 不可用 | WSL 基础镜像不包含 bsdmainutils | `awk -F'\t' '{printf "%-30s %-5s %-12s %s\n"...}'` |
| `hermes config set` 对 YAML list 写入错误 | 将列表序列化为字符串而非 YAML list | `sed -i` 直接操作 config.yaml，后用 `python3 -c "import yaml; yaml.safe_load(open(...))"` 验证 |
