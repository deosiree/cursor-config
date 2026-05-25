---
name: 编排-QA沉淀为经验贴
description: 总编排器。框架结构库→体量分析→写作→组装→可选few-shot→可选转播客。
---

# 核心任务

把一段 QA 对话沉淀为面经风格知识经验贴。

## 输入

- `QA上下文`、`输出路径`
- `structureId`（可选）：`面试钩子-对比递进-答题收束` 等
- `参考样本文件名`（可选）：结构目录下原文件名 .md
- `doc_type` / `knowledge_points` / `quick_qa_count`（可选）

## 编排步骤

### 步骤 1：参考框架就绪

```
调用 分析-参考框架就绪
  ├── 已指定 structureId 或样本 → 加载 框架结构库/{id}/框架说明.md
  ├── 未指定 → 推荐 2～3 个 structureId → awaiting_choice → 等人选后再继续
  └── need_extract → 提炼-文档参考框架 → 入库后加载
```

### 步骤 1.5：QA 体量与 doc_type

```
调用 分析-QA体量与doc_type → { N, K, doc_type, checkpointFlags }
```

### 步骤 2～4

提取 N 章 → 逐章（方法论库 + 建模）→ 全景图 + 写入-经验贴文档

### 步骤 5（可选）

高质量 → 回填 template/snapshot/

### 步骤 6（可选）

面经落盘 → 询问用户是否转播客 → 同意则调用 `文档转播客`（`.cursor/md-skills/文档转播客/SKILL.md`）：

- `[技术文档.md]` = 刚产出的面经路径
- `[输出目录]` = `{面经父目录}/{stem}/`（`stem` = 文件名去 `.md`）
- `doc_type` = 步骤 1.5 结果
- 交付模式未指定 → **完整**（不再检查点 B 确认）

详见 `[[../../references/operating-guide.md]]`。

## 关键约束

- 步骤 1 未确认 structureId 前不写作
- 禁止按领域静默默认框架
- 每知识点 选择-嵌入学习方法论；费曼 写后 理解校验

## 使用示例

```text
沉淀 OperationColumn 面试面经，用面试钩子-对比递进-答题收束
→ 可读同目录 鹅厂面试官…MCP….md 作语气参考

沉淀 QA（未指定结构）
→ 步骤1 推荐表 → 用户选 1 → 再 1.5→2→3→4
```
