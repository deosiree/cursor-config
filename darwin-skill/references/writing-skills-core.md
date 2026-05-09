# 写 skill 核心约束摘录

本文件用于把 `写skill` 的固定交付约束沉淀到 `darwin-skill` 套件内部，避免维护时只记住方法论，忘了结构标准。

## 固定交付结构

标准中文 skill 套件至少包含：

```text
<skill-dir>/
├── README.md
├── SKILL.md
├── template/
├── assets/
├── references/
└── evals/
```

## 主文件约束

- `SKILL.md` 只放每次激活都必须看到的规则。
- frontmatter 默认采用本地中文模式。
- 主文件需要保留 `RED / GREEN / REFACTOR`。
- 大段示例、设计说明、长表格不要堆在主文件正文。

## 维护层约束

- `README.md` 负责说明目录职责、frontmatter 模式、如何使用。
- `template/` 放人类可仿写的真实样例。
- `assets/` 放 agent 按需读取的素材。
- `references/` 放长篇方法论、边界和设计理由。
- `evals/` 放 should-trigger、should-not-trigger、acceptance checks。

## 对 darwin-skill 的落地含义

`darwin-skill` 以前更像“展示项目 + 一个大 SKILL.md”。  
本轮调整后，它需要同时满足两件事：

1. 保留达尔文式优化方法论
2. 变成适合本地中文仓库长期复用的标准 skill 套件
