---
name: 策略-新增图域
description: 在已有 Agent 中新增 graph 工作域包。Use when 新增 LangGraph 工作流、graph 域 README、双轨 Mermaid。
---

# 策略-新增图域

## 何时使用

- 已有 Agent，新增第二个及后续 LangGraph 工作流（如 `lexicon_curation`）

## GREEN 步骤

1. 复制 [[../../template/graph域包骨架/tree.txt]] → `app/graph/<workflow>/`
2. [[../../feature-skills/搭建-graph工作域包/SKILL.md]] 创建 state/builder/runner/nodes/edges/...
3. **必调** [[../../feature-skills/撰写-graph域README双轨Mermaid/SKILL.md]] 写域 README
4. 更新 `app/graph/README.md` 域索引表
5. [[../../feature-skills/搭建-测试共置与mock/SKILL.md]] 补 `graph/<workflow>/tests/`

## 输出契约

- `graph/<workflow>/` 完整包
- `graph/<workflow>/README.md` 含双轨 Mermaid
- `graph/README.md` 已登记新域

## 金样

[[../../assets/few-shot-example/terminology-agent/graph-pre_translate-README.md]]
