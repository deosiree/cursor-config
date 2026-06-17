---
name: vault-consolidation-detection
description: Use when searching for notes that could be consolidated into single documents, finding fragmented topics, running vault maintenance to identify merge candidates, or when the user mentions collapsing or combining related notes
---

# Vault Consolidation Detection

## Overview

Discovers groups of related notes that would be better served as sections of a single comprehensive document. Unlike duplicate detection (which finds overlapping content), this finds notes with *different* content about *related* sub-topics.

## When to Use

- User asks to "find notes to consolidate" or "collapse related notes"
- During weekly/monthly vault maintenance
- Before creating canonical notes — find which notes should merge
- When the user mentions fragmented knowledge or too many small notes

## Process

### Step 1: Determine Scope

Ask the user which folders to scan. Present options:
- Specific folder(s) the user names
- All vault (excluding `Daily/`, `Templates/`, `00-Inbox/`, `.obsidian/`)

Do NOT assume scope from context. Always ask explicitly, even if the user mentioned a folder in passing.

### Step 2: Inventory

Read all markdown files in the scoped folders. For **each file**, extract and record:
- **Title** (filename without `.md`)
- **Tags** (from YAML frontmatter `tags:` field)
- **Wiki-links** (outgoing `[[links]]`)
- **Word count** (body text, excluding frontmatter and code blocks)
- **Folder path**

Flag notes under ~300 words as "small."

**Exclude from analysis:**
- Notes already tagged `canonical` — these were intentionally structured as standalone references
- Notes under ~20 words — these are stubs/bookmarks better handled by duplicate detection's empty note check

### Step 3: Identify Consolidation Groups

Cluster notes using **all four** of these signals:

1. **Title prefix patterns** — Notes sharing a common prefix of 2+ words
   (e.g., "Atlas API", "Atlas Auth", "Atlas Errors" share "Atlas")
2. **Mutual wiki-links** — 3+ notes that cross-reference each other via `[[links]]`
3. **Shared tags + same folder** — Notes with identical tags in the same directory
4. **Small size cluster** — Related notes all under 300 words that cover facets of one topic

You MUST check all four signal types for every potential group. Do not rely on semantic judgment alone.

**Minimum threshold:** A group needs **at least 2 of the 4 signals** to be flagged. Single-signal matches are too noisy — skip them.

### Step 4: Rank Groups

Order groups for presentation using these criteria (most important first):
- **Signal count** — More signals matched = higher rank
- **Note count** — More notes in group = higher rank
- **Size boost** — Groups where ALL notes are small (<300 words) rank higher

Present strongest groups first.

### Step 5: Interactive Review

Present each group **one at a time** using this exact format:

```
### Group: [Suggested Canonical Title]
**Signal strength:** [Strong (3-4 signals) / Moderate (2 signals)] — [list which signals matched]
**Notes in group:**
- `path/to/note1.md` (120 words) — [1-line summary of content]
- `path/to/note2.md` (85 words) — [1-line summary of content]
- `path/to/note3.md` (210 words) — [1-line summary of content]

**Why consolidate:** [Why these belong together as one document]
**Suggested structure:**
- Section 1: [topic from note 1]
- Section 2: [topic from note 2]
- Section 3: [topic from note 3]
```

After presenting each group, ask the user to choose:
- **Consolidate now** — proceed to create the canonical note
- **Skip** — move to next group
- **Not related** — dismiss this group entirely

Wait for the user's response before presenting the next group.

### Step 6: Consolidation (when user chooses "Consolidate now")

1. **Create** the canonical note using `Templates/Canonical Note.md` template
2. **Place** in `Knowledge Base 🧠/` unless user specifies another folder
3. **Merge** content from source notes into logical sections, deduplicating any overlap
4. **Tag** with `canonical`
5. **Update links** — Search the vault for incoming wiki-links (`[[source note title]]`) pointing to any source note and update them to point to the new canonical note
6. **Handle source notes** — Ask the user:
   - **Delete** the originals
   - **Keep as stubs** with a redirect: `> See [[Canonical Note Title]]`

### Step 7: Summary

After reviewing all groups, present these stats:
- Total groups found
- Groups consolidated
- Groups skipped
- Groups dismissed as not related

## Safety Guardrails

- NEVER delete files without explicit user confirmation
- NEVER move notes without asking
- NEVER modify notes outside the scanned scope
- Always show what will change before making changes
