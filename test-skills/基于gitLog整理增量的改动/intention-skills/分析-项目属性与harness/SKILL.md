---
name: 分析-项目属性与harness
description: 跨项目 RED：读 harness 记忆，输出属性确认表，CHECKPOINT 等用户确认。
---

# Intention：分析项目属性与 harness

## 何时使用

- `targetRepoProfile != nebula-huiyan`
- 或用户明确「应用到其他项目」

## 何时不要使用

- 默认 `nebula-huiyan` 且字段已齐 → 直接 `策略-整理gitLog增量`

## 步骤

1. 读 `references/harness-intake-checklist.md`
2. 读 `references/attribute-confirmation-template.md` 并复制表头
3. 只读扫描：Meta `AGENTS.md`、`docs/FEATURE_INTAKE.md`、surface `AGENTS.md`、`docs/ARCHITECTURE.md`
4. 填充「harness 推断」列；缺失 → AskQuestion
5. **🔴 CHECKPOINT · STOP**：展示完整属性确认表，等用户填写「用户确认值」
6. 用户确认后：从 `template/profile.config.json.tpl` 生成 `configs/{profileId}.config.json`（**不覆盖** nebula 默认）
7. 复制并改 `domain-dict` / `theme-rules` / `theme-groups` 三份 JSON

## 失败模式（HL-2）

| 触发条件 | 一线修复 | 仍失败兜底 |
| --- | --- | --- |
| 无 AGENTS.md | 全部字段 AskQuestion | missingFacts + STOP |
| 用户未确认 CHECKPOINT | 不跑 extract | 只输出表 |
| 猜测叶倩/杨欣静 | 禁止 | 必须问人 |
| 误覆盖 nebula 默认 config | 写新 profileId 文件 | 禁止改 nebula-huiyan-0707-0807 |

## 输出契约

- `attributeConfirmationTable`（Markdown）
- `proposedConfigPath`
- `missingFacts`（若仍缺）

## 不要做什么

- 不修改 harness 文件
- 不跳过 CHECKPOINT 直接跑脚本
- 不用仓外路径作 few-shot 引用

## 使用示例

```text
换到其他 Meta-Workspace，先 harness intake 跟我确认 author 和主域。
```
