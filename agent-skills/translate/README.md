# CSV词条批量翻译工具

## 概述

这是一个批量翻译CSV文件中词条的工具，使用AI大模型进行翻译，集成术语库、中文规范性检查、翻译验证等功能。

## 功能特性

- ✅ 从Excel术语库提取翻译规则
- ✅ 批量处理CSV文件中的所有词条
- ✅ AI翻译（需要集成AI API）
- ✅ 中文规范性检查
- ✅ 翻译结果验证
- ✅ 占位符保护
- ✅ 错误日志记录

## 文件结构

```
.cursor/skills/translate/
├── glossary/
│   ├── 常用注意要点清单.xlsx          # Excel术语库
│   └── translation-rules.md            # 翻译规则文档（自动生成）
├── extractGlossary.js                 # 术语库提取脚本
├── trans-skill1-loader.md             # 集成Skill文档
├── translateCsv.js                    # CSV处理脚本（主脚本）
├── README.md                          # 使用说明
├── input/                              # 输入目录（可选）
└── output/                             # 输出目录
    ├── [文件名].csv                    # 翻译后的CSV文件
    └── [文件名]_errors.log             # 错误日志
```

## 安装依赖

项目已包含 `xlsx` 依赖，无需额外安装。

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
