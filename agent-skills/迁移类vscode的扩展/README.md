# 迁移类 VSCode 的扩展

在 VSCode、Cursor、Kiro 等类 VSCode 编辑器之间迁移扩展的完整解决方案。

## 快速开始

### 场景 1：VSCode → Kiro 一次性迁移

```text
我想把 VSCode 的扩展迁移到 Kiro，
迁移后检查一遍看哪些失效，失效的我手动重装，
最后删掉不需要的冗余扩展。
```

**流程：**
1. Agent 生成并执行复制脚本
2. 提示你启动 Kiro 并检查扩展视图
3. 你记录失效扩展到 `failed-extensions.txt`
4. Agent 分析失效扩展并提供重装建议
5. Agent 列出所有扩展，你选择要删除的
6. Agent 执行清理

### 场景 2：Cursor ↔ VSCode 持续同步

```text
我在 Cursor 和 VSCode 之间频繁切换，
希望两边的扩展保持一致。
```

**流程：**
1. Agent 生成同步脚本
2. 配置定期任务或手动触发
3. 增量同步扩展变化

### 场景 3：团队批量部署

```text
团队有 10 台开发机，需要统一安装相同的扩展。
```

**流程：**
1. 导出标准扩展清单
2. 生成批量安装脚本
3. 分发到各台机器执行

## 何时使用

✅ 适合的场景：
- 从一个编辑器迁移到另一个编辑器
- 多个编辑器之间同步扩展
- 团队环境统一扩展配置
- 清理失效或冗余的扩展

❌ 不适合的场景：
- 只是安装单个扩展（直接用扩展市场）
- 迁移设置、快捷键等配置（需要其他工具）
- 迁移到非 VSCode 系编辑器（如 JetBrains）

## 输入参数

### 必需参数
- `migrationMode`: 迁移模式
  - `one-time`: 一次性迁移
  - `continuous`: 持续同步
  - `batch`: 批量部署
- `sourceEditor`: 源编辑器 (vscode | cursor | kiro)
- `targetEditor`: 目标编辑器 (vscode | cursor | kiro)

### 可选参数
- `validationLevel`: 验证级别 (manual | auto | none)
- `cleanupStrategy`: 清理策略 (interactive | auto | skip)
- `sourceDir`: 自定义源目录
- `targetDir`: 自定义目标目录

## 常见问题

### Q: 复制后扩展显示警告或错误？
**A**: 这是正常的。直接复制可能破坏扩展签名。使用 `失效扩展分析` 功能获取扩展 ID，然后在目标编辑器的扩展市场重新安装。

### Q: 是否需要关闭编辑器再复制？
**A**: 建议关闭源和目标编辑器，避免文件锁定。但不是强制要求。

### Q: 能否自动过滤不兼容的扩展？
**A**: 当前版本需要人工检查。未来版本会集成自动兼容性检测。

### Q: 会迁移扩展的设置吗？
**A**: 不会。本工具仅迁移扩展文件。扩展设置存储在其他位置，需要单独处理。

### Q: 如何回滚到迁移前的状态？
**A**: 在复制前备份目标扩展目录。如需回滚，删除新目录并恢复备份。

## 技术细节

### 支持的编辑器
- VSCode (Visual Studio Code)
- Cursor
- Kiro
- 其他基于 VSCode 的编辑器（需提供自定义路径）

### 默认扩展目录
**Windows:**
- VSCode: `%USERPROFILE%\.vscode\extensions`
- Cursor: `%USERPROFILE%\.cursor\extensions`
- Kiro: `%USERPROFILE%\.kiro\extensions`

**macOS/Linux:**
- VSCode: `~/.vscode/extensions`
- Cursor: `~/.cursor/extensions`
- Kiro: `~/.kiro/extensions`

### 脚本依赖
- **Windows**: PowerShell 5.1+
- **macOS/Linux**: Bash（Bash 脚本待实现）

## 目录结构

```
迁移类vscode的扩展/
├── SKILL.md                  # 主路由器
├── README.md                 # 本文档
├── intention-skills/         # 意图层
│   ├── 一次性迁移/
│   ├── 持续同步/
│   └── 批量部署/
├── feature-skills/           # 功能层
│   ├── 扩展目录复制/
│   ├── 兼容性检测/
│   ├── 失效扩展分析/
│   ├── 冗余扩展识别/
│   └── 清理脚本生成/
├── template/                 # 脚本模板
│   ├── copy-extensions.ps1
│   ├── analyze-failed.ps1
│   ├── identify-redundant.ps1
│   └── cleanup.ps1
├── references/               # 参考文档
└── evals/                    # 评估用例
```

## 相关 Skills
- `write-skill`: 创建和维护本 skill
- `darwin-skill`: 质量评估和迭代

## 贡献与反馈
如遇到问题或有改进建议，欢迎反馈。
