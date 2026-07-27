---
name: 冗余扩展识别
description: 交互式识别冗余扩展，支持按类别筛选、批量选择、预览删除影响。
---

# 功能
生成扩展清单，引导用户交互式选择要删除的冗余扩展。

## 输入
- `targetExtDir`: 目标扩展目录路径
- `filterMode`: 筛选模式（all | themes | formatters | linters | custom）
- `customFilter`: 自定义筛选关键词（当 filterMode=custom 时）

## 冗余扩展定义
以下情况视为可能冗余：
1. **功能重复**：多个主题、多个格式化工具、多个同语言 linter
2. **版本重复**：同一扩展的多个版本共存
3. **废弃扩展**：被标记为 deprecated 或已有替代品
4. **未启用扩展**：长期禁用但未卸载

## 处理流程

### 1. 扫描扩展目录
- 列出所有扩展文件夹
- 解析每个扩展的 `package.json`
- 提取分类信息（categories、keywords）

### 2. 分组展示
按以下方式分组：
- **按类别**：主题、格式化工具、语言支持、调试器等
- **按发布者**：Microsoft、GitHub、第三方
- **按状态**：启用、禁用、废弃

### 3. 交互式选择
生成带编号的扩展列表：
```
扩展清单（按类别分组）
============================

[主题] (5 个)
  [1] Dracula Official (dracula-theme.theme-dracula)
      深色主题，流行度高
  [2] One Dark Pro (zhuangtongfa.material-theme)
      深色主题，类似 Atom
  [3] ...

[格式化工具] (3 个)
  [4] Prettier (esbenp.prettier-vscode)
      通用格式化，支持多语言
  [5] Beautify (HookyQR.beautify)
      HTML/CSS/JS 格式化
  [6] ...

[语言支持] (15 个)
  [7] Python (ms-python.python)
      ...
  ...

---
总计: 50 个扩展

请输入要删除的扩展编号（逗号分隔，如 1,2,5）：
或输入 'filter themes' 仅查看主题类扩展
或输入 'done' 跳过清理
```

### 4. 确认删除
显示删除预览：
```
即将删除以下扩展：
  - Dracula Official (dracula-theme.theme-dracula)
  - One Dark Pro (zhuangtongfa.material-theme)
  - Beautify (HookyQR.beautify)

确认删除？(y/n):
```

### 5. 执行删除
- 删除选中扩展的文件夹
- 记录删除日志
- 提示重启编辑器

## 智能建议

### 主题冗余检测
- 检测是否安装了 >3 个主题
- 建议：保留 1-2 个常用主题，删除其他

### 格式化工具冲突
- 检测是否同时安装了 Prettier + Beautify + 其他格式化工具
- 建议：通常只需要 Prettier

### 语言支持重复
- 检测是否安装了同一语言的多个扩展（如 Python 有官方版和第三方版）
- 建议：优先使用官方扩展

### 废弃扩展
- 检测 package.json 中的 `deprecated` 标记
- 建议：查找替代扩展

## 输出
- 控制台交互式界面
- 删除日志：`cleanup-log.txt`
- 保留的扩展清单：`extensions-remaining.txt`

## 关联模板
- `[[../../template/identify-redundant.ps1]]` - PowerShell 交互式脚本

## 使用示例

### 示例 1：全量筛选
```text
用户说：列出所有扩展，我挑出不需要的

Agent 执行：
1. 扫描目录
2. 生成编号列表（50 个扩展）
3. 等待用户输入（如 "1,5,8,12"）
4. 确认后删除
```

### 示例 2：仅看主题
```text
用户说：我装了太多主题，想删掉一些

Agent 执行：
1. filterMode=themes
2. 仅显示主题类扩展（5 个）
3. 用户选择删除 [1,2]
4. 确认后删除
```

### 示例 3：跳过清理
```text
用户说：先不清理了

Agent 执行：
1. 显示列表
2. 用户输入 'done'
3. 跳过删除，输出当前扩展清单供参考
```

## 安全保护
- 不允许删除以下核心扩展：
  - 语言基础支持（如 Python、JavaScript）
  - 编辑器内置扩展（publisher 为编辑器官方）
- 删除前二次确认
- 记录删除日志以便回溯

## 未来优化
- 自动检测功能重复（通过 keywords/categories 相似度）
- 基于使用频率推荐删除（需要编辑器 API 支持）
- 导出/导入扩展配置（JSON 格式）
