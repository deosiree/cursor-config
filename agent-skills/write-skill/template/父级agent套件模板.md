# 父级 agent 套件模板

> 可直接复制的套件骨架。复制下方目录结构后，参照各文件模板填入内容。

## 目录骨架

```text
<skill-root>/
├── README.md                     # 套件定位、结构职责、演化边界
├── SKILL.md                      # agent 入口：分类 + 路由 + 门禁 + Darwin
├── intention-skills/             # 意图判断层（判断"当前做什么"）
│   ├── README.md
│   └── <子节点>/
│       ├── README.md
│       ├── SKILL.md
│       ├── template/
│       ├── assets/
│       ├── references/
│       └── evals/
├── feature-skills/               # 功能执行层（落地"怎么做"）
│   ├── README.md
│   └── <子节点>/
│       ├── README.md
│       ├── SKILL.md
│       ├── template/
│       ├── assets/
│       ├── references/
│       └── evals/
├── template/                     # 给人看的模板、骨架、样例
├── assets/                       # 给 agent 读的 few-shot、检查清单
├── references/                   # 方法论、案例说明、约束基线
└── evals/                        # 触发/不触发验证用例
```

## SKILL.md 骨架（父级 agent）

```markdown
---
name: <中文父级skill名>
description: <Use when 中文触发条件>
---

## 任务分类
- <类型A>
- <类型B>

## 人工门禁
- <缺失信息时停>
- <混合请求时停>

## 路由

### 意图层
- 类型A → `[[intention-skills/<子skill>/SKILL.md]]`
- 类型B → `[[intention-skills/<子skill>/SKILL.md]]`

### 功能层
- <能力说明> → `[[feature-skills/<子skill>/SKILL.md]]`

## Darwin
- <外部桥接或内部降级>
```

## README.md 骨架

```markdown
# <套件名>

## 定位
<一句话定位>

## 结构

## 目录职责

## 使用示例

```

## 创建步骤

1. 复制目录骨架到目标路径
2. 填写 SKILL.md frontmatter + 路由
3. 为每个子节点创建最小套件（README + SKILL + template + assets + evals）
4. 对照 `write-skill-single-guardrails.md` 做空心化验收
