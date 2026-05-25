# With_skill（QA转面经 编排）· 前端试跑摘录

> 历史试跑摘录（Round1）。现行：未指定 structureId 时须推荐 2～3 个并等待选择；前端面试可用 `面试钩子-对比递进-答题收束`。

## 步骤 1.5 输出

```json
{
  "N": 5,
  "K": 5,
  "doc_type": "面经",
  "hookStyle": "面试张力+递进追问",
  "checkpointFlags": { "shortDoc": false, "checkpointA": false }
}
```

知识点：① 操作列折叠问题 ② 槽位语义 ③ 旧 el-button 列对比 ④ calcOpStrip 单一真相 ⑤ 面试讲法。

> 注：若判为 `技术方案`，钩子应改为「线上表格操作列挤版/验收翻车」，更合适；当前默认框架拉向 `面经`。

## 产出结构（节选）

```markdown
---
knowledge_points: 5
quick_qa_count: 5
doc_type: 面经
---

## 开场钩子
面试官指着操作列：「你说你做过表格封装，那 slots=5、7 个按钮时到底显示几个？」…

## 知识点全景图
（mermaid：OpItem → OperationCellOverflow → calcOpStrip → operationWidth → ElTable 探针）

## 一、本质差异：一排 el-button vs 槽位模型
| 维度 | 旧写法 | OperationColumn |
| 行内/溢出 | 全铺开或手写 v-if | calcOpStrip 统一 |
| 列宽 | 写死 / 抖动 | list-data-length + 估宽 |

## 二、类比：槽位 = 地铁车厢座位（更多 = 预留紧急门位）

## 三、架构拆细：index / OpItem / OperationCellOverflow / operationWidth

## 四、选型：何时 inline-visible-count=1 仅「更多」
正例：权限按钮 >5 且常隐藏
反例：只有 2 个按钮仍传 1（浪费槽位）

## 快问快答 ×5
1. slots=6 有 7 个 OpItem？→ 5 行内 + 更多(2) 还是全行内？…

## 总结
背答案：「就是折叠到更多」；做过的人：能讲清槽位、单条溢出省略更多的规则。
```

## 维度 8 简评（1–10）

| 项 | 分 | 说明 |
|----|-----|------|
| 完成用户意图 | 8 | 面经体例完整，可背诵可追问 |
| 相对 baseline | 8 | 结构、对比表、快问快答、区分度明显提升 |
| 副作用 | 6 | 默认吴师兄钩子对**内部组件**略违和；篇幅约为 baseline 3× |

**with_skill 总分（效果向）**：≈ **7.5/10**（面经场景）；若用户要的是**团队 Wiki** 则降至 **6/10**
