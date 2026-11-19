---
name: 打包本地项目
description: 在 Windows 上将本地项目打包为 ZIP，用于个人机器之间迁移；默认保留配置、临时文件和输出，只排除已安装依赖目录。
---

# 打包本地项目

## 目标

把本机项目完整迁移到个人另一台机器。必填源目录绝对路径；解压后保留原项目目录结构和本地文件，再由用户在目标机器安装依赖。

## 何时使用

- 将 Windows 本地项目迁移到自己的另一台机器。
- 希望保留配置、输出、缓存、临时文件和隐藏文件，只移除可重新安装的依赖。

## 何时不要使用

- 需要发布给他人、公开分享或上传到不可信位置的归档。
- 要求制作源码发布包、部署制品或只归档 Git 跟踪文件。

## 输入契约

| 字段 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `sourcePath` | 是 | 无 | 待压缩目录的绝对路径，必须存在且为目录。 |
| `includeLocalFiles` | 否 | `true` | `true` 时保留全部本地文件；`false` 时先列出本地排除候选项，确认后再打包。 |
| `destinationPath` | 否 | 源目录旁的 `<目录名>.zip` | ZIP 文件绝对路径，必须尚不存在；不得放在源目录内。 |

## 默认行为

- 保留 `.git`、隐藏文件、配置、凭据、本地数据库、缓存、日志、临时目录、构建产物、输出和未跟踪文件。
- 只排除已安装依赖目录：`node_modules`、`vendor`、`.venv`、`venv`、`env`、`bower_components`、`Pods`、`__pypackages__`。
- 保留依赖声明与锁文件，如 `package.json`、`pnpm-lock.yaml`、`go.mod`、`go.sum`、`Cargo.toml` 和 `Cargo.lock`。
- ZIP 内含源目录自身作为顶层目录；文件相对路径、隐藏项和空目录结构保留。
- 不读取 `.gitignore` 来扩大默认排除范围；不在当前机器安装依赖。
- 输出路径已存在时停止，不覆盖已有归档。压缩先写临时 ZIP，成功后才移动为目标文件。

## 执行流程

1. 验证 `sourcePath` 是 Windows 上存在的绝对目录路径；确认输出路径不在源目录中且尚不存在。
2. 根据清单文件识别迁移后安装依赖的命令，只报告命令，不执行安装。
3. 用 `assets/Compress-LocalProject.ps1` 生成归档。
4. 检查 ZIP 可读取、顶层目录与源目录同名、依赖目录未进入归档、其他本地文件均保留。
5. 返回 ZIP 路径、大小、文件数量、排除的依赖目录数量以及目标机器安装命令。

## 显式排除本地文件

仅当用户给出 `includeLocalFiles=false` 时才进入此流程：

1. 从 `.gitignore` 已忽略的未跟踪文件和常见本地状态路径收集候选项。
2. 在调用脚本前把完整候选清单展示给用户，等待用户确认；不要只展示数量。
3. 确认后使用 `-IncludeLocalFiles:$false -ConfirmLocalExclusions` 打包。
4. 依赖清单和锁文件始终保留；不能静默套用排除项。

脚本预览方式：

```powershell
& 'F:\Documents\Default-Obsidian\huiyanSkills\proj-skills\打包本地项目\assets\Compress-LocalProject.ps1' `
  -SourcePath 'F:\Documents\Repertory\Own\sub2api' `
  -ExcludeLocalFiles `
  -PreviewLocalExclusions
```

预览后由用户确认，再以 `-ConfirmLocalExclusions` 执行。若预览包含必须迁移的配置、数据或输出，应停止并改为默认 `includeLocalFiles=true`，或逐项修正排除范围。

## 依赖安装命令识别

只根据项目内实际存在的清单输出相应安装命令。例如 `sub2api` 有 `frontend/package.json`、`frontend/pnpm-lock.yaml` 和 `backend/go.mod`：

```powershell
Set-Location 'F:\Documents\Repertory\Own\sub2api\frontend'
pnpm install --frozen-lockfile

Set-Location 'F:\Documents\Repertory\Own\sub2api\backend'
go mod download
```

不要因为发现配置就猜测服务端、数据库或 Docker 的安装/启动步骤。

## 失败处理

- 路径缺失、不是绝对路径或不是目录：停止并指出具体参数。
- 输出 ZIP 已存在或放在源目录内部：停止，不删除、不覆盖。
- 检测到符号链接/reparse point：停止并列出路径，避免静默丢失链接语义或跟随链接递归。
- 归档失败：移除本次创建的临时 ZIP，报告错误；不留下成功命名的半成品。
- 依赖清单不足以确定安装命令：只报告已确认的命令，不猜测。

## 使用示例

```text
使用 $打包本地项目：
- sourcePath: F:\Documents\Repertory\Own\sub2api
- includeLocalFiles: true
- destinationPath: 默认（源目录旁的 sub2api.zip）

保留配置、临时文件和输出，只排除已安装的依赖目录；告诉我另一台 Windows 机器解压后如何安装依赖。
```

## 自检

- [ ] 输入源路径为存在的绝对路径。
- [ ] ZIP 内保留源目录顶层名称及相对目录结构。
- [ ] 默认本地配置、输出、隐藏项、临时目录和空目录存在于归档中。
- [ ] 常见已安装依赖目录不在归档中，清单与锁文件仍在。
- [ ] ZIP 可打开；输出未覆盖已有文件。
- [ ] 安装命令与实际清单匹配，且未在本机执行依赖安装。
