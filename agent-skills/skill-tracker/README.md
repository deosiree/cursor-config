# Skill Tracker — LFU 缓存维护

维护 Top-30 常用 skill 自动切换。启用本 skill 后，日常仅加载最常用的 skill 到 prompt context，非高频 skill 懒加载以减少 token 消耗。

## 用途

- 自动追踪 299 个 main skill 的使用频率
- 仅保留 Top-30 高频 skill 在 `available_skills` 中
- 低使用率 skill 被自动禁用（仍在磁盘，`skill_view()` 可加载）
- 每天凌晨 4 点老化衰减（×0.85）+ 重平衡

## 文件结构

```
skill-tracker/
├── SKILL.md                        # 主 skill 定义
├── README.md                       # 本文档
├── scripts/
│   └── skill-rebalance.sh          # 重平衡脚本（供 cron 调用）
├── assets/
│   ├── frontmatter-template.yaml   # frontmatter 模板
│   ├── few-shot-example/           # 示例 skill（新建）
│   ├── test-prompts.json           # Darwin 测试 prompt
│   └── results.tsv                 # Darwin 评估记录
└── references/                     #（预留）
```

## 依赖

- `~/.hermes/skill-track.tsv` — 使用计数表
- `~/.hermes/config.yaml` — `skills.disabled` 列表
- bash + python3 (stdlib only) — 重平衡脚本
- cron — 每日 4am 自动运行

## 首次启用

1. 确认 `skill-track.tsv` 已存在（299 行 main skill）
2. 确认 `skills.disabled` 已在 config.yaml 中
3. 设置 cron：`hermes cron list` 确认 `skill-rebalance-daily`
4. 触发一次重平衡：`bash scripts/skill-rebalance.sh`

## 前/后效果对比

| 指标 | 之前 | 之后 |
|------|------|------|
| available_skills 数量 | 445 | ~10 active + ~210 built-in |
| 每轮 prompt 开销 | ~55K chars | ~20K chars |
| 低频 skill 访问 | 即时（一直在 prompt 里） | 多一次 skill_view 加载 |
