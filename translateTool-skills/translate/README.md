# CSV/XLSX 词条批量翻译工具

## 概述

批量翻译词条 CSV/XLSX，支持 `zh2en` / `en2ru` / `pipeline`，以及单模型或多模型分摊并发。集成术语库（仅 zh2en）、占位符保护、翻译验证与错误日志。

## 模式对照

| 项目 | zh2en（默认） | en2ru | pipeline |
|------|---------------|-------|----------|
| 源列 | 词条 | 英文翻译（空则词条） | 词条 → 英 → 俄 |
| 目标列 | 英文翻译 | 俄文翻译 | 英+俄 |
| 术语库 | 使用 | 跳过 | 使用（zh2en 段） |
| 输出 | CSV + xlsx | `*_RU机翻.*` | `*_RU机翻.*` |
| 详情 | 见下文 | [modes-en2ru](references/modes-en2ru.md) | [concurrency-dag](references/concurrency-dag.md) · [batch-wire-protocol](references/batch-wire-protocol.md) |

```bash
# 英 → 俄（试跑）
node translateCsv.js "f:\DownLoads\qt通用语言.xlsx" "f:\DownLoads" --mode en2ru --limit 20 --debugPrompt

# 英 → 俄（全量；确认试跑后再跑）
node translateCsv.js "f:\DownLoads\qt通用语言.xlsx" "f:\DownLoads" --mode en2ru
```

## 功能特性

- ✅ 从Excel术语库提取翻译规则（zh2en）
- ✅ 批量处理 CSV / XLSX
- ✅ 占位符保护（`{}` / 换行哨兵 `⟦__NL__⟧` 批线协议，见 [batch-wire-protocol](references/batch-wire-protocol.md)）
- ✅ AI 翻译（zh2en / en2ru）
- ✅ 中文规范性检查（zh2en）
- ✅ 翻译结果验证与占位符保护
- ✅ 错误日志记录
- ✅ en2ru：xlsx_only 回填「俄文翻译」

## 文件结构

```
translateTool-skills/translate/
├── SKILL.md                          # 主 agent 路由
├── intention-skills/
│   ├── 分析-模式判定/                 # mode + modelPolicy
│   └── 编排-翻译工作流/
├── feature-skills/
│   ├── 执行-中译英/
│   ├── 执行-英译俄/
│   ├── 校验-占位符与写出/
│   └── 探测-模型可用性/
├── lib/modelCatalog.js               # 硅基模型目录
├── translateCsv.js                   # --mode / --multi-model / --models
├── scripts/probe-models.js
├── prompts/
├── references/                       # modes-en2ru / concurrency-dag / providers-siliconflow
├── evals/last-probe-models.md        # 探测报告（生成）
└── package.json
```

## 安装依赖

在本 skill 目录执行：

```bash
cd translateTool-skills/translate
npm install
```

依赖见本地 `package.json`（`xlsx`、`axios`、`iconv-lite`）。

## API Key 配置（必读）

密钥放在仓库根目录 `.env`（已 gitignore），**不要**写进 `translateCsv.js`。模板见仓库根 `.env.example`。

| 变量 | 说明 |
|------|------|
| `XFYUN_API_KEY` | 讯飞星辰 |
| `SILICONFLOW_API_KEY` | 硅基流动 |
| `ZHIPU_API_KEY` | 智谱（免费模型） |
| `DEEPSEEK_API_KEY` | DeepSeek（主力模型，翻译不走此池） |

> 模型选定、路数、批大小均在 `[[../../多模型并发调度/lib/models.config.json]]` 声明式配置。`.env` 只存 Key。

1. 编辑 `.env`，填写所需 Key
2. 探测全部模型：

```bash
cd agent-skills/多模型并发调度
node scripts/probe-models.js
# 报告: evals/last-probe-models.md
```

轻量探测（旧）：`node scripts/probe-apis.js`

硅基模型目录：[references/providers-siliconflow.md](references/providers-siliconflow.md)

## 多模型：路权并发（v3.0）

默认 **只跑优先级最高的一个文本模型**（节省限免额度）。多模型时采用 **路权车道限流调度**——每个模型有独立的 concurrent lane 上限，调度器优先填满高 priority 模型的 lane。

| 策略 | 自然语言话术 | CLI | 并发模型 |
|------|--------------|-----|----------|
| 单模型 `single` | 「默认」「省额度」「只用最高优先」 | （不加 `--multi-model`） | priority 最高 1 个 |
| 全模型路权并发 | 「全模型分路」「满速」「所有免费模型一起跑」 | `--multi-model --models all` | 讯飞 20 路 + 硅基 6 模型各 1 路 + 智谱 1 路 = **27 路** |
| 指定并发 | 「用讯飞和智谱并发」 | `--multi-model --models xfyun:xophunyuan7bmt,zhipu:glm-4-flash` | 指定模型的 lanes 之和 |

**路权模型**：每个模型的 `lanes` 和 `batchSize` 定义在 `[[../../多模型并发调度/lib/models.config.json]]`，调度器 `LanePoolDispatcher` 自动按路权分配批次。详见 `[[../../多模型并发调度/references/lane-model.md]]`。

> **人类确认门禁**：未指定模型时，agent 会生成「模型提案表」（列出所有供应商、模型、路数、计费、URL）→ 🔴 CHECKPOINT 等人确认后再执行，防止误消费限免额度。

**优先级**（`single`）：讯飞 MT → 硅基 `tencent/Hunyuan-MT-7B` → 其余硅基 chat → 智谱。

**免费池（free tier）全部模型**：

| # | 模型 | 供应商 | lanes | batchSize |
|---|------|--------|-------|-----------|
| 1 | Hy-MT2-7B | 讯飞星辰 | 20 | 100 |
| 2 | Hunyuan-MT-7B | 硅基流动 | 1 | 40 |
| 3 | DeepSeek-R1-0528-Qwen3-8B | 硅基流动 | 1 | 40 |
| 4 | Qwen3-8B | 硅基流动 | 1 | 40 |
| 5 | GLM-Z1-9B-0414 | 硅基流动 | 1 | 40 |
| 6 | GLM-4-9B-0414 | 硅基流动 | 1 | 40 |
| 7 | Qwen2.5-7B-Instruct | 硅基流动 | 1 | 40 |
| 8 | glm-4-flash | 智谱AI | 1 | 40 |
| | **合计 27 路** | | | |

提示：主力付费模型（DeepSeek v4-pro/v4-flash）在 `models.config.json` 的 `primary` tier，翻译任务默认不走该池。

示例：

```bash
# 1) 单模型（默认）
node translateCsv.js "input.csv" "out" --mode en2ru --limit 20

# 2) 全模型路权并发（27 路免费池：讯飞 20 + 硅基 6 + 智谱 1）
node translateCsv.js "input.csv" "out" --mode en2ru --multi-model --models all

# 3) 指定模型并发
node translateCsv.js "input.csv" "out" --mode en2ru --multi-model \
  --models xfyun:xophunyuan7bmt,zhipu:glm-4-flash
```

Agent 路由：翻译模式判定 → 多模型并发委托 `[[../../多模型并发调度/]]`（任务分类 + 模型提案 + 路权判定）→ 编排 CLI → 执行。

## 使用方式

### 方式1: 通过Cursor Chat触发

```
@trans-skill1-loader [输入csv文件的相对路径] [输出csv目录的相对路径] [excel术语库的相对路径]
```

**示例**：
```
@trans-skill1-loader f:\DownLoads\词条导出_20260128111948.csv .cursor/skills/translate/output .cursor/skills/translate/glossary/常用注意要点清单.xlsx
```

### 方式2: 直接运行脚本

```bash
node .cursor/skills/translate/translateCsv.js \
  "f:\DownLoads\词条导出_20260128111948.csv" \
  ".cursor/skills/translate/output" \
  ".cursor/skills/translate/glossary/常用注意要点清单.xlsx"
```

### 方式3: 仅提取术语库

```bash
node .cursor/skills/translate/extractGlossary.js \
  ".cursor/skills/translate/glossary/常用注意要点清单.xlsx" \
  ".cursor/skills/translate/glossary/translation-rules.md"
```

## 集成AI翻译API

当前脚本中的 `translateEntry` 函数需要集成实际的AI API。以下是集成示例：

### 使用OpenAI API

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function translateEntry(entryText, abbreviationMap, fullTranslationMap) {
  const prompt = buildTranslationPrompt(entryText, abbreviationMap, fullTranslationMap);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "你是一个专业的翻译助手。请根据翻译规则将中文词条翻译成英文。" },
      { role: "user", content: prompt }
    ],
    temperature: 0.3
  });
  
  return response.choices[0].message.content.trim();
}
```

### 使用其他AI API

可以类似地集成其他AI服务，如：
- Anthropic Claude API
- Google Gemini API
- 本地部署的大模型API

## 输入CSV格式

CSV文件应包含以下列：

```
id,词条,英文翻译,comment,俄文翻译,备注,翻译最大长度
```

- `id`: 词条ID
- `词条`: 需要翻译的中文词条（必填）
- `英文翻译`: 翻译后的英文（将被更新）
- `comment`: 注释（可选）
- `俄文翻译`: 俄文翻译（可选）
- `备注`: 备注（可选）
- `翻译最大长度`: 翻译最大长度（可选）

## 输出CSV格式

输出CSV文件包含原有列，并新增 `备注1` 列：

```
id,词条,英文翻译,comment,俄文翻译,备注,翻译最大长度,备注1
```

- `备注1`: 记录中文不规范现象或翻译错误（如有）

## 中文规范性检查

工具会自动检查以下不规范现象：

- 混用中英文标点
- 词条前后多余空格
- 词条中间多余空格（连续空格）
- 占位符格式错误
- 标点符号格式不一致

如果发现不规范，会在 `备注1` 列记录。

## 翻译验证

工具会验证：

- 占位符是否被保护
- 翻译结果是否为空
- 术语库使用情况

如果验证失败，会在 `备注1` 列记录错误。

## 错误日志

如果翻译过程中出现错误，会生成错误日志文件：

- 文件名：`[输入文件名]_errors.log`
- 包含：翻译失败、中文不规范、验证失败的详细信息
- 统计信息：总数、成功数、失败数

## 注意事项

1. **AI翻译API**: 需要集成实际的AI API才能使用翻译功能
2. **只修改英文翻译列**: 中文词条列保持不变
3. **中文不规范处理**: 在"备注1"列记录，不修改中文本身
4. **占位符保护**: 保持占位符不变（`{}`, `{:.3f}`, `%1`, `%2`等）
5. **术语库优先级**: 优先使用术语库中的缩写
6. **批量处理**: 支持一次性处理整个CSV文件
7. **错误处理**: 所有错误都记录到日志文件，不影响主流程

## 开发说明

### 扩展中文规范性检查

在 `validateChinese` 函数中添加新的检查规则。

### 扩展翻译验证

在 `validateTranslation` 函数中添加新的验证规则。

### 自定义翻译规则

修改 `translation-rules.md` 文件或更新Excel术语库后重新运行提取脚本。

## 故障排除

### 问题1: 找不到Excel文件

**解决方案**: 检查文件路径是否正确，或使用绝对路径。

### 问题2: CSV文件格式错误

**解决方案**: 确保CSV文件使用UTF-8编码，列名正确。

### 问题3: AI翻译失败

**解决方案**: 
1. 检查AI API配置是否正确
2. 检查网络连接
3. 查看错误日志文件了解详细错误信息

### 问题4: 翻译结果不准确

**解决方案**:
1. 更新术语库Excel文件
2. 重新生成翻译规则文档
3. 调整AI翻译prompt

## 更新日志

- **2024-01-28**: 初始版本
  - 实现术语库提取
  - 实现CSV批量翻译
  - 实现中文规范性检查
  - 实现翻译验证
  - 实现错误日志记录
