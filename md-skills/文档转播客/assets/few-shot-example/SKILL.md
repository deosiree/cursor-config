# Few-shot 路由（创建型 skill）

生成播客物料前，按交付模式与 `doc_type` 读取对应模板（**真实实现**，勿臆造格式）：

| 模式 | 必读 | 路径 |
| --- | --- | --- |
| **轻量**（用户已选仅朗读稿） | MVP | [`template/mvp/`](../template/mvp/) → `真实输出.md` |
| **完整** / **半量** | Snapshot 目录 | [`template/snapshot/`](../template/snapshot/) → `产物清单.md` |

**Snapshot 按 doc_type**：

| doc_type | 优先读 |
| --- | --- |
| 面经、技术方案 | `真实输出-朗读稿摘录.md` |
| 教程、参考 | `真实输出-教程朗读稿摘录.md` |

**边界**：

| 条件 | 读 |
| --- | --- |
| N>7 | `任务输入-超长方案.md`（先检查点 A，勿直接写稿） |
| test#2 教程、不提面试 | `任务输入-教程示例.md` |

**输出目录**：默认 `{源文父目录}/{stem}/`，勿用 `podcast/`（见主 [`SKILL.md`](../SKILL.md)）。

分类型钩子补充：[`references/参考.md`](../references/参考.md)
