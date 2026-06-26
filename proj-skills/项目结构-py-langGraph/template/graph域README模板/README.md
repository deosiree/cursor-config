# {{WorkflowName}} — {{中文工作域名}} LangGraph 工作域

← 图级索引：[`../README.md`](../README.md) · 节点规范：[`nodes/README.md`](nodes/README.md)

## 1. 这个 Agent 做什么

{{一段话：本工作域解决什么业务问题；批量/HTTP 是否在 services 层}}

---

## 2. 在全项目中的位置

### 源码对照（调用链）

```mermaid
flowchart LR
  router["api/router.py"] --> service["services/{{domain}}/service.py"]
  service --> runner["graph/{{workflow}}/runner.py"]
  runner --> builder["graph/{{workflow}}/builder.py"]
  builder --> nodes["nodes + edges"]
  nodes --> repo["repository/..."]
```

### 业务说明（人类阅读）

```mermaid
flowchart TB
  userReq["用户/前端请求"] --> apiLayer["API 接收并校验参数"]
  apiLayer --> serviceLayer["服务层编排"]
  serviceLayer --> graphRunner["LangGraph 单条执行"]
  graphRunner --> graphNodes["{{中文步骤摘要}}"]
  graphNodes --> repoLayer["数据库读写"]
  repoLayer --> response["返回结果"]
```

---

## 3. 本包目录树

```
{{workflow}}/
├── README.md
├── state.py
├── builder.py
├── runner.py
├── domain/
├── edges/
├── nodes/
├── utils/
├── prompts/
└── tests/
```

---

## 4. 主流程

### 源码对照（与 builder 一致）

```mermaid
flowchart TB
  entry([runner.run]) --> nodeA
  nodeA --> nodeB
  %% 按 builder.py 补全
  nodeB --> endNode([END])
```

### 业务说明（人类阅读）

```mermaid
flowchart TB
  start(["收到输入"]) --> stepA["{{中文步骤 A}}"]
  stepA --> stepB["{{中文步骤 B}}"]
  stepB --> done(["返回结果"])
```

---

## 5. 条件边（若有）

### 源码对照

```mermaid
flowchart LR
  sourceNode --> routeFn
  routeFn -->|"path_key"| targetNode
```

### 业务说明（人类阅读）

```mermaid
flowchart LR
  decide["已判定策略"] --> branch{"分支条件?"}
  branch -->|"选项A"| pathA["路径 A"]
  branch -->|"选项B"| pathB["路径 B"]
```

---

## 6. State 字段

| 分组 | 字段 | 说明 |
|------|------|------|

---

## 7. 节点一览

| 节点名 | 中文职责 | 文件 |
|--------|----------|------|

---

## 8. 维护 Checklist

- [ ] 改 builder 后同步双轨 Mermaid
- [ ] 补 tests/
- [ ] 更新 graph/README.md 域索引
