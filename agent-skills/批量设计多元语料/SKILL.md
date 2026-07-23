---
name: 批量设计多元语料
description: 为产品仓批量设计可门禁验收的多元 RAG 语料场。触发词：继续语料 Goal、补语料、升门禁、跨模块旅程、EVAL_GATES、跑门禁、formats/raw、golden-qa。流程：Goal 看板 → 源码挖掘（单模块+跨模块）→ 多格式导出 → check-*-gates.py PASS。人工勾选不算 PASS；禁臆造 UI；升阈值须人工确认。
version: 1.2.0
tags: [rag, corpus, eval-gates, journeys, faq, sop, knowledge, 继续语料Goal, 升门禁]
metadata:
  tier: agent
  should_trigger:
    - 继续语料 Goal
    - 补语料 / 扩语料 / 深语料
    - 升门禁 / 抬阈值 / EVAL_GATES
    - 跨模块旅程 / journey_id
    - 跑门禁 / check-rag-corpus-gates
  should_not_trigger:
    - 只改业务 API/Vue 功能、不碰语料目录
    - 评估本 skill 文档质量（应走 Darwin，不挖语料）
    - 整棵复制 data/rag-corpus 进 skill
  depends:
    intentions:
      - intention-skills/编排-语料Goal到门禁PASS/SKILL.md
      - intention-skills/分析-语料缺口与阈值提案/SKILL.md
    features:
      - feature-skills/落盘-门禁与看板/SKILL.md
      - feature-skills/挖掘-模块语料/SKILL.md
      - feature-skills/挖掘-跨模块旅程/SKILL.md
      - feature-skills/导出-多格式raw与数据集/SKILL.md
      - feature-skills/核验-门禁脚本与续跑/SKILL.md
---

# 目标

把「为目标产品仓建设可脚本验收的多元操作语料」标准化为可路由 agent 套件：先落门禁与看板，再按模块与跨模块旅程从源码挖掘正文，导出 raw/测集，最后只认门禁脚本 PASS。

## 何时使用

- 新产品或已有产品要建/扩 RAG 操作语料场（FAQ、SOP、排障、场景、跨模块旅程）
- 用户说「继续语料 Goal」「补语料」「升门禁」「跨模块旅程不够」
- 需要把「感觉写够了」变成可重复的 `check-*-gates.py` 外证

## 何时不要使用

- 只要改业务功能代码、不碰语料目录 → 走产品仓自身 story/harness
- 只要评估本 skill 文档质量（Darwin）→ 见文末可选桥接，不走语料 Goal 主链
- 要把整棵既有语料仓拷进 skill 当模板 → **禁止**；只引用路径与摘录 few-shot

## RED · 失败基线

1. 用文件篇数 / 人工勾选宣称 DONE，不跑门禁脚本
2. 只堆单模块 FAQ，没有跨模块旅程与 handoff
3. 臆造按钮文案、弹窗标题；无 Vue/源码证据路径
4. 用「附录加厚」「垫字」凑汉字量，且计入体积门禁
5. 自动截图覆盖人类已拍路径
6. 静默抬高阈值冒充达标，或不升 `EVAL_GATES` 版本号

### 失败模式 fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|----------|----------|------------|
| 门禁 FAIL | 只修报告中的 FAIL 项 | 拆更小旅程/模块批次再跑 |
| 源码找不到 UI 文案 | 标「待源码确认」并跳过该句；不编造 | 问用户指认页面/组件路径 |
| 截图缺失 | 写 `【待补截图：…】`；人优先 | opencli 仅填**空缺**路径，禁覆盖 |
| 测集不够 | 先补金标与旅程矩阵，再导出 split | 下调提案阈值走「分析-缺口」+ 🔴 |
| 阈值要抬高 | 先提案表，等人确认再改门禁文件 | 维持旧版阈值，仅扩内容 |
| 用户只要「写几篇 FAQ」 | 仍走模块挖掘；提醒无旅程则门禁会 FAIL | 问是否只做模块草稿、暂缓 Goal |
| 导出后用户以为已收工 | 强制跑核验脚本；贴 exit code | 拒绝在 GOALS 打勾 |

### 误路由纠正

| 错误派发 | 纠正 |
|----------|------|
| 「继续 Goal」→ 又写一版空计划 | 改派 [[feature-skills/核验-门禁脚本与续跑/SKILL.md]] |
| 「升阈值」→ 直接改脚本常量 | 改派 [[intention-skills/分析-语料缺口与阈值提案/SKILL.md]] |
| 「补旅程」→ 只堆 FAQ | 改派 [[feature-skills/挖掘-跨模块旅程/SKILL.md]] |
| Darwin 评本 skill → 跑语料挖掘 | 停；走文末可选 Darwin 桥接 |

## 人工门禁

| 条件 | 动作 |
|------|------|
| 首次为某仓落盘门禁默认阈值 | 🔴 展示阈值表，确认语料根路径与是否 gitignore |
| 用户要求「更严 / 升阈值」 | 🔴 提案新旧对比 → 确认后升 `EVAL_GATES` 版本号 |
| 用户要求「降阈值以快速绿灯」 | 🔴 标明技术债后才可改；仍须 bump 版本号 |
| 覆盖已有人类截图 | 🔴 **默认拒绝**；仅当用户点名路径才覆盖 |
| 把垫字附录重新计入体积 | 🔴 拒绝；须改 MANIFEST 策略并说明 |

## 路由表

| 用户意图 / 信号 | 派发 |
|-----------------|------|
| 从 0 建场、继续 Goal、跑到 PASS | [[intention-skills/编排-语料Goal到门禁PASS/SKILL.md]] |
| 觉得不够深、要抬阈值、只问缺口 | [[intention-skills/分析-语料缺口与阈值提案/SKILL.md]] |
| 只写 EVAL_GATES / GOALS / matrix | [[feature-skills/落盘-门禁与看板/SKILL.md]] |
| 只挖某一菜单/模块 | [[feature-skills/挖掘-模块语料/SKILL.md]] |
| 只要跨模块闭环 / journey_id | [[feature-skills/挖掘-跨模块旅程/SKILL.md]] |
| 只要 formats/raw 或 split-*.jsonl | [[feature-skills/导出-多格式raw与数据集/SKILL.md]] |
| 「继续语料 Goal」续跑、只修 FAIL | [[feature-skills/核验-门禁脚本与续跑/SKILL.md]] |

## 主工作流（必须可执行）

```text
Intake(目标仓, 语料根, 阈值版本)
  → 落盘-门禁与看板（EVAL_GATES + GOALS + matrices + check 脚本）
  → 挖掘-模块语料（FAQ/SOP/排障/场景；源码可证）
  → 挖掘-跨模块旅程（journeys + handoffs + 金标 journey_id）
  → 导出-多格式raw与数据集（formats/raw + split-test/runtime）
  → 核验-门禁脚本与续跑
       ├─ FAIL → 只修 FAIL → 再跑脚本
       ├─ PASS 且用户要更严 → 分析-缺口 → 🔴 升阈值 → 回到看板
       └─ PASS → 语料就绪（截图可跳过或人补）
```

### 每步退出标准（未满足不得宣称该步完成）

| 步骤 | 退出标准（DoD） |
|------|-----------------|
| Intake | YAML 四要素齐：`repo_root`/`corpus_root`/`ui_src_root`/`gates_version`；阈值若改严已 🔴 |
| 落盘看板 | `EVAL_GATES.md`+`GOALS.md`+两矩阵+`scripts/check-*-gates.py` 可启动（允许首跑 FAIL） |
| 模块挖掘 | 本批模块在 coverage 有路径且文含证据节；无垫字文件名 |
| 跨模块旅程 | journeys-matrix 本批行 path 存在；正文含五锚点；每 id ≥ 阈条金标 |
| 导出 | `formats/raw` 至少 md+txt；`golden-qa`/`split-*` 可被脚本计数 |
| 核验 | 脚本 exit 0；或 FAIL 清单已派发且未改 GOALS 假勾选 |

**分支：已有门禁文件** → 跳过「落盘」中的模板复制，只校验版本与常量一致，直接核验或按 FAIL 挖掘。

续跑入口（用户说「继续语料 Goal」）：

1. 直接跑门禁脚本（见核验 feature）
2. 读 FAIL 列表，禁止新开「感觉不够」空计划
3. 只修 FAIL；PASS 后停止或等人确认升阈值

## 黑名单（硬约束）

详见 [[references/反例黑名单.md]]。摘要：

- 人工勾选 / 目测篇数 ≠ PASS
- 禁止无源码证据的 UI 字符串
- 禁止垫字附录计入体积；文件名含「附录|加厚」应排除或 deprecated
- 禁止只交付单模块而无旅程矩阵全绿
- 禁止覆盖人类截图
- 禁止不升版本号改严阈值

## 默认阈值（可被产品需求覆盖）

见 [[references/门禁阈值模板.md]]（对齐 translationtool `EVAL_GATES` v1.1 量级）：

- 去垫汉字 ≥ 80_000；styles 下 md ≥ 200；单文件汉字 ≤ 12_000
- 旅程矩阵全绿；每旅程文档含 前置/步骤/模块切换/失败/证据
- golden 测集 ≥ 80、运行集 ≥ 40；每旅程 ≥ 6 条金标（可配置）
- 截图：默认可 `--skip-shots`；人优先

## 输入 / 输出

**Intake（填值样例，复制后改）**

```yaml
repo_root: F:/Documents/Repertory/Sieyuan/translationtool
corpus_root: data/rag-corpus
ui_src_root: translation/src
gates_version: v1.1.0          # 改严须 🔴 后 bump
skip_shots: true
modules: [workbench, entry, configure]   # 可 []，由侧栏推断
known_journeys: [J-EXCEL-LOOP]         # 可 []
```

**续跑命令（可复制）**

```bash
cd <repo_root>
python scripts/check-rag-corpus-gates.py --skip-shots
# 可选 JSON：python scripts/check-rag-corpus-gates.py --skip-shots --json
```

**状态一行（PASS/FAIL 对外口径）**

```text
corpus_goal version=<EVAL_GATES版本> <PASS|FAIL> han≈<n> md=<n>/<min> journeys=<n> golden=<total>(test=<a>,runtime=<b>) shots=<skipped|ok|fail>
```

**输出产物**

- `EVAL_GATES.md`、`GOALS.md`、`eval/*-matrix.yaml`、`check-*-gates.py`
- `styles/**` 模块文 + `styles/journeys/**`
- `formats/raw/**`、`eval/golden-qa*.jsonl`、`split-*.jsonl`
- 门禁报告（exit 0 = PASS）；`GOALS.md` 只粘贴脚本摘要

## 可选：本 skill 自身质量（不阻塞首交付）

落盘本套件后，若用户点头，可用 Darwin **evaluate-only** 评估 skill 文档质量（不自动 hill-climb、不开 git 优化分支）。编排入口可挂：

- `write-skill` 套件内 `intention-skills/编排-skill质量迭代`（若环境已装）

**默认不跑。** 语料 Goal 的 PASS 只认目标仓的 corpus gate 脚本。

## 参考

- [[references/门禁阈值模板.md]]
- [[references/反例黑名单.md]]
- [[references/翻译工具实战对照.md]]
- [[assets/skill-output-checklist.md]]
- [[assets/few-shot-example/]]
- [[template/]]
