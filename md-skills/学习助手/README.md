# 学习助手 — 套件结构导航

> 阅读技术文档，回答指定章节的问题，结合项目源码沉淀知识点。

## 套件架构（3 层）

```
用户输入
    │
    ▼
┌─────────────────────────────────────────────┐
│  学习助手 (SKILL.md)                         │
│  入口决策（5 步）→ 判意图 → 路由 intention   │
└─────────────┬───────────────────────────────┘
              │
      ┌───────┴────────┐
      ▼                ▼
┌─────────────┴──────────────────┐ ┌─────────────┴──────────────────┐
│  intention-skills/              │ │  intention-skills/              │
│  编排-读文档解答                 │ │  编排-读文档加项目沉淀           │
│  步骤 1→4：读文档→提取→写回小结 │ │  步骤 1→7：读文档→探索→落盘→回写│
│  必交付清单 + 自选顺序           │ │  CP1→CP2 双门禁                 │
└─────────────┬──────────────────┘ └─────────────┬──────────────────┘
              │                                   │
              │           ┌───────────────────────┘
              │           ▼
              │    ┌──────────────────────────────────┐
              │    │  feature-skills/                  │
              │    │  ├─ 分析-文档章节结构              │
              │    │  ├─ 沉淀-项目笔记落盘              │
              │    │  └─ 回写-双链注入主文档            │
              │    └──────────────────────────────────┘
              │                   │
              ▼                   ▼
     ┌──────────────────────────────────────┐
     │  common-skills/ (外部依赖)            │
     │  ├─ 方法论skills                      │
     │  ├─ 渲染图skills                      │
     │  └─ 探索skills                        │
     └──────────────────────────────────────┘
```

## 模块说明

| 模块 | 定位 | 调用方 | 产出 |
|------|------|--------|------|
| `SKILL.md` | **Agent 入口**：判意图 + 路由 | 用户直接触发 | 路由到对应 intention |
| `intention-skills/编排-读文档解答/` | **编排器**：读文档 → 写答案 | 学习助手（解答意图） | 注入答案到主文档 |
| `intention-skills/编排-读文档加项目沉淀/` | **编排器**：读文档 → 探索 → 落盘 → 回写 | 学习助手（沉淀意图） | 笔记目录 + 双链回写 |
| `feature-skills/分析-文档章节结构/` | **分析**：提取概念/关注点/项目名 | 两 intention 共用 | JSON 结构输出 |
| `feature-skills/沉淀-项目笔记落盘/` | **落盘**：写分析文档到指定目录 | 沉淀 intention | .md 文件（≥2KB） |
| `feature-skills/回写-双链注入主文档/` | **注入**：核心结论 + [[双链]] 写回主文档 | 沉淀 intention | edit_file 到主文档 |
| `common-skills/方法论skills/` | **方法选择**（外部依赖） | 各 intention | 方法论标注 |
| `common-skills/渲染图skills/` | **图表渲染**（外部依赖） | 各 intention | Mermaid 图 |
| `common-skills/探索skills/` | **源码探索**（外部依赖） | 沉淀 intention | 目录结构 + 摘要 |

## 测试与评估

| 资产 | 用途 |
|------|------|
| `evals/evals.json` | 4 条标准测试 prompt + passCriteria |
| `evals/test-agent-skill.md` | full_test 子 agent 技能定义 |
| `evals/results-template.tsv` | 评估结果记录模板 |

使用子 agent 评估：`run_skill({ name: "learning-assistant-eval", arguments: '{"testId":"happy-answer","evalMode":"dry_run"}' })`

## 迭代说明

- 改入口行为 → 编辑 `SKILL.md`
- 改工作流 → 编辑对应 `intention-skills/*/SKILL.md`
- 改具体能力 → 编辑对应 `feature-skills/*/SKILL.md`
- 质量评估 → `run_skill("learning-assistant-eval")` 或走 `[[../../darwin-skill/SKILL.md]]`
- 改写套件结构 → `[[../../agent-skills/write-skill/SKILL.md]]`

## 开发约定

- 主入口不写答案正文，只判意图 + 路由
- intention 层固定阶段顺序 + RED/门禁，不固定执行顺序（必交付清单自选）
- feature 层单点能力，被 intention 编排调用
- 所有 `SKILL.md` frontmatter 统一句式：`{做什么}。被 {调用方} 调用。`
