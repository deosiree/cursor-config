# 批量设计多元语料

父级 agent skill：为目标产品仓建设**可脚本门禁验收**的多元 RAG 操作语料（单模块 + 跨模块旅程）。

## 目录

| 路径 | 角色 |
|------|------|
| [SKILL.md](./SKILL.md) | 父路由、RED、人工门禁、主工作流 |
| [intention-skills/编排-语料Goal到门禁PASS](./intention-skills/编排-语料Goal到门禁PASS/SKILL.md) | 从 Intake 到 PASS 的编排 |
| [intention-skills/分析-语料缺口与阈值提案](./intention-skills/分析-语料缺口与阈值提案/SKILL.md) | 缺口诊断与升阈值提案 |
| [feature-skills/](./feature-skills/) | 落盘 / 模块挖掘 / 旅程 / 导出 / 核验 |
| [references/](./references/) | 阈值模板、黑名单、实战对照 |
| [template/](./template/) | EVAL_GATES / GOALS / matrix / 脚本骨架 |
| [assets/](./assets/) | checklist、frontmatter、few-shot 摘录 |
| [evals/](./evals/) | test-prompts；Darwin 可选 |

## 使用示例

### 示例 1：新仓从 0 建场

```text
用户：给 xxx 产品建操作语料，要对齐门禁，先按默认阈值。
Agent：读本 SKILL → 编排-语料Goal到门禁PASS
  → 落盘-门禁与看板（复制 template，改路径）
  → 挖掘-模块语料 → 挖掘-跨模块旅程
  → 导出 → 核验直到 PASS
```

### 示例 2：续跑「继续语料 Goal」

```text
用户：继续语料 Goal
Agent：核验-门禁脚本与续跑
  → python …/check-*-gates.py
  → 只修 FAIL（禁止新开空计划）
  → 再跑；PASS 则停
```

### 示例 3：要更严

```text
用户：汉字量再抬到 120k，旅程金标每条 8
Agent：分析-语料缺口与阈值提案 → 🔴 新旧对比表
  → 人确认后升 EVAL_GATES 版本 → 再编排扩面到 PASS
```

## 硬约束（一眼）

- PASS = 门禁脚本 exit 0，不是勾选
- 必须有跨模块旅程，禁止只堆单模块
- UI 文案源码可证；截图人优先、禁覆盖
- 升阈值须确认并升版本号

## 实战真源（勿整树复制）

见 [references/翻译工具实战对照.md](./references/翻译工具实战对照.md)（translationtool `data/rag-corpus` + `scripts/check-rag-corpus-gates.py`）。
