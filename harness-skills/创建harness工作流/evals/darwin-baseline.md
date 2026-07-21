# Darwin · 套件重构后基线（evaluate-only）

**日期：** 2026-07-21  
**模式：** evaluate-only（重构后首次）  
**结构：** 父 agent + 5 intention + 6 feature  

## 父 SKILL 9 维（约）

| # | 维 | 分 | 备注 |
| --- | --- | --- | --- |
| 1 | Frontmatter | 9 | 含同步/darwin 触发词 |
| 2 | 工作流 | 9 | 速查路由 + intention 表 |
| 3 | 失败模式 | 8 | 细则在子节点；父留黑名单 |
| 4 | 检查点 | 9 | 路径/同步确认/darwin |
| 5 | 可执行性 | 9 | 双输出契约 |
| 6 | 资源 | 9 | 13 个 SKILL 可达 |
| 7 | 架构 | 9.5 | 无/旧/同步/darwin 分责 |
| 8 | 实测 | 9 | full_test 同步路径 Judge 9/10 |
| 9 | 黑名单 | 9 | 含禁堆父 SKILL |

**总分 ≈ 88.5 / 100**（架构重构优先于单文件凑分；相对单体 91.4 略降可接受）

## full_test

test-prompts #3（同步 skill 收益）：route 正确；portable/rejected 分离；darwinFollowUp=evaluate-only；未堆父 SKILL。

## 🔴 CHECKPOINT

是否进入 `optimize`（对父或最弱子节点 hill-climb）？默认建议：**先用人跑一次真实同步**，结构优化等有实测痛点再开。  
