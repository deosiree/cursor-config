---
name: translate
description: CSV词条批量翻译工具，集成术语库、中文规范性检查、翻译验证等功能
version: 1.0.0
author: Cursor Skills
---

# CSV词条批量翻译插件

这是一个批量翻译CSV文件中词条的工具，使用AI大模型进行翻译，集成术语库、中文规范性检查、翻译验证等功能。

## 功能特性

### 1. 批量翻译处理
- 从Excel术语库提取翻译规则
- 批量处理CSV文件中的所有词条
- AI翻译（需要集成AI API）

### 2. 质量保证
- 中文规范性检查
- 翻译结果验证
- 占位符保护

### 3. 错误处理
- 错误日志记录
- 翻译失败处理
- 质量检查报告

## 触发方式

### 推荐用法
```
@trans-skill1-loader [输入csv文件的相对路径] [输出csv目录的相对路径] [excel术语库的相对路径]
```

### 示例
```
@trans-skill1-loader f:\DownLoads\词条导出_20260128111948.csv .cursor/skills/translate/output .cursor/skills/translate/glossary/常用注意要点清单.xlsx
```

## 文件结构

```
plugins/translate/
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

## 使用场景

### 场景1：国际化翻译
- 批量翻译CSV词条文件
- 保持术语一致性
- 确保翻译质量

### 场景2：术语管理
- 从Excel术语库提取翻译规则
- 管理专业术语翻译
- 建立术语一致性

### 场景3：质量检查
- 中文规范性检查
- 翻译结果验证
- 错误日志记录

## 技术特性

- ✅ 从Excel术语库提取翻译规则
- ✅ 批量处理CSV文件中的所有词条
- ✅ AI翻译（需要集成AI API）
- ✅ 中文规范性检查
- ✅ 翻译结果验证
- ✅ 占位符保护
- ✅ 错误日志记录

## 技能文件

- `trans-skill1-loader.md` - 集成Skill文档
- `translateCsv.js` - CSV处理脚本（主脚本）
- `extractGlossary.js` - 术语库提取脚本
- `README.md` - 详细使用说明