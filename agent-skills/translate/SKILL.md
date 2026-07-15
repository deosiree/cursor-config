---
name: translate
description: 批量翻译词条 CSV/XLSX（zh2en/en2ru/pipeline）；单模型或多模型分摊；交付前校验占位符与防行错位。触发词：词条翻译、英译俄、en2ru、pipeline、多模型并发、测模型、probe models、防错位、译后验证。
version: 3.2.0
tags: [translation, i18n, zh2en, en2ru, pipeline, multi-model, concurrency, xlsx, csv, placeholders, anti-misalign]
metadata:
  darwin:
    last_eval: 2026-07-15
    baseline_score: 76.8
    round1_score: 83.5
    round2_score: null
    final_score: null
    rounds: 1
    hl4_reached: false
    stop_reason: "in_progress after quality-loop doc wiring"
    full_tests:
      - batch-wire-multiline
      - test-en2ru-residual
      - misalign-10-regression
      - en2ru-quality-loop-3842
  concurrency:
    model: multi-model-or-delegate
    delegateTo: 多模型并发调度
    dagDefaultCap: 20
    observedFullRun:
      date: 2026-07-15
      rows: 3842
      filled: 3838
      empty: 4
      elapsed_min: ~9
---

# 目标

把「模式判定 →（可选）并发调度委托 → 执行 → 校验写出 → **译后防错位验证**」标准化为可路由套件。

## 何时使用

- 批量 zh2en / en2ru / pipeline
- 指定单模型、`--multi-model` 分摊、或委托「多模型并发调度」提案路权
- 探测目录模型是否可用（脚本在并发调度套件）
- 占位符 + 换行哨兵 `⟦__NL__⟧`、断点续跑、`--limit` 试跑后再全量
- 交付前确认无行错位 / 无脏写（`验证-译后防错位`）

## 何时不要使用

- JSON / `.dic` / `.report` 俄语超长缩短 → `json-精简超长翻译`
- 数据库回滚 / 审核副作用 → `db-回滚数据库`
- 单条聊天润色、无文件输入的临时翻译
- 把 `acceptanceReport.pass=false` 的产物直接回填业务库

## 输入契约

| 字段 | 说明 | 默认 |
|------|------|------|
| `inputPath` | CSV/XLSX 路径 | 翻译必填；探测可空 |
| `outputDir` | 输出目录 | 翻译必填 |
| `mode` | `zh2en` / `en2ru` / `pipeline` | 可推断；缺省 zh2en |
| `modelPolicy` | `single` / `all` / `list`（路权细节委托并发调度套件） | `single` |
| `models` | `list` 时的模型 id；`all` 时 `--models all` | `[]` |
| `limit` | 试跑条数 | 可选 |
| `force` | 覆盖已有译文 | false |

缺关键事实时 🔴 STOP：翻译缺路径；方向无法推断。

## RED · 失败基线

1. 默认当成 zh2en，俄文列仍空。
2. 占位符 `%1` 被改写或丢失。
3. API 失败后整批静默空译文。
4. 全量未经试跑直接跑。
5. 与「缩短俄语」skill 混淆。
6. 把流水线拆成两次串行全量。
7. 未说多模型却开满模型，浪费限免额度。
8. **批内源文含换行未 mask** → 按行解析串行（历史毒行）。
9. **条数不齐仍补空当成功** → 整批错位落盘。
10. **校验失败仍写入目标列** → 脏俄文可交付假象。
11. **DAG 打满 20 路齐发** → 讯飞 `ServiceIsBusy`、硅基 `ECONNRESET` 刷屏（全量 3842 实跑已见）。
12. **把「首选模型 ❌」当成「全部 API / skill 解耦引用坏了」** → 误杀：日志里仍有后续 worker 成功。
13. **全量结束后留空行却直接 `--force` 重跑** → 浪费已填好的合格译文。
14. **俄文列含汉字 / 换行数≠英源 / 短词配长译** → hardFail；须质量环，不可手填混搭凑数。
15. **无 `en2ru-quality-loop.json` 却宣称可交付** → `recommendDeliver` 必须为 false。

### 失败模式 fallback

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| 模式不明 | 问 zh2en / en2ru / pipeline | 列结构推断 |
| 模型名单模糊 | 对照短名目录问确认 | 回退 `single` |
| 日志出现 `所有API都失败`（整批） | 查 Key / 网关 TLS；换 `--multi-model` | `_errors.log` + resume |
| 仅见首选 ❌ + Busy/ECONNRESET | **先数** `en2ru 批量翻译成功`；有成功则继续跑 | 错峰 / 减小同时在飞批（先 `--limit 200`） |
| en2ru + `--models all` | 自动绕过 `限制` 含「英翻俄时只能输出英」的通用 chat 模型，仅留 `mt`（讯飞 Hy-MT / 硅基 Hunyuan-MT） | 需强行启用受限模型时设 `TRANSLATE_ALLOW_EN2RU_ECHO_MODELS=1` |
| en2ru 写盘前 | 剥 `Тип (Type)` 括号英注；扫齐残留拉丁词 → 分批 LLM `KEEP`/`REPLACE`（缓存 `en2ru-term-decisions.json`；优先 `resolveVerifyWorker`=DeepSeek-V4-Flash） | 离线：`node scripts/remediate-ru-mixed-en.js --in *_RU机翻.xlsx` |
| `cjkInRu` / `nlParityFails` / `enEchoFails` / `suspectMisalign` 非空 | `node scripts/remediate-en2ru-until-clean.js --in *_RU机翻.xlsx` | 仍失败：目标列空 + 备注「需人工」；🔴 STOP 禁止回填 |
| `pass=true` 但无 `en2ru-quality-loop.json` | 先跑质量环再交付 | 禁止用免费 MT 冒充语义验收 |
| Key 缺失 | 提示填 `.env` | `probe-models` → `skipped_no_key` |
| 批量结果数量不匹配（期望 N 实际 0） | **拒收整批** → 重试 → 换 worker（门禁正确，非引用错误） | 缩小 batch / 单条 |
| 占位符校验失败 | **不写目标列** + 备注1 | resume 失败 id 或人工 |
| 产出 `empty>0` 且无脏写 | **禁止 `--force`**：同命令去掉 force 做 skipIfFilled resume | 人工补剩余空行 |
| `stillLooksMisaligned` 非空 | 打开该 id 人审：可能是与旧毒行「语义碰巧相近」的误报 | 占位符齐套则标注 override 后再交付 |
| `placeholderFails` / `dirtyWrites` 非空 | 查批线协议 / 拒写门禁 | 🔴 STOP 禁止回填 |

## 人工门禁

| 条件 | 动作 |
|------|------|
| en2ru / pipeline 全量前未试跑 | 🔴 CHECKPOINT：先 `--limit 20` |
| 未指定模型 + 要开多模型 | 🔴 CHECKPOINT：先走「多模型并发调度」提案表 |
| 输入文件不存在 | 🔴 STOP：要求绝对路径 |
| `verify-post-translate` → `pass=false` | 🔴 STOP：禁止回填 |
| en2ru 无同目录 `en2ru-quality-loop.json` 或其中 `pass≠true` | 🔴 STOP：先跑质量环再交付 |
| `pass=false` 且仅 `empty>0`、无 dirty/placeholderFails | 🔴 CHECKPOINT：先 resume 空行，再验收 |
| 用户断言「解耦导致引用坏了」但日志已有 `活跃翻译模型 (N)` 且有成功批 | 🔴 STOP：按 Busy/ECONNRESET/条数门禁排障，不改 skill 路径乱猜 |

## GREEN · 路由

### 任务分类

- `zh2en_batch` / `en2ru_batch` / `pipeline_batch`
- `probe_models`：只测模型，不翻译
- `accept_anti_misalign`：译后防错位验收
- `full_en2ru_all_models`：全量多模型（须先试跑）

### 线性步骤（每步 I/O）

1. **模式判定**  
   - 入：用户自然语言 / CLI  
   - 出：`mode`、`modelPolicy`、`models`、`needConfirm`  
   - `[[intention-skills/分析-模式判定/SKILL.md]]`
2. **（可选）多模型并发调度** — 仅当需要多模型且名单未定  
   - 入：任务类型  
   - 出：确认后的模型列表 + lane 说明  
   - `[[../../多模型并发调度/SKILL.md]]`  
   - 说明：运行时 `translateCsv.js` **自读 `.env` 建 worker**，不 import 调度套件代码；解耦只影响编排文档，不影响 Key 注入
3. **编排**  
   - 入：上步产物 + 路径  
   - 出：`cliArgs`、`nextFeature`  
   - `[[intention-skills/编排-翻译工作流/SKILL.md]]`
4. **执行**  
   - 入：CLI  
   - 出：`*_RU机翻.*` / EN 列 + `_errors.log`  
   - `[[feature-skills/执行-中译英/SKILL.md]]` / `[[feature-skills/执行-英译俄/SKILL.md]]`
5. **校验写出**  
   - 入：输出路径  
   - 出：列/占位符抽检备注  
   - `[[feature-skills/校验-占位符与写出/SKILL.md]]`
6. **译后防错位验证 + en2ru 质量环（交付前必跑）**  
   - 入：输出 xlsx/csv + 可选 `baseline-bad.json`  
   - 出：`acceptanceReport`（`pass` / `cjkInRu` / `nlParityFails` / `recommendDeliver` …）  
   - hardFail 时：`node scripts/remediate-en2ru-until-clean.js --in <*_RU机翻.xlsx>`（DeepSeek-V4-Flash；写出同目录 `en2ru-quality-loop.json`）  
   - **en2ru 可回填条件**：`pass=true` 且 `empty=0` 且同目录 `en2ru-quality-loop.json` 的 `pass=true`（`recommendDeliver=true`）  
   - `[[feature-skills/验证-译后防错位/SKILL.md]]`

### 功能层速查

| 任务 | 路由 |
|------|------|
| zh2en_batch | 执行-中译英 → 校验 → 验证-译后防错位 |
| en2ru_batch | 执行-英译俄 → 校验 → 验证-译后防错位 |
| pipeline_batch | DAG → 校验 → 验证-译后防错位 |
| probe_models | 探测-模型可用性 / 或多模型并发调度 probe |
| accept_anti_misalign | `scripts/verify-post-translate.js` |

## 默认命令

工作目录一律：`agent-skills/translate`（下列相对路径均相对此目录）。

```bash
# zh2en 试跑
node translateCsv.js "template/few-shot-example/词条导出_20260714074812_top5.csv" "template/few-shot-example" --mode zh2en --limit 5

# en2ru 单模型试跑（省额度）
node translateCsv.js "template/few-shot-example/misalign-10-regression/input.xlsx" "template/few-shot-example/misalign-10-regression/run_out" --mode en2ru --limit 10

# en2ru 多模型分摊（failover；历史毒行回归用 --force）
node translateCsv.js "template/few-shot-example/misalign-10-regression/input.xlsx" "template/few-shot-example/misalign-10-regression/run_out" --mode en2ru --force --multi-model --models all

# pipeline（中→英→俄同进程 DAG）
node translateCsv.js "template/few-shot-example/pipeline_smoke_5.csv" "template/few-shot-example" --mode pipeline --limit 5

# 译后防错位验收（交付前门禁；exit 0 才可回填）
node scripts/verify-post-translate.js --out "template/few-shot-example/misalign-10-regression/run_out/input_RU机翻.xlsx" --baseline "template/few-shot-example/misalign-10-regression/baseline-bad.json"

# en2ru 质量环（CJK/换行对齐/回显/错位 → DeepSeek-V4-Flash 迭代至干净；需 DEEPSEEK_API_KEY）
node scripts/remediate-en2ru-until-clean.js --in "path/to/*_RU机翻.xlsx" --max-rounds 5 --batch-size 10

# 门禁与括注/残留英文单测（无需 API；exit 0）
node scripts/test-en2ru-residual.js
node evals/batch-wire-multiline.js
```

自然语言 → 策略：

- 「只用默认模型英译俄」→ `modelPolicy=single`
- 「全部模型一起跑 / 满速」→ 委托「多模型并发调度」提案 → 确认后再 CLI
- 「测一下模型」→ `probe_models`
- 「还会不会串行 / 敢不敢回填」→ `accept_anti_misalign`

## 实测验收（dim8 证据）

| 夹具 | 命令（cwd=`agent-skills/translate`） | 期望 |
|------|------|------|
| 批线协议 | `node evals/batch-wire-multiline.js` | exit 0 |
| 门禁单测 | `node scripts/test-en2ru-residual.js` | exit 0（含 CJK/换行对齐/白名单收紧） |
| 历史毒行 10 条 | 上节「en2ru 多模型分摊」整段 CLI，再跑上节「译后防错位验收」 | **`pass=true`**；`stillLooksMisaligned=[]`；`filled=10`。小夹具以 hardFail 门禁为准；**不要求** `recommendDeliver`（无大表质量环产物时可为 false） |
| zh2en 冒烟 | 上节「zh2en 试跑」 | 目标「英文翻译」非空；Busy 时改 `--multi-model` |
| pipeline 冒烟 | 上节「pipeline」 | 产出含俄文列的机翻文件 |
| **全量 3842（2026-07-15）** | 源表绝对路径 + `--mode en2ru --force --multi-model --models all`；约 9min | 日志终局成功≈3838；空行用 **无 force resume**；再 `verify-post-translate`；`placeholderFails=[]` `dirtyWrites=[]` |
| **en2ru 质量环（2026-07-15）** | 上节 `remediate-en2ru-until-clean.js --in <*_RU机翻.xlsx>` | 同目录 `en2ru-quality-loop.json` 的 `pass=true`；再跑 verify → `recommendDeliver=true`；`cjkInRu=[]`。证据：`[[feature-skills/验证-译后防错位/实跑报告-质量环-2026-07-15.md]]` + 样例产物 `[[feature-skills/验证-译后防错位/en2ru-quality-loop.example.json]]` |

全量排障口诀：

1. 看启动行 `活跃翻译模型 (N)` — N≥1 且供应商已启用 → **不是** skill 解耦引用失败。  
2. 刷屏 ❌ 时数 `en2ru 批量翻译成功` — 有增长则任务在推进。  
3. `期望 40, 实际 0` = 解析门禁拒收畸形批，会 failover，属预期。  
4. 结束后先补空（resume），再验收；勿见 `pass=false` 就 force 全表。

夹具目录：`template/few-shot-example/misalign-10-regression/`。  
批线细则：`[[references/batch-wire-protocol.md]]`。

## 反例黑名单

- en2ru 不要加载中文术语库
- 不要默认 `--force` 覆盖已有合格俄文（空行用 resume）
- 不要多进程抢同一 API 额度
- 不要把真实 Key 写进 skill / git
- OCR/视觉模型不要默认进翻译分摊
- 不要在 `pass=false` 时宣称可回填
- 不要把「备注1 有验证失败但俄文已填」当成可交付（拒写门禁应已拦截）
- 不要因「首选 ❌ / ServiceIsBusy」断言「两个 skill 解耦把引用弄坏了」
- 不要把「数量不匹配」拒收看成应改回补空落盘（那会回来串行）
- 不要在 en2ru 无质量环产物时宣称 `recommendDeliver`
- 不要用免费 chat/MT 冒充 DeepSeek-V4-Flash 语义验收

## 资源索引

- 脚本：`translateCsv.js`、`scripts/verify-post-translate.js`、`scripts/remediate-en2ru-until-clean.js`、`scripts/remediate-ru-mixed-en.js`、`scripts/test-en2ru-residual.js`、`evals/batch-wire-multiline.js`
- 模型配置：`[[../../多模型并发调度/lib/models.config.json]]`（验收固定 `deepseek:deepseek-v4-flash`）
- 细则：`references/modes-en2ru.md`、`references/batch-wire-protocol.md`、`references/providers-siliconflow.md`
- 防错位 / 质量环：`feature-skills/验证-译后防错位/`（含 `实跑报告-质量环-2026-07-15.md`）、`template/few-shot-example/misalign-10-regression/`
- 并发调度：`[[../../多模型并发调度/SKILL.md]]`
- `.env.example`（仓库根目录；`DEEPSEEK_API_KEY` 供质量环）
