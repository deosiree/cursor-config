---
name: obsidian-vault-management
description: Creates, edits, and manages Obsidian vault content including notes, templates, daily notes, and dataview queries. Use when working with markdown files in an Obsidian vault, creating notes, writing templates, building dataview queries, or organizing knowledge management content. 中文触发：新建笔记、记录、保存、读笔记、搜笔记、写日记、daily note。
---

# Obsidian Vault Management

## Vault Structure (PARA-Based)

This vault uses a PARA-like organization:

| Folder | Purpose |
|--------|---------|
| `00 - Maps of Content` | Index notes linking related topics |
| `01 - Projects` | Active project notes |
| `02 - Areas` | Ongoing responsibilities |
| `03 - Resources` | Reference materials |
| `04 - Permanent` | Evergreen/zettelkasten notes |
| `05 - Fleeting` | Quick capture notes |
| `06 - Daily` | Daily notes (YYYY/MM/YYYYMMDD.md) |
| `07 - Archives` | Completed/inactive content |
| `08 - books` | Book notes and clippings |
| `99 - Meta` | Templates, settings |
| `Clippings` | Web clips and imports |

## Quick Reference

### Linking Syntax

```markdown
[[Note Name]]                    # Basic wikilink
[[Note Name|Display Text]]       # Aliased link
[[Note Name#Heading]]            # Link to heading
[[Note Name#^block-id]]          # Link to block
![[Note Name]]                   # Embed note
![[image.png]]                   # Embed image
![[Note Name#Heading]]           # Embed section
```

### Frontmatter Template

```yaml
---
created: {{date:YYYY-MM-DDTHH:mm}}
updated: {{date:YYYY-MM-DDTHH:mm}}
title: "Note Title"
type: note
status: draft
tags:
  - tag1
  - tag2
aliases:
  - "Alternate Name"
cssclasses:
  - custom-class
---
```

### Callouts

```markdown
> [!note] Title
> Content

> [!warning] Important
> Warning content

> [!tip] Helpful tip
> Tip content

> [!info]+ Collapsible (open by default)
> Content

> [!danger]- Collapsed by default
> Content
```

**Available callout types**: note, abstract, info, todo, tip, success, question, warning, failure, danger, bug, example, quote

## 执行前置检查（强制）

在创建或修改任何笔记前，必须先执行以下检查：

```
Step 1: 确认 VAULT_ROOT 是否可访问
    ├─ test -d "$VAULT_ROOT" && echo "OK"
    └─ 失败 → 检查 .env 文件或提示用户设置

Step 2: 确认目标目录存在
    ├─ 例如：PARA 的 01-07 目录是否齐全
    └─ 缺失 → 先创建目录再继续

Step 3: 如果涉及修改已有笔记
    ├─ 先 read_file 确认内容
    └─ 显示摘要给用户确认 → "确认要修改这篇笔记吗？[y/N]"
```

## 创建或编辑笔记

### 判断笔记类型

在创建前先判断笔记类型：

```
用户请求
    ↓
是每日记录？ → Daily Note
是快速想法？ → Fleeting Note (05 - Fleeting/)
是项目内容？ → Project Note (01 - Projects/)
是知识沉淀？ → Permanent Note (04 - Permanent/)
其他 → 询问用户分类
```

### Daily Note

Create in `06 - Daily/YYYY/MM/` with filename `YYYYMMDD.md`:

```yaml
---
created: 2025-12-09T09:00
updated: 2025-12-09T09:00
title: "20251209"
type: daily-note
status: true
tags:
  - daily
  - journal
  - 2025
  - 2025-12
aliases:
  - "2025-12-09"
date_formatted: 2025-12-09
topics:
  - "[[daily]]"
  - "[[journal]]"
related:
  - "[[2025-12-08]]"
  - "[[2025-12-10]]"
cssclasses:
  - daily
---

# Daily Note - 2025-12-09

### Tasks
- [ ] Task 1

### Journal
...

### Navigation
<< [[2025-12-08]] | **Today** | [[2025-12-10]] >>
```

### Zettelkasten Note

Create in `04 - Permanent/`:

```yaml
---
created: {{date}}
type: zettelkasten
tags:
  - permanent
  - topic
---

# Note Title

## Main Insight
**Key Idea**: [Main point]

## Connections
- [[Related Note 1]]
- [[Related Note 2]]

## References
- Source citation
```

## Dataview Queries

For dataview query syntax, see [references/dataview.md](references/dataview.md).

**Quick examples:**

```dataview
LIST FROM "06 - Daily" WHERE file.cday = date(today) SORT file.ctime DESC
```

```dataview
TABLE status, tags FROM "01 - Projects" WHERE status != "completed"
```

## Templates

Templates location: `99 - Meta/00 - Templates/`

For Templater syntax, see [references/templater.md](references/templater.md).

**Common Templater variables:**

```markdown
<% tp.file.title %>              # Current file name
<% tp.date.now("YYYY-MM-DD") %>  # Current date
<% tp.file.cursor(1) %>          # Cursor position
<% tp.system.prompt("Question") %> # User input prompt
```

## Installed Plugins

| Plugin | Purpose |
|--------|---------|
| **Dataview** | Query and display data from notes |
| **Templater** | Advanced templates with scripting |
| **Auto Note Mover** | Auto-organize notes by tags |
| **Periodic Notes** | Daily/weekly/monthly notes |
| **Kanban** | Kanban boards in markdown |
| **Tag Wrangler** | Bulk tag management |
| **Table Editor** | Markdown table editing |
| **Advanced URI** | Deep links to notes |
| **Local REST API** | External API access |

## File Operations

### Creating a Note

1. Determine appropriate folder based on note type
2. Add proper frontmatter
3. Use consistent naming conventions
4. Include relevant tags for auto-organization

### Best Practices

- Use descriptive filenames (avoid special characters except hyphens)
- Always include `created` and `updated` timestamps
- Tag notes for discoverability
- Link to related notes bidirectionally
- Use callouts for important information
- Include navigation links in daily notes

### 异常处理

| 场景 | 处理方式 |
|------|---------|
| VAULT_ROOT 未设置 | 检查 .env 文件 → 提示用户 `export VAULT_ROOT=<path>` |
| 目标目录不存在 | 先创建目录再创建笔记，记录到操作日志 |
| 笔记文件已存在 | 询问用户：覆盖 / 追加 / 取消 |
| Dataview 查询返回空 | 检查 vault 路径是否正确，检查是否有笔记符合条件 |
| 文件名含特殊字符 | 自动替换为连字符，提示用户原名 |
| Templater 变量在 CLI 中不可用 | 注：`tp.system.*` 在 CLI 下返回 nil，改用静态模板 |

### Windows 兼容说明

本 skill 的 Python 脚本原为 Linux 环境编写，在 Windows 上需注意：

| 问题 | 表现 | 修复 |
|------|------|------|
| `python3` 命令不可用 | exit 49（Microsoft Store 假死） | 改用 `python` 或 `py` |
| GBK 编码输出乱码 | `UnicodeEncodeError: 'gbk' codec can't encode` | 执行前设置 `PYTHONIOENCODING=utf-8` |
| 路径分隔符 | `\` 与 `/` 混用 | Python `pathlib` 自动处理，无需手动转义 |

```bash
# Windows 下正确执行方式
set PYTHONIOENCODING=utf-8
python scripts/create-daily-note.py 2026-07-16
```

## Advanced Features

- **Dataview queries**: [references/dataview.md](references/dataview.md)
- **Templater scripting**: [references/templater.md](references/templater.md)
- **Canvas diagrams**: [references/canvas.md](references/canvas.md)
- **Plugin configurations**: [references/plugins.md](references/plugins.md)

---

## Gotchas

- **Bulk operations outside Obsidian don't trigger link-rebuilding** — external scripts must signal a `:Reindex` or wait for the next vault open.
- **Dataview cache is per-vault and per-session** — CLI script-based DQL queries may see stale state if Obsidian was last open with different filters.
- **Templater scripts via CLI run in a different context than the UI** — many `tp.system.*` functions return nil (no UI to prompt against).
- **PARA folder moves break tag-based queries** — if your queries hardcode folder paths, refactor them to use tags or properties before reorganizing.
- **Daily note rotation: changing the daily-note format mid-vault leaves old notes orphaned** — they don't auto-migrate to the new format; a rename pass is needed.
