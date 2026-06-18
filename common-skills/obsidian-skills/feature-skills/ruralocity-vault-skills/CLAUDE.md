# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an Obsidian vault - a personal knowledge management system containing approximately 1,952 markdown files organized by topic. The vault uses wiki-style linking to connect related notes and concepts.

## Vault Structure

The vault is organized into topical folders:

- `Daily/` - Daily notes with structured template (action needed, schedule, in progress, notes)
- `ORM 🧑‍🎓/` - Work-related notes (O'Reilly Media), includes subdirectories:
  - `Atlas/` - Atlas platform notes
  - `Product App/` - Product application development
  - `PIM/` - Product Information Management
  - `Covers/` - Cover generation system
  - `Publishing Engineering (Pub Eng)/` - Publishing engineering projects
  - And other project-specific folders
- `Knowledge Base 🧠/` - Technical articles and reference material
- `Left of the Dev 👨‍💻/` - Technical blog posts and articles
- `Home 🏡/` - Personal and household notes
- `People 👥/` - People-related notes and relationships
- `Projects 🛠️/` - Personal project tracking
- `CRL Work 🛠️/` - CRL work-related notes
- `Recipes 🍗/` - Cooking recipes
- `Templates/` - Note templates
- `00-Inbox/` - Quick capture inbox for unprocessed notes

## Note Structure and Conventions

### Daily Notes
- Auto-created in `Daily/` folder with `YYYY-MM-DD.md` naming
- Use the template from `Templates/Daily note.md`:
  - `## action needed` - tasks requiring action
  - `## schedule` - calendar items and meetings
  - `## in progress` - current work
  - `## notes` - general observations

### Work Project Notes
- Use template from `Templates/Work project notes.md`
- Include YAML frontmatter with `Ticket:` and `tags:` fields
- Sections: `## Overview` and `## Notes`

### Linking Conventions
- Use wiki-style links: `[[Note Title]]` to link between notes
- Obsidian automatically creates backlinks between connected notes
- The vault relies heavily on these connections to build a knowledge graph

## Key Obsidian Features

### Core Plugins Enabled
- Daily notes (auto-create in `Daily/` folder)
- Templates (stored in `Templates/` folder)
- File explorer (sorted by modified time by default)
- Graph view for visualizing connections
- Backlinks and outgoing links
- Properties and tags
- File recovery for safety

### Community Plugins
- **calendar** - Calendar view for daily notes navigation
- **homepage** - Custom homepage on vault open
- **folder-notes** - Create notes for folders
- **waypoint** - Generate automatic folder TOCs
- **templater-obsidian** - Advanced template features
- **obsidian-auto-link-title** - Auto-fetch page titles for pasted URLs
- **obsidian-advanced-uri** - Advanced linking capabilities
- **mermaid-popup** - Enhanced Mermaid diagram rendering
- **tag-wrangler** - Tag management
- **searchpp** - Enhanced search

## Working with This Vault

### Creating New Notes
- For daily notes: Use Obsidian's daily note feature or create in `Daily/YYYY-MM-DD.md`
- For work notes: Place in appropriate `ORM 🧑‍🎓/` subdirectory, use work project template
- For knowledge articles: Add to `Knowledge Base 🧠/`
- For quick capture: Drop in `00-Inbox/` and organize later

### Note Naming
- Use descriptive, human-readable names
- Spaces are fine in filenames
- Emoji prefixes are used in folder names for visual organization

### Content Guidelines
- Prefer creating links between related notes
- Use YAML frontmatter for structured metadata when needed
- Include tags for categorical organization
- Markdown standard: CommonMark with Obsidian extensions

### File Organization
- Don't move files without considering backlinks - Obsidian will update links automatically if moved within Obsidian, but external moves can break connections
- Images and attachments are stored in the same folder as the note by default (see `.obsidian/app.json`)
- The file explorer is sorted by modification time, so recently edited files appear first

## Vault Organization System

This vault now uses a structured three-zone organization system designed to prevent duplication and maintain clarity.

### Documentation
- [Full System Guide](docs/Vault-Organization-System.md) - Comprehensive guide to the three-zone system
- [Quick Reference](docs/Quick-Reference.md) - Cheat sheet for common tasks and searches
- [Implementation Plan](docs/plans/2026-02-12-vault-organization-implementation.md) - How the system was built

### Skills (Claude Code)
Vault maintenance tasks are available as Claude Code skills in `.claude/skills/`:
- **vault-duplicate-detection** - Detect and consolidate duplicate content (monthly or as needed)
- **vault-consolidation-detection** - Find groups of related notes that could be consolidated into single documents
- **vault-weekly-review** - Generate weekly review briefing (weekly, before review)

### Supporting Scripts
- `scripts/duplicate_detector.py` - Python duplicate detection script (run via `uv run scripts/duplicate_detector.py`)

### Weekly Maintenance
The vault uses a weekly review ritual (15-30 minutes):
1. **Process Inbox** - Clear `00-Inbox/` to zero
2. **Review Daily Notes** - Extract insights from past week
3. **Check Duplicates** - Prevent duplication from spreading
4. **Maintain Canonical Notes** - Improve one reference note

Use the Weekly Review template (`Templates/Weekly Review.md`) to guide the process.

### Templates Available
- **Inbox Note** - For quick captures
- **Weekly Review** - For weekly maintenance ritual
- **Canonical Note** - For single-source-of-truth reference notes

### Guidelines for Helping

When the user asks for help with vault organization:
- **Search for duplicates:** Use content analysis to find similar notes
- **Suggest consolidation:** Recommend creating canonical notes for scattered topics
- **Generate briefings:** Create weekly review briefings on request
- **Process inbox:** Help decide where notes should be filed
- **Create canonical notes:** Help consolidate information into reference notes
- **Find related notes:** Search for connections between topics

The system emphasizes:
- Low-friction capture (inbox is for everything)
- Regular processing (weekly reviews handle organization)
- Knowledge consolidation (canonical notes as single source of truth)

## Important Notes

- This is a personal knowledge base, not a software project - there are no build/test/lint commands
- The vault uses Obsidian Sync for backup and synchronization
- File recovery is enabled - deleted files can be recovered from `.obsidian/` cache
- Always update links when moving notes to maintain the knowledge graph integrity
- The vault contains work-related notes that may reference internal O'Reilly Media systems and tools
- The organization system is designed to be maintained through weekly reviews - consistency is key
