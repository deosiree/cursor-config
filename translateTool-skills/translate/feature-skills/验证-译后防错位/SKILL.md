---
name: 验证-译后防错位
description: 当 en2ru/zh2en/pipeline 批次完成后，需要验证无行错位、占位符齐套、换行哨兵已还原、脏译文未落盘、无中文夹杂与换行不对齐时使用。触发词：译后验证、防错位、串行检查、misalign check、acceptance。
---

# 核心任务

在写出交付物之后做**硬门禁验收**；en2ru 须再经 **DeepSeek-V4-Flash「修改↔验证」迭代** 直至 hardFail=0，才可 `recommendDeliver`。

## 何时触发

- `执行-英译俄` / `执行-中译英` / `pipeline` 写完 CSV/XLSX 之后
- 回归夹具 `misalign-10-regression` / `multiline-wire-guard` 实跑之后
- 用户问「还会不会串行」「敢不敢回填」
- 质量环脚本 `scripts/remediate-en2ru-until-clean.js` 每轮结束

## 何时不要用

- 尚未执行翻译（先走执行子 skill）
- 只想润色某一条文案（非批量验收）

## 输入

| 字段 | 说明 |
|------|------|
| `outputPath` | `*_RU机翻.csv` / `.xlsx` 或 zh2en 输出 |
| `sourcePath` | 可选；用于对照 id 集合 |
| `baselineBadPath` | 可选；历史错位 manifest（如 `baseline-bad.json`） |
| `mode` | `en2ru` / `zh2en` / `pipeline` |

## GREEN · 检查清单（必须全部通过）

1. **条数**：输出行数 = 输入行数（按 id）
2. **占位符齐套**：对每条非空目标列，`%N` / `{}` 与源一致（调用与 `validateTranslation` 同口径）
3. **无脏写**：`备注1` 含「翻译验证失败」的行，目标列必须为空（拒写生效）
4. **换行还原**：源含换行的 id，译文若非空则不得残留 `⟦__NL__⟧` / `__NL__`；应含真实 `\n`
5. **换行对齐（en2ru）**：`count(\\n)` 源 === 译（`nlParityFails` 必须为空）。**对齐英源的换行不算缺陷**
6. **错位否证**（相对历史毒行）：若提供 `baseline-bad.json`，新译文不得等于（或高度同构）当时那条「张冠李戴」的 `badRu`
7. **无英文回显（en2ru）**：非白名单行不得 `俄文===英文`，且有拉丁源文时译文须含西里尔（`enEchoFails` 必须为空）。白名单不含 Caps Lock / Val / Envelope* / Didot / MenuRole / Qt 产品全名
8. **无括号英注（en2ru）**：不得残留 `Тип (Type)` 类括注（`englishGlossParens` 必须为空；文件后缀 `(*.scd)` 除外）
9. **无中文夹杂（en2ru）**：俄文列不得含汉字（`cjkInRu` 必须为空）
10. **错位启发（en2ru）**：短英文源配长俄文或凭空 `%N` → `suspectMisalign` 必须为空
11. **残留英文**：协议/品牌等经 **DeepSeek-V4-Flash** 判定 KEEP 的拉丁词可保留；可译 UI 词须 REPLACE
12. **语义验收闭环（en2ru 交付）**：须存在同目录 `en2ru-quality-loop.json` 且 `pass=true`（由 `remediate-en2ru-until-clean.js` 写出）。**禁止用免费 chat/MT 冒充语义验收**
13. **errors.log**：允许有「整批数量不匹配已重试」日志；终局验证失败条数应为 0，或失败行目标列为空

## 修改↔验证迭代（en2ru）

1. 跑 `node scripts/verify-post-translate.js --out <RU>`
2. 若 hardFail：对失败 id 清空俄文 → 用 **`deepseek:deepseek-v4-flash`** 整句重译 → 再硬门禁 + 可选批级语义验
3. 重复直至 `pass=true`，并由质量环写出 `en2ru-quality-loop.json`
4. 一键脚本：`node scripts/remediate-en2ru-until-clean.js --in <RU机翻.xlsx>`

验证/修补模型固定：`resolveVerifyWorker()` → DeepSeek-V4-Flash（需 `DEEPSEEK_API_KEY`）。

## 脚本

```bash
node scripts/verify-post-translate.js \
  --out "template/few-shot-example/misalign-10-regression/run_out/*_RU机翻.xlsx" \
  --baseline "template/few-shot-example/misalign-10-regression/baseline-bad.json"

node scripts/remediate-en2ru-until-clean.js \
  --in "path/to/*_RU机翻.xlsx"
```

退出码：`0` = pass；非 0 = fail（打印失败 id）。

## 输出契约

```text
acceptanceReport:
  pass: boolean
  filled: number
  empty: number
  placeholderFails: string[]
  dirtyWrites: string[]
  residualNlTokens: string[]
  stillLooksMisaligned: string[]
  enEchoFails: string[]
  englishGlossParens: string[]
  cjkInRu: string[]
  nlParityFails: string[]
  suspectMisalign: string[]
  recommendDeliver: boolean  # pass 且 filled==N 且质量环完成
```

## 失败模式

| 触发 | 一线 | 仍失败 |
|------|------|--------|
| placeholderFails / nlParityFails | 质量环重译失败 id | 人工译 |
| cjkInRu / englishGlossParens / enEchoFails | 清空后 DeepSeek-V4-Flash 重译 | 人工译 |
| dirtyWrites 非空 | 视为引擎退步；查 `allowWrite` 门禁 | 回滚代码 |
| stillLooksMisaligned / suspectMisalign | 查 `parseBatch` / 换行哨兵 / 条数门禁 | 缩小 batch=1 复现 |
| residualNlTokens | restore 未跑到该行 | 修 restore 调用路径 |

## 人工门禁

| 条件 | 动作 |
|------|------|
| `pass=false` | 🔴 STOP：禁止回填业务库 |
| `pass=true` 但无 `en2ru-quality-loop.json` | 🔴 CHECKPOINT：先跑质量环再交付 |
| `pass=false` 且仅 `empty>0` | 🔴 CHECKPOINT：先无 `--force` resume 空行，再跑本脚本 |
| `stillLooksMisaligned` 非空但占位符齐套 | 🔴 CHECKPOINT：人审该 id |
| 相对 baseline 首次回归 | 展示前后对照表后再宣称「已修好」 |

## 边界

- 不替代人工语义审校；硬门禁挡错位/缺占位符/脏写/中文夹杂/换行不对齐。
- 批级语义验收由 DeepSeek-V4-Flash 承担；免费 MT 仅作首翻。

## 反例（不要做）

- 不要把「备注1 有失败但俄文已填」当成可交付
- 不要用免费 chat 模型做终局语义验收
- 不要在验证失败时自动 `--force` 全量重写
- 不要把「与英源换行数一致」的多行 Qt 串误判为缺陷

## 与既有 skill 关系

- 交付列/路径验收仍可走 `[[../校验-占位符与写出/SKILL.md]]`
- 本 skill 专攻 **防错位 + 拒写门禁 + 质量硬门禁 + 历史毒行否证**，应在写出后立刻调度
