---
name: cook-link-skills
description: 当需要在两个目录间建立 skill 文件的硬链接/同步桥梁，使目标系统能持续使用源系统的 skill，且一处修改处处生效时使用。支持 Reasonix、Hermes、OpenClaw 等任意目标。触发词：硬链接、cook-link、skill桥接、同步skill、链接skills。
run_as: inline
allowed_tools:
  - read_file
  - write_file
  - edit_file
  - multi_edit
  - run_command
  - search_files
  - search_content
  - list_directory
  - create_directory
  - get_file_info
  - delete_file
---

# 目标
将 skill 文件从 **源目录 A**（按特定目录结构组织）同步到 **目标目录 B**（按目标系统的加载格式），使目标系统启动时能发现并加载这些技能，且对源文件的修改即时反映到目标。

## 何时使用
- 首次搭建 X ↔ Y skill 桥接（如 Cursor → Reasonix、cursor-config → Hermes、.cc-switch → OpenClaw）
- 新增了一个源 skill，需要让目标系统也能看到
- 删除了源 skill，需要清理目标系统的残留链接
- 更换了目标系统，需要重建链接

## 何时不要使用
- 只是一次性拷贝 skill，不需要持续同步
- 源和目标跨文件系统/跨卷（硬链接不可行）
- 目标系统不支持文件系统级链接

## 核心原理

```
源目录 A（Cursor 风格）              目标目录 B（由目的决定格式）
.cursor/                             .reasonix/skills/
  agent-skills/                        write-skill.md     ← 硬链接
    write-skill/SKILL.md ─────→        brainstorming.md   ← 硬链接
    ...                                ...

cursor-config/                       hermes-config/skills/
  skills/                              write-skill.md     ← 硬链接
    write-skill.yml ─────────→         ...
```

| 同步方式 | 沙箱可读 | 双向同步 | 适用场景 |
|----------|:---:|:---:|------|
| 硬链接 | ✅ | ✅ | 同卷、目标系统需透明文件访问 |
| 符号链接 | ❌ | ✅ | 沙箱外直接调用的系统 |
| 目录联结 | 取决于 | ✅ | 目标系统按目录层级加载 |
| 拷贝 | ✅ | ❌ | 跨卷、只需单向同步 |

> **LLM 会根据 `purpose` 自动选择最合适的同步方式和文件命名规则。**

## 输入契约（必须提供）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sourceDir` | 路径 | `.cursor` | 源 skill 所在根目录 |
| `targetDir` | 路径 | *必填* | 目标系统 skill 目录 |
| `purpose` | 字符串 | `"让 targetDir 始终能使用 sourceDir 中的 skill"` | 自然语言描述目的 |

### `purpose` 的动态分析

`purpose` 会被发送给 LLM 分析，LLM 需输出以下决策：

1. **目标文件格式**：扁平 `.md` / 嵌套目录 / 其他
2. **同步策略**：硬链接 / 符号链接 / 拷贝
3. **文件命名规则**：如何从源目录结构映射到目标文件名（如 `category/skill-name/SKILL.md` → `skill-name.md`）
4. **过滤规则**：排除哪些子目录（`feature-skills/`、`template/`、`assets/` 等）
5. **前端元数据适配**：是否需要转换 `name` 字段、编码等

典型目的示例：

| purpose | LLM 推断的策略 |
|---------|---------------|
| 让 Reasonix 能使用 Cursor 的 skill | 扁平 `.md` 硬链接，ASCII frontmatter name |
| 让 Hermes 硬链接 cursor-config 中的 skills | 取决于 Hermes 加载格式，LLM 判断 |
| 让 OpenClaw 硬链接 .cc-switch 中的 skills | 取决于 OpenClaw 加载格式，LLM 判断 |

## RED — 现状诊断

1. **确认 sourceDir 存在**，扫描其下的 `SKILL.md`（或目标系统约定的技能文件）
2. **确认 targetDir 父目录存在**（targetDir 本身可自动创建）
3. **收集 purpose**：记录用户提供的目的描述，传递到 GREEN 步骤 1 让 LLM 分析
4. **检查跨卷问题**：`sourceDir` 和 `targetDir` 是否在同一 NTFS 卷？如果是硬链接策略且跨卷，暂停确认。

若以下关键事实缺失，先停下来确认：
- `targetDir` 未提供
- `sourceDir` 不存在
- 源和目标跨卷且策略为 hardlink
- LLM 无法从 purpose 推断出可执行的策略

## GREEN — 执行

> 执行流：`分析 purpose → 扫描源 → [检查点 A] → 建立链接 → [检查点 B] → 适配元数据 → 验证 → [检查点 C]`

### 步骤 1：让 LLM 分析 purpose

将以下 prompt 发给当前会话的 LLM：

```json
// 分析 skill 桥接目的，输出结构化策略
// purpose: {用户提供的 purpose}
// sourceDir: {sourceDir}
// targetDir: {targetDir}

// 输出约束：
// - targetFilePattern: 只允许 "flat"（扁平 .md）或 "nested"（嵌套目录）
// - linkType: 只允许 "hardlink" / "symlink" / "copy"，默认 hardlink
// - sourceFileGlob: 源文件匹配，如 "**/SKILL.md"
// - namingRule: 必须可执行，如 "取源路径最后一级目录名 + .md 扩展名"
// - excludeDirs: 必须为数组，至少包含 ["feature-skills","intention-skills","template","assets","evals","references"]
// - frontmatterTransform: 只允许 "ascii-name"（中文→ASCII）、"none"、"custom:<规则>"
// - notes: 不超过 3 句话
```

**示例输出（Reasonix 场景）：**

```json
{
  "targetFilePattern": "flat",
  "linkType": "hardlink",
  "sourceFileGlob": "**/SKILL.md",
  "namingRule": "取源路径最后一级目录名 + .md 扩展名，如 agent-skills/write-skill/SKILL.md → write-skill.md",
  "excludeDirs": ["feature-skills","intention-skills","template","templates","assets","evals","references","subskills","_shared","plugins"],
  "frontmatterTransform": "ascii-name",
  "notes": "Reasonix 技能为扁平 .md 文件，name 字段须 ASCII。硬链接需同 NTFS 卷。"
}
```

如果 LLM 返回的 JSON 缺少字段或值超出约束范围，先暂停确认，不要用猜测值继续。

基于 LLM 的返回值，继续后续步骤。

### 步骤 2：扫描源文件

```powershell
.\cook-link.ps1 -SourceDir "<sourceDir>" -TargetDir "<targetDir>" -DryRun
```

> ⏸️ **检查点 A**：确认扫描到的 skill 数量和名称是否符合预期，是否存在意外的子 skill（如 `after.md`、`few-shot-example.md`）。不符合预期则调整 `ExcludeDirs` 后重新扫描。

### 步骤 3：建立链接

使用 `template/cook-link.ps1` 脚本（已参数化）：

```powershell
.\cook-link.ps1 -SourceDir ".cursor" -TargetDir ".reasonix\skills" -Purpose "让 Reasonix 始终能使用 Cursor 中的 skill"
```

脚本会自动：
1. 扫描 sourceDir 下所有 skill 文件
2. 根据 linkStrategy 过滤
3. 按 namingRule 计算目标路径
4. 用 linkType 建立链接
5. 如需要，执行 frontmatterTransform

> ⏸️ **检查点 B**：确认 `created` 数量 > 0 且 `failed` = 0。如果全部 `skipped`，检查是否已有同名文件未用 `-Force`。

### 步骤 4：前端元数据适配

根据 `linkStrategy.frontmatterTransform` 规则修改 frontmatter。

常见规则：
- Reasonix 要求 `name` 字段为 ASCII → 中文 `name` 需改为英文目录名
- Hermes 可能要求 YAML 格式 → 需转换 frontmatter
- OpenClaw 可能有自定义字段要求

### 步骤 5：验证

```powershell
# 确认链接已建立
Get-ChildItem <targetDir>\*.md | ForEach-Object {
    $item = Get-Item $_.FullName
    Write-Host "$($_.Name): linkType=$($item.LinkType) linkCount=$($item.LinkCount)"
}
```

> ⏸️ **检查点 C**：确认所有目标文件的 `linkCount >= 2`（说明硬链接成功共享 inode）。如果 `linkCount = 1`，说明是独立拷贝而非硬链接，检查同卷约束。

## 资源入口
- 泛用桥接 few-shot：`[[assets/few-shot-example/generic-bridge.md]]`
- Reasonix 桥接 few-shot：`[[assets/few-shot-example/reasonix-bridge.md]]`
- 硬链接约束与目标系统约定：`[[references/hardlink-gotchas.md]]`
- 评估用例：`[[evals/evals.json]]`
- 脚本模板：`[[template/cook-link.ps1]]`

## REFACTOR
- 如果多种目标系统的策略重复出现，考虑沉淀为预设（Preset）：
  - `preset: reasonix` → flat .md hardlink, ASCII name
  - `preset: hermes` → 待 Hermes 接入后定义
  - `preset: openclaw` → 待 OpenClaw 接入后定义
- 如果 `cook-link.ps1` 的 discover 逻辑变得复杂，拆分为 `discover.ps1` + `link.ps1`

## 边界条件与异常处理

### 执行前
- 源和目标跨卷且策略为 hardlink → 降级为 copy 或暂停
- 目标目录已有同名文件且 linkCount=1 → 询问覆盖还是跳过
- LLM 无法从 purpose 推断策略 → 暂停

### 执行中
- **部分失败**：脚本 `failed > 0` 时，检查失败原因（权限？路径不存在？）
  - 如果是权限问题 → 以管理员身份重跑
  - 如果是路径问题 → 修路径后重跑
  - 不要盲目 `-Force` 全覆盖，保留已成功的链接
- **全部 skipped**：检查是否 targetDir 已有内容且未传 `-Force`
- **linkCount = 1 而非 2**：硬链接未生效，检查同卷约束

### 回滚策略
- 硬链接可通过 `Remove-Item <targetDir>\*.md` 安全清理（不影响源文件，因为 linkCount > 1 时只删除目标目录条目）
- 不提供自动回滚脚本——单条删除已足够精确

## 人工门禁
以下情况必须先停下来确认：
- 源和目标跨卷 → 只能用拷贝，确认是否接受不同步的代价
- LLM 返回的 strategy 与预期差异大 → 手动调整 purpose 描述重试
- 目标系统 skill 格式无法从 purpose 推断 → 手动指定 linkStrategy
- 目标目录已有同名文件且 linkCount=1（独立拷贝） → 先决定保留还是覆盖

## 使用示例

```text
# 场景 1：Cursor → Reasonix（默认 sourceDir）
使用 $cook-link-skills
targetDir: .reasonix/skills
purpose: 让 Reasonix 始终能使用 Cursor 中的 skill

# 场景 2：cursor-config → Hermes
使用 $cook-link-skills
sourceDir: cursor-config
targetDir: hermes-config/skills
purpose: Hermes 需要硬链接 cursor-config 中的 skills，一处修改处处生效

# 场景 3：.cc-switch → OpenClaw
使用 $cook-link-skills
sourceDir: .cc-switch
targetDir: openclaw-config/skills
purpose: 让 OpenClaw 始终能使用 .cc-switch 中的 skills，要求硬链接同步

# 场景 4：仅重建已有桥接（不分析 purpose）
使用 $cook-link-skills
sourceDir: .cursor
targetDir: .reasonix/skills
```
