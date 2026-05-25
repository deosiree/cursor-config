# QA转面经

技术 QA → 面经风格 `.md`；框架按**行文结构**组织，样本保持**原文件名**。

## 资源在哪

### 框架结构库（写面经用哪种章节结构）

| 你要的 | 路径 |
|--------|------|
| **索引 + 推荐权重** | [references/框架结构库/README.md](references/框架结构库/README.md) |
| **面试钩子-对比递进-答题收束** | [框架说明](references/框架结构库/面试钩子-对比递进-答题收束/框架说明.md) |
| 该结构下的样本（不改名） | [references/框架结构库/面试钩子-对比递进-答题收束/](references/框架结构库/面试钩子-对比递进-答题收束/) |
| **背景-实现-核心-取舍** | [框架说明](references/框架结构库/背景-实现-核心-取舍/框架说明.md) |

```text
references/框架结构库/
├── README.md
├── 面试钩子-对比递进-答题收束/
│   ├── 框架说明.md
│   └── 鹅厂面试官：MCP 就是 Function Calling….md   # 原文件名
└── 背景-实现-核心-取舍/
    └── 框架说明.md
```

对话中说：`用面试钩子-对比递进-答题收束`，或 `参考鹅厂面试官 MCP 那篇`（按文件名匹配目录内 md）。

**未指定结构时**：Agent 排序推荐 **2～3 个** structureId，等人选定后再写。

### 方法论库（每个知识点怎么讲）

| 你要的 | 路径 |
|--------|------|
| **路由入口** | [references/方法论库/SKILL.md](references/方法论库/SKILL.md) |
| 费曼统合叙事 | [references/方法论库/references/费曼-统合叙事.md](references/方法论库/references/费曼-统合叙事.md) |
| 费曼理解校验 | [references/方法论库/references/费曼-理解校验.md](references/方法论库/references/费曼-理解校验.md) |
| 苏格拉底 | [references/方法论库/references/苏格拉底-追问链.md](references/方法论库/references/苏格拉底-追问链.md) |
| 金字塔 | [references/方法论库/references/金字塔-结论先行.md](references/方法论库/references/金字塔-结论先行.md) |

### 其他

| 文件 | 用途 |
|------|------|
| [operating-guide.md](references/operating-guide.md) | 质量门禁、转播客联动 |
| [_shared 契约](../../_shared/references/技术文档-NK与doc_type契约.md) | N/K、doc_type |

## 快速开始

```text
把 XXX 讨论沉淀成面经，输出到 path/to/面经.md
（不说框架 → 会先收到 2～3 个结构推荐表）

用面试钩子-对比递进-答题收束 写面经
```

## 核心流程

```
步骤1 框架（推荐或指定 structureId）→ 1.5 N/K → 2～4 写作 → 5 few-shot → 6 可选转播客
```

## 目录

| 目录 | 说明 |
|------|------|
| [SKILL.md](SKILL.md) | 主入口 |
| [intention-skills/](intention-skills/) | 编排、框架、体量 |
| [feature-skills/](feature-skills/) | 提炼、方法论、写入 |
| [references/框架结构库/](references/框架结构库/) | 行文结构 + 样本 |
| [references/方法论库/](references/方法论库/) | 写作方法 |
| [template/snapshot/](template/snapshot/) | 成功 few-shot |

## 相邻 skill

post-mortem · conversation-summary · 文档转播客（步骤 6）
