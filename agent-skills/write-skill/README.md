# 写skill

## 定位
`写skill` 已从“单体 meta-skill”升级为“父级 agent + 意图层 + 功能层 + Darwin 质量闭环”的中文套件。

它吸收了三类已验证经验：
- `gen-README`：主 skill 应 agent 化，细节下沉到同级子skill。
- `i18n-server`：当任务同时存在“意图判断”和“功能落地”时，应拆成 `intention-skills/` 与 `feature-skills/`。
- `darwin-skill`：skill 写完不等于完成，还要评估、试跑、迭代优化。

## 当前结构

```text
write-skill/
├── write-skill-lite/        # 5 分钟上手入口（新用户优先读此）
├── README.md
├── SKILL.md
├── intention-skills/
├── feature-skills/
├── template/
├── assets/
├── references/
└── evals/
```

## 目录职责
- `write-skill-lite/`
  - 5 分钟上手入口，≤200 字触发到行动的决策表。
  - 新用户、忘记流程时的快速查阅点。
  - 完整版路由仍走 `SKILL.md`。
- `SKILL.md`
  - 父级 agent 入口。
  - 只负责分类、路由、人工门禁、Darwin 入口。
- `intention-skills/`
  - 负责判断当前到底要做哪类 skill 改造。
- `feature-skills/`
  - 负责具体落地某一项能力。
- `template/`
  - 只放父级套件模板、分层模板与 Darwin 接入模板。
- `assets/`
  - 放 agent 辅助素材、few-shot 索引、检查清单。
- `references/`
  - 放方法论、案例说明、Darwin 集成策略。
- `evals/`
  - 放 should-trigger / should-not-trigger 与质量门禁用例。

## 运行说明入口
如果你需要的是“当前应该怎么执行这一套”，优先看：
- `[[SKILL.md]]`
- `[[references/write-skill-operating-guide.md]]`

当前 README 主要保留长期背景、结构职责和演化边界，不再承接完整执行手册。

## callback 约束基线
当前分层版 `write-skill` 不是自由演化状态，它受 `write-skill-single` 约束。

约束来源：
- `[[../write-skill-single/SKILL.md]]`
- `[[references/write-skill-single-guardrails.md]]`

这份基线要求至少满足：
- 主 `SKILL.md` 保留 `RED`、`GREEN`、`REFACTOR`
- 主 `SKILL.md` 与 `README.md` 都有使用示例
- 子 skill 主文档不是空壳
- 主文档能直接读到任务、输入、输出、边界和摘要级示例

当前 `write-skill` 仍保留分层实现，但分层不能成为“把有效内容全部下沉”的借口。

## 长期结构原则
以下判断现在作为长期原则保留，而不是每次都在主入口重复展开：
- 何时升级为父级 agent 套件
- 何时继续拆成 `intention-skills/` 与 `feature-skills/`
- 何时把质量门禁从 feature 升到 intention
- 何时删除不承担判断职责的中间层

对应规则入口：
- `[[references/write-skill-operating-guide.md]]`
- `[[references/write-skill-single-guardrails.md]]`
- `[[references/writing-skills-core.md]]`

## Darwin 与执行流
Darwin 接入策略、执行顺序、人工门禁与回退策略不再在 README 里展开细编排。

执行性说明统一下沉到：
- `[[references/write-skill-operating-guide.md]]`
- `[[intention-skills/编排-skill质量迭代/SKILL.md]]`
- `[[feature-skills/darwin质量评估与迭代/SKILL.md]]`

## 子 skill 主文档最低要求
每个 intention / feature 节点的主 `SKILL.md` 至少应包含：
- 核心任务
- 何时触发
- 输入 / 前置条件
- 输出字段
- 边界
- 使用示例

每个节点的 `README.md` 至少应包含：
- 作用说明
- 适用场景
- 与相邻节点边界
- 模板 / few-shot / evals 入口
- 使用示例

## intention-skills
- `[[intention-skills/分析-skill现状/SKILL.md]]`
- `[[intention-skills/策略-新建skill/SKILL.md]]`
- `[[intention-skills/策略-升级旧skill/SKILL.md]]`
- `[[intention-skills/迁移-主skill改造为agent/SKILL.md]]`
- `[[intention-skills/迁移-拆分意图层与功能层/SKILL.md]]`
- `[[intention-skills/主文档反空心化验收/SKILL.md]]`
- `[[intention-skills/编排-skill质量迭代/SKILL.md]]`

## feature-skills
- `[[feature-skills/子skill路由决策/SKILL.md]]`
- `[[feature-skills/中文技能命名收敛/SKILL.md]]`
- `[[feature-skills/子skill上提与中间层删除/SKILL.md]]`
- `[[feature-skills/模板类型判定/SKILL.md]]`
- `[[feature-skills/历史版本回填为few-shot/SKILL.md]]`
- `[[feature-skills/主SKILL瘦身与下沉/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-基于RED写before/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-基于GREEN写after/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-写mvp/SKILL.md]]`
- `[[feature-skills/真实历史样本型模板-写snapshot/SKILL.md]]`
- `[[feature-skills/references与evals补全/SKILL.md]]`
- `[[feature-skills/Markdown格式规范收尾/SKILL.md]]`
- `[[feature-skills/darwin质量评估与迭代/SKILL.md]]`

## 模板实体化标准
除 `模板类型判定` 外，单一模型节点不再保留 `template/update-skill` 或 `template/add-skill` 这一层。

统一约定：
- 更新型节点：直接使用 `template/before`、`template/after`
- 新增型节点：直接使用 `template/mvp`、`template/snapshot`

模板不是薄说明壳：
- `before` 默认必须是错误态、失败产物或真实历史版本片段
- `after` 必须是成品态，优先来自真实历史样本
- 只有 `主文档反空心化验收` 这个节点自身，允许 `before` 表现为空心问题态
- `template/<scenario>/` 除实体样本外，还必须有最小结构说明，解释样本如何从历史事实中抽取出来

## 门禁能力
反空心化门禁现在已升到 intention 层：
- `[[intention-skills/主文档反空心化验收/SKILL.md]]`

它只负责判定与回流，不替代：
- `主SKILL瘦身与下沉`
- `references与evals补全`
- `真实历史样本型模板-*`

## 样例来源
当前套件正式把这些案例当作 few-shot 入口：
- `gen-README`
  - 旧套件升级为父级 agent + 同级子skill
- `i18n-server`
  - 从平铺子skill演化到 `intention-skills/` + `feature-skills/`
- `darwin-skill`
  - skill 写完后继续评估、试跑、迭代

案例说明见：
- `[[references/旧skill升级为agent-skill案例说明.md]]`
- `[[references/意图层与功能层拆分案例说明.md]]`
- `[[references/darwin评估闭环案例说明.md]]`

## 当前维护重点
- 主 `SKILL.md` 继续保持 agent 入口，不回流低频解释。
- README 保留长期背景、结构职责与维护边界。
- 更细的执行流和对照试跑结论继续下沉到 references / 子节点。

## 使用示例
```text
使用 $写skill 优化 F:\Documents\Repertory\Sieyuan\nebula\.cursor\agent-skills\write-skill，
把主 skill 保持为 agent 入口，新增 intention-skills 与 feature-skills，
并接入 Darwin 质量评估闭环。
```

## 当前 frontmatter 模式
本套件使用“本地中文模式”：
- `name` 用中文
- `description` 用中文触发描述

## 主入口不再承载的内容
以下内容保留在 README、references 或子skill 中，不再回流到主 `SKILL.md`：
- 标准阶段顺序的展开说明
- Refactor 信号与长期演化说明
- Darwin 细编排与 keep / revert 细则
- 长示例与 README 级背景说明

但以下内容不能全部下沉：
- 主套件和子 skill 的摘要级任务说明
- 主文档中的输入 / 输出 / 边界
- 主文档中的最小使用示例
