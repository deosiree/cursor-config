---
name: 反拷贝与泄漏扫描
description: 拒绝拷贝样例业务规则/L2 路径；扫描产物样例专有名词；输出 sampleLeakScan。触发词：反拷贝、sampleLeakScan、泄漏扫描。
---

# 反拷贝与泄漏扫描

## 黑名单动作（出现即 🛑）

1. 拷贝样例命名/会话/后端边界当通用真理  
2. 规定「L2 必须用样例 openCLI/hytests 路径」  
3. 同步 harness = 复制样例 docs 全文  
4. 未给路径却用当前工作区样例仓填满 discovery  
5. 把业务特例写入 `可迁移能力.md`  

## 反例（错 → 对）

| 错 | 对 |
| --- | --- |
| 拷 Cookie-Session/Apex/seccenter 进新仓 | 问新仓自己的边界写进宪法 |
| L2 必须 openCLI | L2=目标仓脚本；无则先补 |
| 学样例业务=建 harness | 学 Discovery/对照/填空 |
| 工作区冒充目标仓 | unknown + 🔴 问路径 |

## 扫描步骤

1. 检查拟输出正文与 YAML  
2. 样例专有名词仅允许出现在「拒绝说明」或 `样例-*.md` 引用  
3. 输出 `sampleLeakScan: 通过|失败`；失败则调用方不得 DONE  

## 失败分支

| 触发 | 一线 | 兜底 |
| --- | --- | --- |
| 泄漏 | 改写为目标名词 | sampleLeakScan=失败，打回 |
| 用户坚持拷贝 | 🛑 终止本 skill 路径 | — |
