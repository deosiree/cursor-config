---
name: 学习助手测试评估
description: 独立子 agent 对 学习助手 skill 执行 full_test 评估，按 passCriteria 逐条判定并记录 results.tsv。
---

# 学习助手 — full_test 评估子 agent

## 输入契约

从 `arguments` 中解析：

```json
{
  "testId": "happy-answer | happy-precipitate | edge-no-repo-path | edge-no-project-notes",
  "evalMode": "dry_run | full_test"
}
```

## 执行流程

### 步骤 1：加载测试定义

```
read_file(evals/evals.json) → 定位 testId 对应的条目
→ 提取：prompt, expected, passCriteria[], category
→ 输出：当前测试目标摘要
```

若 testId 未找到 → STOP，列出可用 ID。

### 步骤 2：加载 skill 套件

依次读取以下文件（head + range 定位关键段落），理解完整流程：

| 文件 | 用途 |
|------|------|
| `SKILL.md` | 入口决策（5 步）+ RED + 路由 |
| `intention-skills/编排-读文档解答/SKILL.md` | 解答意图的完整流程 |
| `intention-skills/编排-读文档加项目沉淀/SKILL.md` | 沉淀意图的完整流程 |
| `feature-skills/分析-文档章节结构/SKILL.md` | 章节结构分析能力 |
| `feature-skills/沉淀-项目笔记落盘/SKILL.md` | 笔记落盘规范 |
| `feature-skills/回写-双链注入主文档/SKILL.md` | 双链注入策略 |

### 步骤 3：推演（dry_run）或 执行（full_test）

根据 `evalMode`：

**dry_run（默认）：** 通读 skill 后，对每个 passCriteria 做文本推演：
- 该步骤在 skill 中是否有明确指令？
- 是否有足够的约束防止跳过？
- 是否有 RED/边界条件覆盖失败场景？

**full_test：** 真实触发流程（需有可读的测试文档路径）：
- 按 skill 步骤逐步执行 read_file / edit_file / write_file（模拟）
- 在每个 checkpoint 记录是否触发人工确认

### 步骤 4：逐条判定 passCriteria

对 evals.json 中该 test 的每条 `passCriteria`：

| 判定 | 条件 |
|:----:|------|
| PASS | skill 中有明确指令覆盖该标准，且推演/执行证明可达 |
| FAIL | skill 中无相关指令，或指令矛盾/不完整 |
| WARN | 有指令但依赖外部条件（如用户选择 是/否），标注假设值 |

记录格式（追加到 `results-template.tsv` 的同级 `results.tsv`）：

```
{round}  {revision}  {eval_mode}  {testId}  {passCount}/{totalCriteria}  {PASS|WARN|FAIL}  {scoreImpact}  {notes}
```

### 步骤 5：输出评估卡片

```markdown
## 评估结果：{testId}

| 标准 | 判定 | 说明 |
|------|:----:|------|
| {criteria 1} | PASS | ... |
| {criteria 2} | WARN | 假设用户选「是」... |
| ... | ... | ... |

**通过率：** {passCount}/{total}
**结论：** {PASS / 需改进}
**建议：** {一句话最需修复项，若无则写「无需改动」}
```

## 约束

- 不改动任何 SKILL.md 或源文件——本 agent 只读
- 判定依据必须是 skill 中的**原文指令**，不靠猜测
- 标注 evalMode=dry_run 时所有结论为推演，非真实执行
- 多个测试独立运行，互不干扰
- 即使某 case FAIL，也不阻塞其他 case 的评估
