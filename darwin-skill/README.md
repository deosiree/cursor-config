## 达尔文式技能优化

本套件采用**本地中文模式**：
- `frontmatter.name` 使用中文：`达尔文式技能优化`
- `frontmatter.description` 使用中文触发描述

这个 skill 的定位不是“自动乱改别人的 skill”，而是把 skill 优化变成**有基线、有试跑、有回滚、有人类检查点**的受控实验流程。

## 当前建议

现在的 `darwin-skill` 已经从旧式单主文件展示结构，收敛为更适合本地仓库复用的中文 skill 套件。推荐使用顺序：

1. 先跑 `evaluate-only`
2. 再跑 `controlled-trial`
3. 最后再决定是否进入 `optimize`

第一次使用时，不建议直接“优化所有 skills”。

## 目录职责

- `SKILL.md`
  - 只保留 agent 每次激活都必须看到的执行规则、评分口径和门禁。
- `template/`
  - 放真实受控试跑模板，供人类仿写或复用。
- `templates/`
  - 保留原有结果卡片 HTML 模板，属于视觉产物模板，不等于标准 skill 的 `template/`。
- `assets/`
  - 放 frontmatter 模板、few-shot 入口和试跑检查清单。
- `references/`
  - 放写 skill 规范摘要、达尔文方法论、路径兼容策略等长说明。
- `evals/`
  - 放 should-trigger / should-not-trigger / acceptance checks。
- `docs/`
  - 保留对外展示页面与静态文档。
- `scripts/`
  - 保留结果卡片截图脚本等辅助工具。

## 为什么要新增标准 `template/`

旧版 `darwin-skill` 有 `templates/`，但它服务的是**成果卡片可视化**，不是 skill 的 few-shot 或试跑模板。  
本轮新增的 `template/受控试跑/` 用于回答另外一个问题：第一次真实落地时，怎么做一轮安全、可复盘的 baseline 试跑。

## 受控试跑模板

入口：`[[template/受控试跑/README.md]]`

这套模板至少包含：
- `test-prompts.json`
- `results.tsv`
- `baseline-report.md`

它们的目的不是展示，而是让维护者快速复用一次“仅评估不改”的真实试跑。

## few-shot 入口

入口：`[[assets/few-shot-example/README.md]]`

few-shot 不再另造一套独立说明，而是直接指向受控试跑模板和一个最小 target skill 示例。这样能避免 few-shot 和真实模板长期分叉。

## 路径兼容策略

旧版内容大量假设 `.claude/skills/...`。本地落地时改成更中性的发现顺序：

1. 用户显式提供路径
2. 当前仓库 `.cursor/**/SKILL.md`
3. 当前仓库 `.claude/**/SKILL.md`
4. 已知 skills 根目录

细节见 `[[references/darwin-methodology.md]]`。

## 结果卡片资产

以下资产保留，不参与主 `SKILL.md` 激活上下文：
- `templates/result-card.html`
- `templates/result-card-dark.html`
- `templates/result-card-white.html`
- `scripts/screenshot.mjs`

这部分现在属于“实现层资产”，而不是“主规则正文”。

## 使用示例

### 仅评估不改
```text
使用达尔文式技能优化评估 .cursor/nebula-skills/gen-perms-apis/SKILL.md，
输出 baseline 分数、最弱维度和建议测试提示词，不要改文件。
```

### 受控试跑
```text
使用达尔文式技能优化对 .cursor/md-skills/gen-README/SKILL.md 做一次受控试跑，
只跑 1 个 skill，允许 dry_run，不进入自动 commit / revert。
```

## 当前验收标准

- 主 `SKILL.md` 明显瘦身，不再承载展示层大段内容
- 存在 `references/`、`evals/`、标准 `template/`、`assets/few-shot-example/`
- 不再硬编码 `.claude/skills` 为唯一落地路径
- 可以先完成一次单 skill 的 `evaluate-only` 或 `controlled-trial`
