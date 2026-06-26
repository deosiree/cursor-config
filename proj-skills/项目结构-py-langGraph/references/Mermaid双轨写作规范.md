# Mermaid 双轨写作规范

## 规则

每个 `graph/<workflow>/README.md` 中，**每一张流程图必须成对出现**。

| 轨道 | Markdown 标题 | 节点标签示例 |
|------|---------------|--------------|
| 源码对照 | `### 源码对照（与 builder 一致）` | `retrieve_similar`, `route_after_resolve_source` |
| 业务可读 | `### 业务说明（人类阅读）` | `检索术语库`, `判定翻译策略`, `LLM 机翻` |

## 禁止

- 只有源码名图、无中文业务图
- 中文图与 builder 连边不一致（改代码必须同步两轨）

## 建议成对的图

1. **主流程** — 从 entry 到 END
2. **条件边** — 每个 `add_conditional_edges` 一组
3. **全项目调用链**（可选）— api → services → graph → repository

## Mermaid 语法注意

- 节点 ID 不用空格，用 camelCase
- **节点标签含 `:`、`/`、`?`、英文单词等时，必须用双引号**：`node["检索术语库 exact/fuzzy"]`
- 圆角/ stadium 节点同理：`start(["收到一条待翻译词条"])`
- 边标签含特殊字符时用引号：`-->|"term_path"|`
- 不用 `style` 着色（Obsidian/GitHub 兼容）

## 模板

[[../template/graph域README模板/README.md]]

## 金样

[[../assets/few-shot-example/terminology-agent/graph-pre_translate-README.md]]
