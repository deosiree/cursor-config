# Darwin 评分基线（本 skill）

> 桥接 [[darwin-skill]]；skill 文档用 100 分制，**产物**用 12 分制。

## 产物 12 分制（mock 交付验收）

| # | 维度 | 2 分 | 0 分 |
|---|------|------|------|
| 1 | CSV 全量 | 传入行均有产物 | 漏行或二次筛选 |
| 2 | mock 路径 | `forward/` + 正斜杠 defineMock | 无 forward 或 Windows 路径错 |
| 3 | scenario | active 可切换 | 硬编码单场景 |
| 4 | curl 门禁 | code 匹配 mock_error_code | curl 仍 code:0 |
| 5 | workflow | 7 节齐全含注入脚本 | 缺节或只在用例 README 重复 |
| 6 | 用例 README | 每 case 独立文件链 workflow | 缺文件或超 50 行堆步骤 |
| 7 | mock README | ≤40 行索引 | 单文件膨胀 |
| 8 | registry | schema 完整 | 缺 mock_endpoint |
| 9 | 权限门禁 | pending_human 正确处理 | 猜错 perms 标 ok |
| 10 | gitignore | 本地产物已忽略 | 漏 gitignore |
| 11 | vite 零改动 | 未改 vite/env.d.ts | 改了配置 |
| 12 | 误路由 | 未写 pytest | 混入后端自动化 |

**通过线**：≥10/12 keep；<8 revert mock 增量

## 100 分制（skill 文档 Darwin）

与 darwin-skill 9 维同权重：`总分 = Σ(维度分×权重)/10`

### Round 3 明细（87.3/100 · HL-4 触顶）

| # | 维度 | 分(1-10) | 加权 |
|---|------|--------:|-----:|
| 1 | Frontmatter | 9 | 6.3 |
| 2 | 工作流清晰度 | 9 | 10.8 |
| 3 | 失败模式编码 | 9 | 10.8 |
| 4 | 检查点设计 | 8 | 4.8 |
| 5 | 可执行具体性 | 9 | 15.3 |
| 6 | 资源整合度 | 9 | 3.6 |
| 7 | 整体架构 | 8 | 9.6 |
| 8 | 实测表现 | 9 | 20.7 |
| 9 | 反例黑名单 | 9 | 5.4 |

**总分：87.3 / 100**

### HL-4 判定

| Round | 总分 | Δ |
|------:|-----:|--:|
| 0 | 70.0 | — |
| 1 | 82.4 | +12.4 |
| 2 | 86.8 | +4.4 |
| 3 | 87.3 | +0.5 |

Round 2–3 连续 Δ < 2 → **HL-4 触顶**，停止 hill-climbing

## keepOrRevert

| 100 分制 | 决策 |
|----------|------|
| ≥85 且 HL-4 未触顶 | keep，可继续优化 |
| ≥85 且 HL-4 已触顶 | **keep，停止优化** |
| <85 | revert 上一轮 SKILL 改动 |

## 日志

[[results/darwin-results.tsv]] · [[results/dry-run-evaluation.md]] · [[results/final-report.md]] · [[results/round0-selfcheck.md]]
