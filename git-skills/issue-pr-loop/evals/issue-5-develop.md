# Develop Plan：I-05 / GitHub #5

## 状态与锚点

- 状态：`in_progress`
- 项目 Goal：单个维护 Issue，不新建全局 Goal。
- GitHub Issue：https://github.com/deosiree/cursor-config/issues/5
- 分支：`feat/issue-5-format-language-sop`
- Issue 作者 / 实现者 / PR 作者 / reviewer / 合并者：deosiree / Codex / deosiree / unknown / deosiree（用户已授权合并）

## 背景与范围

为 `issue-pr-loop` 增加一致的 Issue 与 PR 输出 SOP、few-shot 样例、仓库语言决策规则和针对格式/语言行为的 Darwin 验收。Issue 发布和 PR 创建仍是独立阶段。

- 同时要求行业信息要素与本仓库格式时，将通用语义映射进本地章节，不覆盖本地章节名/顺序；Issue 分开记录提出时所依据的分支/commit 与实现/PR 目标分支。
- 用 TranslationTool Issue #1 验证 Issue/PR 写作流程：Issue 依据和预期 PR 目标均为已确认的 `develop`，与 GitHub 默认分支 `docker` 分开记录；将通用 PR 审阅要素组合进用户提供的 DCM 格式。业务决策已由用户补齐并记录在 request-inbox；本轮纠正为 skill 优化任务，未实现 TranslationTool 产品代码。

### 包含

- 主 skill、需求收敛、项目规划和单 Issue PR 流程中的格式与语言规则。
- 脱敏的 Issue 正例、缺空行反例与修正版、自有仓库中文 PR 样例、外部仓库语言样例。
- PR 样例展示 GitHub 通用审阅信息与 TranslationTool DCM 章节的映射；不把 commit-message 规范误当成 PR 标题规范。
- 官方规范来源、Darwin 测试集更新和真实运行记录。
- 经用户授权，仅为 GitLab Issue #3 的描述补充 Markdown 段落空行，不改文字、标题、状态或业务内容。

### 不包含

- 菜单搜索功能代码、测试或其它业务修复。
- 将内网主机、私有 Issue 正文或本机路径写入公开仓库。
- 未经评测门禁支持而降低既有验收标准。

## 实施节点

| Node | 改动 | 验收条件 | 验证方法 | 状态 |
| --- | --- | --- | --- | --- |
| N-01 | 记录当前版本并确认 Darwin 题集 | 当前 E0 为 0 错误、0 警告、0 提示；题集经用户确认 | Darwin E0 与题集检查 | `done` |
| N-02 | 编写 Issue/PR 语言与格式组合规则、few-shot 样例 | 通用信息映射到本地格式；Issue 分开记录依据分支/commit 与 PR 目标分支；merge 前不填造合并事实 | 文档审阅与 Markdown 源码检查 | `in_progress` |
| N-03 | 更新 skill 路由、README、调研与评测材料 | 引用可达；旧功能边界与原检查项保留；题集由用户更新并确认 | JSON/TSV 解析、链接检查、diff 检查 | `in_progress` |
| N-04 | 对同一开发题比较 s0 与候选版 | 盲评只看匿名产出；原检查项无倒退且新检查有证据 | Darwin E2-dev | `evaluated; not accepted` |
| N-05 | 用最终版和原版跑新留出题 | 题目/检查项未暴露给执行者；不降低门槛 | Darwin E2-holdout | `evaluated; not accepted` |
| N-06 | 在 GitLab Issue #3 实跑格式修复 | 只插入空行；改前后文本除空白外完全一致；读回确认渲染分段 | 远端描述读回 | `done` |
| N-07 | 按确认结果完成 TranslationTool Issue #1 并创建 PR | readiness 为 `ready`；以 `develop` 为 Issue 依据和 PR 目标分支；PR 合并通用信息与 DCM 本地章节 | 目标分支验证、Issue/PR 实时状态 | `deferred` |
| N-08 | 提交、推送、提 PR 并按授权合并 skill Issue #5 | PR 关联 #5；描述为中文且只记真实检查；合并 SHA 读回 | GitHub 实时状态 | `todo` |
| N-09 | 全新对话轻量提 Issue–提 PR 流程验证 | 显式调用后建立 Issue 草稿并等待确认；不改仓库或写远端；核对分支与 Markdown 格式 | 隔离新对话 transcript 与断言表 | `partial` |

## 验收与交付物

- [ ] 行业信息要素与仓库本地标题/章节/顺序可并存；Issue 记录依据分支和 SHA；未合并 PR 不填造合并版本。
- [ ] TranslationTool #1 已更新为 `ready`；Issue 依据与 PR 目标分别明确为 `develop`，与默认分支 `docker` 区分。

- [ ] 个人仓库默认中文；外部仓库遵循明确贡献规则或其主要语言；未知时先询问。
- [ ] 标题、段落、列表与代码块有正确 Markdown 空行。
- [ ] 正例、反例/修正版和 PR 样例可直接指导生成；不把样例事实当真实项目事实。
- [ ] 既有开发/留出检查不退步；新增盲测题按 Darwin 规程验收。
- [ ] GitLab #3 的业务文本和状态不变。
- [ ] PR #5 完成审查和用户授权的合并，记录合并 SHA。

N-07 已从 `in_progress` 改为 `deferred`：本轮经用户纠正后聚焦 `issue-pr-loop` skill 优化，没有开展 TranslationTool 产品代码实现、验证或 PR。Issue #1 的需求决策与 `develop` 基线记录保留；此前对实现和创建 PR 的授权不在本轮执行范围内，合并授权仍未给出。后续可在独立单 Issue 流程中继续；本状态不表示需求仍待澄清或此前授权已撤销。

## 验证记录

| 时间 | Commit | 命令/场景 | 结果 | 证据 |
| --- | --- | --- | --- | --- |
| 2026-11-26 | `77f90b3` | Darwin E0 当前版 | `pass` | 0 错误 / 0 警告 / 0 提示；136 行 |
| 2026-11-26 | `77f90b3` | 现有评测 JSON 解析 | `pass` | `test-prompts.json`、`evals.json`、`holdout-refresh-proposal.json` 可解析 |
| 2026-11-26 | `working-tree@77f90b3` | Darwin E0 与文档检查 | `pass` | 0 错误 / 0 警告 / 0 提示；主入口 152 行；JSON 解析、`git diff --check` 通过；E2 未启动 |
| 2026-11-26 | `77f90b3` | TranslationTool Issue #1 只读核查（历史快照） | `blocked` | 当时已读回基线与 PR base `develop@d5e2e821`，其它决策尚未补齐；后续用户决策见 `template/snapshot/request-inbox.md`，不得将此快照当作当前待澄清状态 |
| 2026-11-26 | `77f90b3` | TranslationTool 代码契约核对 | `finding` | 后端 `HttpResponse.Type.ERROR` 使用通用码 201；`ResultCode` 定义 201–208，前端将 203 当成功；本地校验 fixture 约定只显示单元格红字，但 `useSaveFlow` 有常驻通知路径 |
| 2026-11-26 | `working-tree@77f90b3` | 分支规则调整后的 Darwin E0、JSON 与 diff 检查 | `pass` | 0 错误 / 0 警告 / 0 提示；主入口 151 行；4 份 JSON 可解析；`git diff --check` 通过；E2 未运行，等待用户确认题集 |
| 2026-11-26 | `working-tree@77f90b3` | 最新题集解析、E0 与 `git diff --check` | `pass` | `test-prompts.json` 共 12 条；E0 0/0/0、主入口 151 行；diff 检查通过 |
| 2026-11-26 | `working-tree@77f90b3` | Darwin E2-dev：6 条、3 位盲评 | `invalid-comparison` | 原始 tally 为 2 胜、1 平、3 负，检查项 s0=23/26、候选=23/26；`SKILL.md` 11962→14985 字节（+25%）。dev-3 的 s0 产物记录 Issue #1 为 `needs-info`，sN 产物记录正文已改为用户确认后的 3000ms、错误码和 3 天/100 条等决策，测试输入发生漂移。排除 dev-3 后其余 5 条为 2 胜、1 平、2 负，检查项 s0=17/19、候选=19/19；候选仍未达到接受条件 |
| 2026-11-26 | `working-tree@77f90b3` | Darwin E2-holdout：holdout-1..4、6；三位盲评 | `not-accepted` | 1 胜、2 平、2 负；检查项 s0=14/17、候选=16/17。holdout-1..4 已曝光，仅作回归；holdout-6 是本轮新留出题，候选获胜但未覆盖全部检查项；holdout-5 要求真实远端发布，按协议跳过。因此不能宣称完整新留出集通过，tally 结果为多数负 |
| 2026-11-26 | `working-tree@d6bf56f` | 受控 Darwin E2-dev：dev-1..8，三位盲评 | `not-accepted` | 0 胜、6 平、2 负；逐题 dev-1 平 4/4、dev-2 平 4/4、dev-3 负 6/6、dev-4 平 2/2、dev-5 平 5/5、dev-6 平 4/4、dev-7 平 4/4、dev-8 负 4/4；双方 checks 中位数合计 33/33；SKILL.md 13779→15121 字节（+9.74%）。Darwin tally 裁决 `revert`。dev-4 两边均将 I-12 排到 I-10 合并之后；记录为排程行为观察，不擅自大改 skill |
| 2026-11-26 | `working-tree@d6bf56f` | 受控 Darwin E2-holdout-new：holdout-5、holdout-new-1..2，三位盲评 | `not-accepted` | 1 胜、1 平、1 负；holdout-5 2/3 对 3/3、holdout-new-1 5/5 对 5/5、holdout-new-2 5/5 对 5/5；checks 合计 s0=12/13、s1=13/13。tally 裁决 `revert`。holdout-new-1 answer 与同版 PR 草稿对“单测是否运行”记载矛盾；holdout-new-2 有 1 位评委偏好明确写出默认分支 `main` 的一侧，2 位评委打平；产物核对显示 s1 未点名 `main`，但 checks 仍与 s0 同为 5/5，记录为表达层面的单点差异 |
| 2026-11-26 | `working-tree@d6bf56f` | Darwin E2-regression：holdout-1..4、6 | `not-run` | 已曝光参考题本轮未执行；与 E2-holdout-new 分开记录，不混入 G-05 新留出成绩 |
| 2026-11-26 | `working-tree@d6bf56f` | G-06 全新对话轻量 Issue 流程 | `partial` | 隔离对话完成本地证据核查、候选记录、中文 Issue 草稿和精简方案，停在 `plan-pending-confirmation`；目标仓库 `main` 工作区复核干净，未访问/写入远端。未明确区分诊断分支与 PR 目标分支，故第 1 项部分满足；细项见隔离目录 `g06-final/assertions.md` |
| 2026-11-26 | `working-tree@d6bf56f` | 最终 Darwin E0、JSON/TSV 与 `git diff --check` | `pass` | E0 0/0/0，主入口 155 行；`test-prompts.json`、`evals/evals.json`、`trigger-tests.json`、`holdout-refresh-proposal.json` 均可解析；留出提案为 `confirmed` 且 note 写明用户于 2026-11-26 确认；TSV 27 行、9 列、无坏行；`git diff --check` 退出码 0，仅有 LF/CRLF 转换提示 |
## TranslationTool 共享 SOP 核查（只读）

- 代码仓库没有受跟踪的 `.github` Issue/PR 模板或 `CONTRIBUTING.md`；本地也未发现已跟踪的 DCM/PR 格式规范。
- 根目录 `AGENTS.md` 与 `.harness/` 被 `.git/info/exclude` 排除，`harness.db` 被 `.gitignore` 排除；`translation/docs/` 被子目录 `.gitignore` 排除。当前 Harness 模板只有 spec intake、story、decision、validation report 和 high-risk story，不包含 GitHub Issue 或 PR 模板。
- 因而“行业审阅信息 + TranslationTool DCM 字段”的约定目前没有通过 TranslationTool 仓库共享。未加载 `issue-pr-loop` 的 agent 不会从仓库 Harness 得到该 SOP。
- 后续可作为独立仓库治理 Issue 评审：增加受跟踪的 Issue/PR 模板、`CONTRIBUTING.md` 的语言与格式规则，并确认 AI 工具会读取的仓库级指令文件也受版本控制。本轮未改 TranslationTool、未创建该 Issue。
