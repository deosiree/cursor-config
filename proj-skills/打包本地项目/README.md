# 打包本地项目

Windows 项目迁移打包 skill。提供项目目录的绝对路径后，生成保留原目录结构的 ZIP，目标是把自己的项目迁移到另一台机器后继续使用。

## 默认规则

- 本地文件默认保留：包括 `.git`、配置、输出、缓存、临时文件、构建产物、隐藏文件和空目录。
- 只排除常见已安装依赖目录：`node_modules`、`vendor`、Python 虚拟环境等。
- 依赖清单和锁文件保留；skill 只给出目标机器的安装命令，不在当前机器安装依赖。
- ZIP 默认生成在源目录旁，内部保留源目录名。

## 使用示例

```text
使用 $打包本地项目：
- sourcePath: F:\Documents\Repertory\Own\sub2api
- includeLocalFiles: true
- destinationPath: 默认

保留本地配置、临时文件和输出，只排除已安装依赖目录；压缩完成后列出 pnpm 和 Go 安装命令。
```

显式排除本地文件时，先运行脚本预览候选清单并展示给用户，确认后再打包：

```powershell
& '.\assets\Compress-LocalProject.ps1' `
  -SourcePath 'F:\Documents\Repertory\Own\sub2api' `
  -ExcludeLocalFiles `
  -PreviewLocalExclusions
```

确认清单后，改用 `-ConfirmLocalExclusions` 执行。依赖清单和锁文件仍会保留。

## 文件

- `SKILL.md`：输入契约、默认行为、执行/排除流程和验收清单。
- `assets/Compress-LocalProject.ps1`：Windows PowerShell 打包脚本。
- `assets/Test-Compress-LocalProject.ps1`：隔离临时目录的行为验证。
- `evals/evals.json`：触发边界与验收案例。
- `evals/darwin-trials.md`：本次 baseline、受控试跑和 keep/revert 记录。
