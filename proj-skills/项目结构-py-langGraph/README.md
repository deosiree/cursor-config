# 项目结构-py-langGraph

← [[SKILL.md]] · 金样：terminology-agent

FastAPI + LangGraph Agent **全项目结构**标准 skill 套件。frontmatter 采用 **本地中文模式**。

---

## 自然语言怎么用

```text
使用 $项目结构-py-langGraph：
- targetRepo: F:\...\terminology-agent
- taskType: new_graph
- workflowName: lexicon_curation
- 需求: 新增 graph 工作域，含双轨 README 与 tests
```

### 字段对照

| 字段 | 含义 | 示例 |
|------|------|------|
| `targetRepo` | Agent 仓库路径 | `terminology-agent` |
| `taskType` | `new_project` / `new_graph` / `new_service` / `refactor` / `write_readme` | `new_graph` |
| `workflowName` | LangGraph 工作域名 | `pre_translate` |
| `domainName` | services 领域名 | `term_audit` |

---

## 套件结构

```
项目结构-py-langGraph/
├── SKILL.md                    # 父级 agent：路由 + 硬约束
├── intention-skills/           # 何时做哪类结构任务
├── feature-skills/             # 怎么搭包、怎么写 README
├── references/                 # 分层、Mermaid、测试 mock
├── template/                   # 目录树与 README 模板
├── assets/few-shot-example/    # terminology-agent 真实快照
└── evals/
```

---

## 使用示例

### 新建 Agent 项目

```text
从 0 搭 FastAPI+LangGraph 术语 Agent，参考 terminology-agent 全项目结构。
```

### 新增 graph 工作域

```text
在 terminology-agent 增加 graph/lexicon_curation/，写双轨 Mermaid README。
```

### 重构反模式

```text
把 orchestration/ 合并进 services/，graph 根平铺文件迁入 pre_translate/ 包。
```

---

## 与写 pytest 集成测试的区别

| | 本 skill | 写pytest集成测试 |
|---|---------|------------------|
| 产物 | 目录结构 + README | `test_*.py` HTTP 黑盒 |
| 适用 | LangGraph Agent 骨架 | seccenter / nebula 集成 |
