# cook-link-skills

在两个目录间建立 skill 文件的桥梁——源目录修改，目标系统立即可见。

## 为什么用这个

你有一个 skill 仓库（如 `.cursor/`），但多个 AI 工具都要用（Reasonix、Hermes、OpenClaw…）。硬链接让它们共享同一份数据，一处修改处处生效。

## 快速开始

```powershell
# 默认场景：Cursor → Reasonix
.\template\cook-link.ps1 -TargetDir ".reasonix\skills"

# 自定义场景：任意源 → 任意目标
.\template\cook-link.ps1 `
  -SourceDir "cursor-config" `
  -TargetDir "hermes-config/skills" `
  -Purpose "让 Hermes 始终能使用 cursor-config 中的 skills"

# 预览模式（不实际修改文件）
.\template\cook-link.ps1 -TargetDir ".reasonix\skills" -DryRun
```

## 参数

| 参数 | 必填 | 默认值 | 说明 |
|------|:--:|--------|------|
| `-SourceDir` | | `.cursor` | 源 skill 根目录 |
| `-TargetDir` | ✅ | | 目标 skill 目录 |
| `-Purpose` | | `"让目标始终能使用源中的 skill"` | 目的描述 |
| `-SourceFileGlob` | | `SKILL.md` | 源文件匹配模式 |
| `-LinkType` | | `hardlink` | 链接类型：`hardlink` / `symlink` / `copy` |
| `-ExcludeDirs` | | `['assets','template',...]` | 排除的子目录 |
| `-MaxDepth` | | `5` | 递归深度 |
| `-DryRun` | | ❌ | 预览模式 |
| `-Force` | | ❌ | 覆盖已存在的目标文件 |

## 支持的场景

| 源 | 目标 | 命令 |
|----|------|------|
| `.cursor/` | `.reasonix/skills/` | `-TargetDir ".reasonix\skills"` |
| `cursor-config/` | `hermes-config/skills/` | `-SourceDir "cursor-config" -TargetDir "hermes-config\skills"` |
| `.cc-switch/` | `openclaw-config/skills/` | `-SourceDir ".cc-switch" -TargetDir "openclaw-config\skills"` |
| 任意 | 任意 | 自定义 `-SourceDir` + `-TargetDir` |

## 文件结构

```
cook-link-skills/
├── SKILL.md              # AI 执行指引（RED/GREEN/REFACTOR 结构）
├── README.md             # 本文件（人类速览）
└── template/
    └── cook-link.ps1     # 通用参数化脚本
```
