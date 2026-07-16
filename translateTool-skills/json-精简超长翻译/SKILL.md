---
name: json-精简超长翻译
description: 当需要把翻译文件中超长词条自动检测并缩短到合规长度时使用。支持元数据(v1 标准 JSON)和对象数据(v2 Report 文件)两种模式。
version: 2.1.0
tags: [translation, russian, json, utf8, byte-limit, trim, shortening, report, v2]
metadata:
  darwin:
    last_eval: 2026-07-16
    baseline_score: 81.3
    final_score: 88.5
    rounds: 1
    hl4_reached: false
    note: v2.1 性能实跑优化（db 17条 7min→规则层+并行LLM）
---

# 目标

把"检测翻译词条超长 → 计算约束预算 → LLM 缩短 → 回验输出"这一流程标准化。支持两种数据模式：

- **元数据(v1)**：输入 `.dic` 标准 JSON，固定 63 字符限制
- **对象数据(v2)**：输入 `.report` 文件（服务器检测报告），限制来自 `interpretation` 字段

## 何时使用

- 元数据：需要批量检查 `.dic` 文件中某语种字段是否超长并缩短（默认 63 字符）。
- 对象数据：服务器检测脚本已跑出 `.report` 文件，需要解析并自动缩短超长词条。

## 何时不要使用

- 输入不是 JSON 格式（v1）或 Report 格式（v2）。
- 需要新增翻译词条而不是缩短已有词条。
- 明确用户说了"元数据"但目录中没有 `.dic` 文件（或反说）。
- 输入是 Excel「俄文翻译」列超长压缩 → 用 `excel-精简超长翻译`（非 `.dic`/`.report`）。

## 输入契约

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `dataType` | `meta`(元数据) / `object`(对象数据) | 必填 |
| `inputPath` | 目录路径（递归扫描） | 必填 |
| `fieldPath` | JSON 目标字段（v1 可省） | `translation.*`（v2 自动检测） |
| `byteLimit` | UTF-8 字节上限（v1 可省） | `63`（v1）/ 来自 interpretaion（v2） |
| `outputSuffix` | 输出目录后缀 | `_new` |

以下关键事实缺失时，先停下来确认：

- 缺 `dataType` → 无法知道走元数据还是对象数据流程
- 缺 `inputPath` → 无法知道要处理什么
- v2 中 interpretation 解析不到 `限制:N` 格式 → 要求用户确认

## RED · 失败基线

1. **LLM 自行估算不准**：LLM 用"大概多少个字符"来估算，但俄语每个字母 2 字节，实际可用字符数比猜的少很多。
2. **interpretation 开区间陷阱**：`限制:32` 实际最大 31 字符，LLM 常多算 1。
3. **每次重复检测**：每次都要手动打开 JSON 看长度，没有可复用的检测手段。
4. **缩短后不回验**：LLM 缩完了以为合规，实际还超 1-2 字节。
5. **产物结构不稳定**：输出覆盖到源目录容易误改。
6. **大批量直调 LLM 极慢**：17 条 unique 词条若每批 5 条串行 + 3 轮全量重跑，实测 **~7 分钟**；讯飞单批 ≥15 条常 **180s 超时**。

### 🛟 失败模式与 fallback 树

| 触发条件 | 一线修复 | 仍失败兜底 |
|---------|---------|-----------|
| `inputPath` 不存在 | 要求用户提供正确路径 | 提示用户使用绝对路径 |
| `dataType` 未提供 | 询问是元数据还是对象数据 | 自动检测目录中文件类型 |
| interpretation 格式异常 | 手动解析或跳过该条目 | 输出异常条目列表，人工审核 |
| 缩短后回验失败 | 重新路由到缩短步骤 | 迭代上限 **2** 次后规则截断兜底 |
| Darwin 评估不可用 | 跳过 Darwin 阶段 | 仅保留内部简化闭环 |
| 讯飞 batch ≥15 超时 | 改 `--batch-size 3` 或换 DeepSeek | `--rules-only` 先验规则层是否已够 |
| LLM 轮次过多仍超长 | 先跑 `lib/ruleShorten.js` 规则层 | 仅仍超长条目进 LLM；最后 `truncateUtf8Boundary` |

## 人工门禁

| 条件 | 动作 |
|------|------|
| `inputPath` 不存在或不可读 | 要求用户提供正确路径 |
| `dataType` 未提供且无法推断 | 要求用户明确元数据/对象数据 |
| v2 中 interpretation 解析异常 | 要求用户确认 report 格式 |
| 检测报告全部合规 | 提示用户无需缩短，直接复制即可 |

### 🔴 CHECKPOINT · 关键决策点

| 节点 | 检查点动作 | 视觉标记 |
|------|-----------|---------|
| `分析-识别数据类型` 无法判断 | 需要用户确认 dataType | 🔴 STOP |
| v2 interpretation 解析 0 合规 | 全部已合规，跳过缩短 | 🔴 CHECKPOINT |
| 回验输出 `passed = false` | 有超标条目未被修复 | 🔴 STOP |
| 缩短迭代 ≥ 2 次仍有残余超标 | 规则截断后仍 fail → 人工介入 | 🔴 STOP |
| unique 超标 < 20 且未跑规则层 | 禁止直接大批量 LLM | 🔴 CHECKPOINT |
| v2 interpretation 解析异常 | interpretation 格式不匹配或 actualMax ≤ 0 | 🔴 CHECKPOINT |

## GREEN · 执行

### 任务分类

- `meta_shorten`：元数据 → 读 `.dic`，63 字符限制
- `object_shorten`：对象数据 → 读 `.report`，interpretation 提供限制

### 意图层路由

| 任务类型 | 入口 → 路由 |
|---------|------------|
| meta_shorten | `[[intention-skills/分析-识别数据类型/SKILL.md]]` → `[[intention-skills/分析-输入确认/SKILL.md]]` → `[[intention-skills/编排-精简工作流/SKILL.md]]` |
| object_shorten | `[[intention-skills/分析-识别数据类型/SKILL.md]]` → `[[feature-skills/解析-Report文件/SKILL.md]]` |

### 功能层路由

| 能力 | 功能节点 |
|------|---------|
| 扫描元数据 `.dic` 文件 | `[[feature-skills/扫描-JSON词条检测/SKILL.md]]` |
| 解析对象数据 `.report` 文件 | `[[feature-skills/解析-Report文件/SKILL.md]]` |
| 规则层机械缩短（零 API） | `[[lib/ruleShorten.js]]` |
| LLM 缩短俄语翻译 | `[[feature-skills/执行-俄语LLM缩短/SKILL.md]]` |
| v2 一键 CLI（推荐） | `[[scripts/shorten-from-report-dir.js]]` |
| 回验并输出到 `_new` 目录 | `[[feature-skills/执行-回验输出/SKILL.md]]` |

### 元数据(v1) 标准执行步骤

1. `分析-识别数据类型` → 输出 `{ dataType: "meta", defaultMaxLen: 63 }`
2. `分析-输入确认` → 校验参数，输出 `confirmedMeta`
3. `扫描-JSON词条检测` → 运行 `check-russian.js --mode detect`
4. `编排-精简工作流` → 判断有无超标词条
   - 无超标 → 直接复制到 `_new`
   - 有超标 → 🔴 CHECKPOINT
5. `执行-俄语LLM缩短` → LLM 按预算缩短
6. `执行-回验输出` → 运行 `check-russian.js --mode verify`

### 对象数据(v2) 标准执行步骤

**推荐：一条命令跑完全流程**

```bash
cd translateTool-skills/json-精简超长翻译
node scripts/shorten-from-report-dir.js <dbDir>
# 默认：DeepSeek、batch≤12、parallel=3、max-rounds=2
# 仅规则层试跑：--rules-only
# 讯飞：--models xfyun:xophunyuan7bmt --batch-size 3
```

**三阶段流水线（T0→T1→T2，禁止跳层）**

| 阶段 | 动作 | 耗时 | 何时跳过 |
|------|------|------|---------|
| **T0 规则层** | `ruleShortenToLimit()` 机械缩写 | 毫秒级 | 永不跳过 |
| **T1 LLM** | 仅仍超长 unique 词条，小批并行 | 秒~分钟 | `--rules-only` 或 T0 全绿 |
| **T2 截断** | `truncateUtf8Boundary` | 瞬时 | T1 后仍超长 |

1. `分析-识别数据类型` → 输出 `{ dataType: "object" }`
2. `解析-Report文件` → `parseReport` + `dedupeBySourceTag`（写盘前必须去重）
   - `限制:N` → `actualMax = N - 1`（开区间）
3. **T0** `lib/ruleShorten.js` → 命中则直接写入 `shortenMap`，打印 `RULE`
4. **T1** `执行-俄语LLM缩短` → 仅 `pending` 条目；DeepSeek 默认 `batch≤12`、`parallel=3`；讯飞 **batch≤3**
5. `执行-回验输出` → `verifyDicAgainstReport`；输出 `<dbDir>_new/*.dic` + `shorten-summary.json`
   - passed → 结束
   - 失败且 LLM 轮次 < 2 → 仅重试仍超长项（禁止全量重跑）
   - 失败且轮次 ≥ 2 → T2 截断后再验；仍 fail → 🔴 STOP

### 性能基线（实跑沉淀，2026-07-16 db 目录）

| 场景 | 旧做法 | 耗时 | 新做法 | 目标耗时 |
|------|--------|------|--------|---------|
| 17 unique 超标 | batch=5 串行 × 3 轮全量 LLM | **~423s** | T0 规则 + 单批 LLM + parallel | **<90s** |
| 15 条一次送讯飞 | batch=15 | **180s 超时失败** | batch≤3 或换 DeepSeek | 稳定完成 |
| 380 条机械缩短 | 纯 subs 无 LLM | ~2s | 保持 T0 规则层 | 不变 |

**Agent 执行纪律**：unique 超标 < 30 时，必须先 `--rules-only` 看 T0 覆盖率；T0 已全绿则禁止调 LLM。

## REFACTOR · 可改进方向

- 支持更多语种的字符预算算法
- 将脚本检测能力封装成 MCP server
- 接入 Darwin 评估闭环

### 🚫 反模式

| 反模式 | 为什么错 | 正确做法 |
|--------|---------|---------|
| LLM 凭感觉估字节 | 俄语 2 字节/字母，误差常达 30-50% | 先用脚本/interpretation 精确计算 |
| 把 interpretation 的限制当闭区间 | 限制:32 实际是 31，多算 1 字符必超标 | 开区间处理：max - 1 |
| 直接在源目录修改 | 覆盖后无备份 | 输出到 `_new` 隔离目录 |
| 缩短后不跑回验 | LLM 缩短后还超 1-2 字节 | 每次缩短后必须 verify |
| 把 interpretation 当闭区间 | 限制:32 算成 32，实际是 31 | 开区间：actualMax = maxLen - 1 |
| 用 interpretation 的 currentLen 计算超标 | 服务器 currentLen 可能不准 | 只取限制:N，不依赖 currentLen |
| report 1:1 写 dic | report 是命中列表，同一 source\|tag 可重复数十次 | 写盘前按 source\|tag 去重（`dedupeBySourceTag`） |
| 跳过规则层直调 LLM | 17 条可规则命中 10+ 条，白白多 4~6 次 API | 先 T0，仅 pending 进 T1 |
| 讯飞 batch ≥10 | 180s 超时，整批失败 | `--batch-size 3` 或默认 DeepSeek |
| 每轮重跑全部 pending | 已 OK 条目重复计费 | 只重试 `still` 列表 |
| 第 3 轮盲目 slice 截断 | 俄文断词、语义破碎 | T2 仅最后兜底；优先规则+LLM |

## 使用示例

### 元数据(v1) 示例

```text
使用 $json-精简超长翻译
  dataType=meta
  inputPath=F:\path\to\db
```

### 对象数据(v2) 示例

```text
使用 $json-精简超长翻译
  dataType=object
  inputPath=F:\path\to\reports
```

## 参考

- `[[scripts/check-russian.js]]`
- `[[scripts/parse-report.js]]`
- `[[scripts/shorten-from-report-dir.js]]` — v2 推荐入口
- `[[lib/ruleShorten.js]]` — T0 规则层
- `[[references/编码约束说明.md]]`
- `[[assets/few-shot-example/8条真实案例对照表.md]]` — 缩写模式来源
- `[[darwin-output-db-shorten.md]]` — 2026-07-16 性能实跑报告
- `[[template/after/完整使用示例.md]]`
- `[[assets/test-data/sample.report]]`
