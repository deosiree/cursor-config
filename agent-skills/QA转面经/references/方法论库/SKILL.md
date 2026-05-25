---
name: 方法论库
description: QA转面经 写作时按知识点选择嵌入方法（费曼/苏格拉底/金字塔/不嵌入）。正文见 references/ 子文件。
---

# 方法论库（路由入口）

> 目录：`references/方法论库/`。写每个知识点前由 `选择-嵌入学习方法论` 调用。

## 已注册方法

| 方法 | 触发条件 | 详情 |
|------|----------|------|
| **费曼** | 多术语、层级/派生关系、易混淆 | [references/费曼-统合叙事.md](references/费曼-统合叙事.md) |
| **苏格拉底** | 决策点、选型、读者易「但是…」 | [references/苏格拉底-追问链.md](references/苏格拉底-追问链.md) |
| **金字塔** | 章首需全局认知 | [references/金字塔-结论先行.md](references/金字塔-结论先行.md) |
| **不嵌入** | 知识点已够清晰 | 直接定义 + 对比表 |

写后若选用费曼，追加 [references/费曼-理解校验.md](references/费曼-理解校验.md)（命名≠理解、cargo cult）。

## 判断优先级

```
1. 知识点够清晰？ → 不嵌入
2. 决策点/选型？ → 苏格拉底
3. 多术语混淆？ → 费曼
4. 章首缺全局？ → 金字塔
5. 否则 → 不嵌入
```

## 关联

- N/K/doc_type：`[[../../../_shared/references/技术文档-NK与doc_type契约.md]]`
- 编排：`[[../../references/operating-guide.md]]`
- 费曼思维源（不合并）：`.cursor/role-skills/feynman-skill`

## 新增方法

在 `references/` 新建 `{方法名}.md`，并更新本表与 [references/README.md](references/README.md)。
