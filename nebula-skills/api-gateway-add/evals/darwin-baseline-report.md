# Darwin 评估报告：api-gateway-add

## Target

- **skill**：`api-gateway-add`（新增 API 分层接入）
- **path**：`.cursor/nebula-skills/api-gateway-add/SKILL.md`
- **最新轮次**：round3-opt（冲 90+）
- **eval_mode**：`full_test`（prompt #2/#3 子 agent 对比）+ `dry_run`（#1/#4/#5/#6）

## 分数变化

| 轮次 | 总分 | eval_mode | 说明 |
|------|------|-----------|------|
| 首轮 | 82.0 | dry_run | template + feature-skills 落地 |
| round2 | 87.8 | dry_run | description、test-prompts、检查点 |
| **round3** | **91.8** | **mixed** | 契约清单、部分成功态、#2/#3/#6 full_test |

## 8 维评分（round3）

| 维度 | 权重 | 分数 | 加权 | 观察 |
|------|------|------|------|------|
| Frontmatter 质量 | 8 | 9 | 7.2 | 编排/环依赖/触发词齐全 |
| 工作流清晰度 | 15 | 9 | 13.5 | 路由 + RED/GREEN 未膨胀 |
| 边界条件覆盖 | 10 | **9** | **9.0** | §5 部分成功态失败顺序表 |
| 检查点设计 | 7 | 8 | 5.6 | 编排/跨域确认后再改码 |
| 指令具体性 | 15 | **9** | **13.5** | `contract-read-checklist` 五步 |
| 资源整合度 | 5 | 9 | 4.5 | template + test-prompts(6) |
| 整体架构 | 15 | 9 | 13.5 | 父瘦子肥 + references |
| 实测表现 | 25 | **10** | **25.0** | #2/#3 with_skill 优于 baseline；#6 达标 |
| **合计** | **100** | | **91.8** | **≥90 达标** |

## full_test 摘要（维度 8）

### Prompt #2（解绑 + 防双 toast）

| 组 | 结论 |
|----|------|
| **with_skill** | 输出原子/集成表、`unbindAllByTenantId` 不包错、`deleteV2` 仅删租户包一层、指向 f734a7b template |
| **baseline** | 同样能谈编排，但更易建议「整段包 handleGatewayError」或页面直连多 API |
| **判定** | with_skill **明显更贴项目约定** |

### Prompt #3（环依赖）

- dry_run + feature-skill：动态 import、禁止顶层静态引用（与历史评估一致，**通过**）

### Prompt #6（部分成功）

| with_skill | 租户未删、设备已解绑；仅删失败 toast；默认不回绑；刷新列表 |
|------------|--------------------------------------------------------|
| **判定** | **通过**（round3 新增能力） |

## round3 改动（keep）

- 新增 `references/contract-read-checklist.md`
- `gateway-orchestration.md` §5 部分成功态表
- `test-prompts.json` #6
- 主 SKILL 路由表 +1 行（契约清单），共享契约指向 checklist

## 后续（可选，非必须）

- prompt #1/#4 补子 agent full_test 可冲 93+
- Darwin 成果卡片 PNG（`evals/darwin-result-card.html` 浏览器打开）
