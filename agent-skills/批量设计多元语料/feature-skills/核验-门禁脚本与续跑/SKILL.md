---
name: 核验-门禁脚本与续跑
description: 运行语料门禁脚本；PASS 才算达标。续跑只修 FAIL；截图人优先；支持 --skip-shots。禁止用勾选代替 exit 0。
version: 1.0.0
tags: [rag, gate, verify, continue-goal]
metadata:
  tier: feature
  parent: 批量设计多元语料
---

# 目标

成为「继续语料 Goal」的默认入口：跑脚本 → 解读报告 → 只修 FAIL → 再跑，直到 PASS 或人工止损。

## 何时使用

- 用户说：继续语料 Goal / 跑门禁 / 是否达标
- 编排最后一环与 FAIL 循环

## 输入

- 产品仓内 `scripts/check-*-gates.py`（或等价）
- 可选：`--skip-shots`、`--json`
- 当前语料根

## 步骤

1. **执行**（在 repo_root）：

   ```bash
   python scripts/check-rag-corpus-gates.py --skip-shots
   ```

   （脚本名以仓内实际为准。）

2. **解读**  
   分类 FAIL：体积 / md 数 / 旅程节 / 矩阵 / golden 分片 / 截图。  
   截图 FAIL：若策略为人优先，保持 skip 或列「待人补」清单，**不覆盖已有图**。

3. **只修 FAIL**  
   | FAIL 类 | 派谁 |
   |---------|------|
   | 体积/结构空洞 | 挖掘-模块 或 旅程加厚 |
   | 旅程/矩阵 | 挖掘-跨模块旅程 |
   | 金标/split | 旅程金标 + 导出 |
   | 门禁文件缺失 | 落盘-门禁与看板 |
   | 阈值太严且人要降 | 转分析-缺口 🔴 |

4. **禁止**  
   - 新开「感觉不够」空计划而无报告  
   - 改 GOALS 打勾  
   - 为过门禁启用垫字附录

5. **PASS**  
   把脚本摘要写入 `GOALS.md` / `last-gate-report.txt`；告知用户就绪。若用户还要更严 → 分析-缺口。

## 输出

- 终端报告 + 退出码
- FAIL 修复清单（若未过）
- PASS 时一句话计数摘要

## 失败分支

| 情况 | 动作 |
|------|------|
| 缺 PyYAML 等依赖 | 提示安装；exit 2 不充当业务 FAIL |
| 脚本路径错误 | 对照落盘 feature 修复 |
| 同 FAIL ≥3 轮 | 停；完整报告 + 请人选型 |

## 反例

- 未跑脚本声称 DONE
- 修无关文件「顺便重构」
- opencli 覆盖人类截图「为了过 shots 门」

## 验收

- PASS ⟺ 脚本 exit 0
- 续跑叙事中含至少一次真实命令输出摘要
