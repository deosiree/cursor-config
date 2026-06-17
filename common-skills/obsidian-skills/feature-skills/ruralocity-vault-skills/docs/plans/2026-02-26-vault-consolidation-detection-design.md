# Vault Consolidation Detection Skill — Design

**Date:** 2026-02-26
**Status:** Approved

## Problem

The vault contains ~1,952 notes. Over time, related information accumulates across multiple small, distinct notes that would be better served as sections of a single comprehensive document. Unlike duplicates (notes with overlapping content), these are notes with *different* content about *related* sub-topics.

Examples:
- "Atlas API Endpoints", "Atlas Authentication", "Atlas Error Codes" → one "Atlas API Reference" note
- Five 100-word notes about React hooks patterns → one canonical "React Hooks" note

The existing duplicate detection skill doesn't catch these because the notes have different titles and different content — they're related, not redundant.

## Approach

**Claude-native analysis** — no external scripts. Claude reads and analyzes files directly, leveraging semantic understanding to recognize relationships that algorithmic matching would miss. Results are presented interactively in conversation.

### Why Not a Script?

- Claude's semantic understanding catches relationships scripts miss (e.g., "Atlas API" and "Atlas Authentication" as related)
- Interactive review fits naturally in conversation
- No dependencies to maintain
- Configurable scope keeps context manageable

## Skill Identity

- **Name:** `vault-consolidation-detection`
- **Location:** `.claude/skills/vault-consolidation-detection/SKILL.md`
- **Trigger:** Vault maintenance, weekly/monthly review, or when user asks about consolidating/collapsing/combining notes

## Scope

Configurable per run. The skill prompts the user for which folders to scan. Defaults to same exclusions as duplicate detection:
- **Excluded:** `Daily/`, `Templates/`, `00-Inbox/`, `.obsidian/`
- **Included:** Everything else in the vault

## Discovery Process

### Phase 1: Inventory

Read all markdown files in the specified scope. For each file, extract:
- Title (filename)
- Tags (from YAML frontmatter)
- Wiki-links (outgoing `[[links]]`)
- Word count
- Folder path

Flag "small" notes (under ~300 words) as higher-priority candidates.

### Phase 2: Grouping Signals

Cluster notes using these weighted signals (strongest first):

1. **Title prefix patterns** — Notes sharing a common prefix ("Atlas API", "Atlas Auth", "Atlas Errors") suggest subtopics of one parent topic
2. **Mutual wiki-links** — 3+ notes that link to each other form a cluster. More cross-links = stronger signal
3. **Shared tags + same folder** — Notes with the same tags in the same directory are likely related fragments
4. **Small size cluster** — A group of related small notes (individually <300 words) that together would make a reasonable single document

A group needs **at least 2 signals** to be flagged as a consolidation candidate.

### Phase 3: Ranking

- Groups ranked by signal strength (more signals + more notes = higher priority)
- Groups where all notes are small get a boost (clearest consolidation wins)
- Groups presented strongest-first

## Interactive Review Flow

For each candidate group, present:

```
### Group: [Suggested Canonical Title]
**Signal strength:** [Strong/Moderate] — [list which signals matched]
**Notes in group:**
- `path/to/note1.md` (120 words) — [1-line summary]
- `path/to/note2.md` (85 words) — [1-line summary]
- `path/to/note3.md` (210 words) — [1-line summary]

**Why consolidate:** [Brief explanation of why these belong together]
**Suggested structure:** [Outline of what the merged canonical note could look like]
```

User chooses:
- **Consolidate now** — Create the canonical note immediately
- **Skip** — Move to next group
- **Not related** — Dismiss the group

After all groups reviewed, present summary: groups found, consolidated, skipped.

## Consolidation Action

When the user approves a group:

1. **Create canonical note** using `Templates/Canonical Note.md` in `Knowledge Base 🧠/` (or user-specified folder)
2. **Merge content** — Combine source note content into logical sections, deduplicating overlap
3. **Preserve links** — Update incoming wiki-links from other notes to point to the new canonical note
4. **Handle source notes** — Ask user whether to:
   - Delete the originals
   - Keep as stubs with redirect link (`See [[Canonical Note Title]]`)
5. **Tag** — Add `canonical` tag to the new note

### Safety Guardrails

Claude does NOT automatically:
- Move notes across folders without asking
- Delete any files without explicit confirmation
- Modify notes outside the scanned scope

## Relationship to Existing Skills

- **vault-duplicate-detection:** Finds notes with overlapping content (same thing said twice). This skill finds notes with *different* content about *related* topics (fragments of a bigger picture). Complementary, not overlapping.
- **vault-weekly-review:** The weekly review prompts manual consolidation. This skill automates the *discovery* of candidates, making the weekly review more productive.
