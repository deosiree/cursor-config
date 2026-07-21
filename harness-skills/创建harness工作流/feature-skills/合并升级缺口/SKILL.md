---
name: 合并升级缺口
description: 旧 harness 按 gapChecklist 合并补缺：保留历史，旁路 Eval，禁止整夹覆盖。触发词：合并缺口、升级合并、勿毁历史。
---

# 合并升级缺口

## 前置

`mode=legacy`；已有 `gapChecklist`。

## 步骤

1. 过滤 `status=无|部分`  
2. 每个缺口对应「改哪一文件、插入/增链什么要点」写入 `filesToWrite`  
3. 已有 Eval / score-history：默认旁路；覆盖须 🔴  
4. 同事要拷样例全文 → 只保留能力槽位说明，L2 改目标仓手段  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 计划删除旧 ADR/历史 score | 🔴 人确认 | 取消该条 |
| gap 为空仍生成大补丁 | 改为 audit 报告 | filesToWrite=[] |

## 输出

`filesToWrite`（合并取向）+ `qualityLoopMeans`（若缺口含质量 Loop）。
