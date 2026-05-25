---
name: 分析-QA体量与doc_type
description: 统计知识点数量N、推导快问快答K、判定doc_type与钩子风格；N>7触发检查点A。契约正文见_shared技术文档-NK与doc_type契约。
---

# 核心任务

在行文框架（structureId / `框架说明.md`）就绪后、提取章节前，对 QA 上下文做体量与类型分析。

## 何时触发

- `编排-QA沉淀为经验贴` **步骤 1.5**（步骤 1 之后）
- 用户显式提供 `knowledge_points` / `doc_type` 时仍须校验并回写

## 输入

- `QA上下文`
- `doc_type`（可选）
- `knowledge_points`（可选）
- `quick_qa_count`（可选）

## 必读

- `[[../../../_shared/references/技术文档-NK与doc_type契约.md]]`

## 流程

```
1. 统计独立知识点 → N（用户已给则以用户为准并说明）
2. K = min(max(3, N), 7)（用户已给 K 则记录覆盖原因）
3. 判定 doc_type（用户已给则采用，否则按语境）：
   - 用户明说 **面试/面经/怎么答/追问** → **面经**（与领域无关；结构由步骤 1 的 structureId 决定）
   - 对比/答题/面试官 → 面经
   - 步骤教学、从零实现 → 教程
   - 方案/架构/取舍、无面试语境 → 技术方案
   - 工具/API 查阅 → 参考
4. 映射 hookStyle（见契约表）
5. N ≤ 2 → checkpointFlags.shortDoc = true（提示可短章、K=3）
6. N > 7 → checkpointFlags.checkpointA = true → 输出检查点 A 话术，等用户确认后再继续
```

## 检查点 A 话术（摘要）

> 当前约 **N** 个知识点，单篇面经易过长。请选：**合并章节** / **拆成多篇** / **继续单篇（接受超长）**。未确认前不进入步骤 2 写作。

## 输出

```json
{
  "N": 5,
  "K": 5,
  "doc_type": "面经",
  "hookStyle": "面试张力+递进追问",
  "checkpointFlags": { "shortDoc": false, "checkpointA": false }
}
```

## 边界

- 只做分析与门禁，不写正文
- 不调用文档转播客

## 使用示例

```text
QA 含 MCP/SDK/gRPC/Skill/传输 五块 → N=5, K=5, doc_type=面经
QA 含 10 个独立概念 → checkpointA=true，先问用户合并或拆篇
```
