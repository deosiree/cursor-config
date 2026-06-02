# 通用桥接模板

## 用户输入模式

```
使用 $cook-link-skills
sourceDir: <源目录>
targetDir: <目标目录>
purpose: <自然语言描述目的>
```

## 输出模式

1. LLM 分析 purpose → 输出 linkStrategy JSON
2. 脚本 scan → filter → link → verify
3. 汇总 created/skipped/failed

## 典型 scenario → strategy 映射

| 用户说 | LLM 推断策略 |
|--------|------------|
| "让 Reasonix 能用" | flat .md hardlink, ASCII name |
| "让 Hermes 也能用" | 需检查 Hermes 加载格式后决定 |
| "跨盘同步" | copy, no hardlink |
| "预览一下" | DryRun mode |
