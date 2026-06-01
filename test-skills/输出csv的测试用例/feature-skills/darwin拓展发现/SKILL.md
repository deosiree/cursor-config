---
name: darwin拓展发现
description: 在用例生成过程中发现能力缺口，输出新 intention/feature skill 沉淀方案（非通用 skill 打分器）。
---

# Darwin 拓展发现（本套件内置）

## 定位

借鉴 Darwin「观察 → 假设 → 验证 → 保留/放弃」循环，但**产物是新子 skill 的 Plan**，而非改写当前 SKILL 正文。

若用户要求「给本 skill 打分/优化文案」，转 `write-skill` 的 `darwin质量评估与迭代`。

## 强制触发

- 每轮 CSV / config / cases 产出后
- 无法路由的 test 路径（如 `src/views/**`）
- 用户输入仅口述、无 test.ts
- 同一兜底写法出现 ≥2 次

## 质量信号扫描

每轮同时检查产出质量：

- 用例名称含「同 TC」「同上」→ 名称不可检索
- 步骤 > 7 → 可拆性信号
- 预期含代码断言 → 界面语言退化信号
- `develop结果` ≠ `预期结果`（UI 路径）→ 字段不一致信号

质量信号累积 ≥3 次 → `proposedFeatureSkills` 加入「用例质量自检」优化方案。

## 扫描清单

| 信号 | 缺口类型 | 建议沉淀 |
|------|---------|---------|
| 无 test.ts，口述场景 | intention_oral | `基于源码+口述生成` |
| views 组件交互 | feature_views | `views-基于源码生成` |
| store 模块 | feature_store | `store-基于test.ts生成` |
| utils | feature_utils | `utils-基于test.ts生成` |
| types/enum | feature_types_enum | `types-` / `enum-基于源码生成` |
| 多模块联调 | feature_integration | `集成-基于源码生成` |
| E2E | feature_e2e | `端到端-基于场景生成` |
| expectTypeOf | compile_only_test | 跳过模式文档化 |
| route 测试在 store 目录 | path_routing_gap | 独立 `router-` feature |

完整路线图：`[[../../references/skill-expansion-roadmap.md]]`

## 输出契约（每轮）

```text
expansionSignals: [...]
proposedIntentionSkills: [{ name, trigger, priority, rationale }]
proposedFeatureSkills: [{ name, pathPattern, priority, rationale }]
artifactsPlan: [SKILL.md 骨架, references, few-shot]
qualityGatePlan: [test-prompts 条目]
humanGate: 默认仅输出 plan，不自动 mkdir（除非用户明确要求创建）
```

## 与脚本层拓展

若发现新模块仅需不同 `fieldDefaults`：

- **不必**新 feature skill
- 走 `沉淀模块配置` + 现有 `generate_test_csv.py` 即可

若发现新来源（Swagger、口述、E2E）：

- 新建 intention-skill，复用同一 `generate_test_csv.py`
