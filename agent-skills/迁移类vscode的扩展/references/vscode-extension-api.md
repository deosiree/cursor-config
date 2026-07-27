# VSCode 扩展 API 参考

## 扩展结构

### package.json（核心元数据）
每个 VSCode 扩展都包含一个 `package.json` 文件，定义扩展的核心信息：

```json
{
  "name": "extension-name",
  "displayName": "Extension Display Name",
  "publisher": "publisher-id",
  "version": "1.0.0",
  "description": "Extension description",
  "engines": {
    "vscode": "^1.85.0"
  },
  "categories": [
    "Programming Languages",
    "Themes",
    "Formatters"
  ],
  "keywords": ["keyword1", "keyword2"],
  "repository": {
    "type": "git",
    "url": "https://github.com/publisher/repo"
  },
  "dependencies": {},
  "extensionDependencies": []
}
```

### 关键字段说明

| 字段 | 说明 | 用途 |
|-----|------|------|
| `name` | 扩展标识符（小写） | 与 publisher 组成唯一 ID |
| `displayName` | 显示名称 | 扩展市场和视图中显示 |
| `publisher` | 发布者 ID | 扩展来源标识 |
| `version` | 版本号（语义化） | 兼容性检查 |
| `engines.vscode` | 最低编辑器版本 | 兼容性检查关键字段 |
| `categories` | 分类 | 用于筛选和识别冗余 |
| `keywords` | 关键词 | 搜索和功能匹配 |
| `extensionDependencies` | 依赖的其他扩展 | 安装顺序和完整性检查 |

## 扩展 ID 格式

扩展唯一标识符格式：`{publisher}.{name}`

**示例：**
- `esbenp.prettier-vscode`
- `ms-python.python`
- `dbaeumer.vscode-eslint`

## 扩展目录结构

```
extensions/
├── publisher.extension-1.0.0/
│   ├── package.json
│   ├── extension.js (或 extension.bundle.js)
│   ├── README.md
│   ├── CHANGELOG.md
│   ├── node_modules/
│   └── out/ (或 dist/)
└── another-publisher.extension-2.0.0/
    └── ...
```

### 目录命名规则
格式：`{publisher}.{name}-{version}`

**示例：**
- `esbenp.prettier-vscode-10.1.0`
- `ms-python.python-2024.0.0`

## engines.vscode 版本语法

### 常见模式
- `^1.85.0`: 1.85.0 及以上（不包括 2.x）
- `>=1.80.0`: 1.80.0 及以上
- `*`: 任意版本（不推荐）
- `1.85.0 - 1.90.0`: 版本范围

### 版本检查逻辑
如果目标编辑器版本 < `engines.vscode` 要求：
- 扩展可能显示"不兼容"
- 功能可能异常
- 建议重新安装兼容版本

## 扩展分类（categories）

### 官方分类
- `Programming Languages`: 语言支持
- `Debuggers`: 调试器
- `Formatters`: 代码格式化
- `Linters`: 代码检查
- `Snippets`: 代码片段
- `Themes`: 主题
- `Extension Packs`: 扩展包
- `Language Packs`: 语言包
- `Data Science`: 数据科学
- `Machine Learning`: 机器学习
- `Testing`: 测试工具
- `Education`: 教育
- `Visualization`: 可视化
- `Notebooks`: 笔记本
- `SCM Providers`: 版本控制
- `Keymaps`: 键盘映射
- `Azure`: Azure 集成
- `Other`: 其他

### 用途
- 筛选扩展（如仅查看主题）
- 识别功能重复（多个 Formatters）
- 确定扩展优先级（核心语言支持 vs 主题）

## 扩展依赖（extensionDependencies）

### 示例
```json
{
  "extensionDependencies": [
    "ms-python.python",
    "ms-toolsai.jupyter"
  ]
}
```

### 处理策略
1. 迁移时检查依赖是否存在
2. 缺失依赖会导致扩展功能异常
3. 建议先安装依赖，再安装扩展

## 扩展签名

### VSCode 1.85.0+ 签名验证
- 扩展发布时由 Marketplace 签名
- 直接文件复制会破坏签名
- 签名失效 → 扩展可能拒绝加载

### 解决方案
1. 从扩展市场重新安装
2. 或禁用签名验证（不推荐）

## 参考链接
- [VSCode Extension API](https://code.visualstudio.com/api)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
