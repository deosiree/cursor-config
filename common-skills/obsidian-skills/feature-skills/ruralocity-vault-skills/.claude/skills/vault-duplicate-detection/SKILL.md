---
name: vault-duplicate-detection
description: Use when searching for duplicate notes, consolidating content, running vault maintenance, or when the user mentions duplicates or overlapping notes in the Obsidian vault
---

# Vault Duplicate Detection

## Overview

Detects duplicate and overlapping notes in the vault using title similarity (80%+) and content similarity (50%+). Can be run via a Python script for speed, or manually by scanning files.

## When to Use

- User asks to "find duplicates" or "search for duplicate notes"
- During weekly review maintenance
- When consolidating notes on a topic
- When the user mentions overlapping or redundant content

## Running the Detector

The vault includes a Python script at `scripts/duplicate_detector.py`. **It must be run via `uv`:**

```bash
uv run scripts/duplicate_detector.py
```

The script outputs a report to `00-Inbox/Duplicate-Detection-Report-YYYY-MM-DD.md`.

**Before running:** Update the `output_path` date in `main()` to today's date, or modify the script to auto-generate it.

## Detection Criteria

### Title Similarity
- Fuzzy match at 80%+ threshold
- Examples: "Docker Setup" ≈ "Docker setup notes" ≈ "Setting up Docker"

### Content Similarity
- 50%+ content overlap (excluding YAML frontmatter)
- Code blocks ignored (they legitimately repeat across notes)

### Scan Scope

**Excluded:** `Daily/`, `Templates/`, `00-Inbox/`, `.obsidian/`

**Included:** `ORM 🧑‍🎓/`, `Knowledge Base 🧠/`, `Left of the Dev 👨‍💻/`, `Home 🏡/`, `People 👥/`, `Projects 🛠️/`, `CRL Work 🛠️/`, root-level files

## Report Format

The report is generated as a markdown file with:
- **Duplicate groups** — notes with 50%+ content overlap, with merge/review/cross-link recommendations
- **Similar titles** — 80%+ title similarity but different content
- **Empty/near-empty notes** — under 20 words, candidates for deletion
- **Statistics** — total scanned, groups found, notes flagged

## Manual Detection (Without Script)

If running without the Python script, scan the included directories and:
1. Compare note titles using fuzzy matching
2. Compare note bodies (strip frontmatter and code blocks first)
3. Generate report in the same format to `00-Inbox/`

## After Detection

- Review each duplicate group in the report
- For high-overlap groups (80%+): merge into a single canonical note
- For moderate overlap (50-70%): add cross-links or review manually
- For similar titles: verify they cover different aspects
- Check empty notes for deletion candidates
