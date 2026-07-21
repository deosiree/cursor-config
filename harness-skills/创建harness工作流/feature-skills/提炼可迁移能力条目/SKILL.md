---
name: 提炼可迁移能力条目
description: 从源仓 harness 变更中提炼可迁移能力行；业务特例进 rejected 列表。触发词：提炼能力、新范式、portable capability。
---

# 提炼可迁移能力条目

## 目标

把源仓「刚学会的 harness 收益」变成 `可迁移能力.md` 可追加的 **能力名 + 落地形态举例 + 验收问句**。

## 提炼规则

| 保留为 portable | 拒绝（业务特例） |
| --- | --- |
| 证据阶梯、外证 DONE、审查五模块、表面分拣、零侵入、Eval 人工触发 | 具体产品名、会话实现、注册名≠包名、某后端默认只读、某脚本绝对路径当唯一 L2 |
| 「他仓如何发现自己的 L2」 | 「必须用源仓该脚本」 |

每条能力格式：

```yaml
- tier: "P0|P1|P2"
  name: "不超过短句的能力名"
  exampleShape: "落地形态举例（非必拷）"
  acceptanceQuestion: "他仓如何自检已具备？"
```

## 步骤

1. 读 `changeHint` / diff 摘要  
2. 逐条分类 → `portableCapabilities` / `rejectedAsBusinessSpecial`  
3. 与现表去重：同义则建议改写验收问句，不新增空壳行  
4. **不**直接写文件；交由 `编排-同步skill收益` CHECKPOINT 后写入  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 无法说出验收问句 | 该条进 rejected 或改写 | 不入库 |
| 只有源仓路径没有能力名 | 追问范式本质 | 不同步 |

## 输出

`portableCapabilities` + `rejectedAsBusinessSpecial`。
