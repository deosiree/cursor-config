# Vault Consolidation Detection Skill — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a Claude Code skill that discovers groups of related notes in the Obsidian vault that could be consolidated into single canonical documents.

**Architecture:** A single `SKILL.md` file in `.claude/skills/vault-consolidation-detection/` that instructs Claude how to scan vault folders, identify consolidation candidates using multiple signals (title patterns, wiki-links, shared tags, note size), and interactively present groups for user review and consolidation.

**Tech Stack:** Claude Code skill (markdown documentation). No scripts or code — Claude-native analysis only.

**Process:** This follows the writing-skills TDD cycle: RED (baseline test without skill) → GREEN (write skill) → REFACTOR (close loopholes).

---

### Task 1: Design Baseline Pressure Scenario

**Files:**
- Create: `docs/plans/2026-02-26-consolidation-baseline-scenario.md`

**Step 1: Write the pressure scenario document**

Create a scenario prompt that will be used to test Claude's behavior both WITHOUT and WITH the skill. The scenario should:

- Ask Claude to "find notes in the vault that could be collapsed into single documents"
- Specify a folder scope (e.g., `Knowledge Base 🧠/` or `ORM 🧑‍🎓/`)
- NOT mention the skill by name
- Be realistic — something the user would actually say

Write this scenario:

```markdown
# Baseline Pressure Scenario — Vault Consolidation Detection

## Scenario Prompt

"I'd like to find notes in my Knowledge Base that could be collapsed or consolidated
into single documents. Can you look for groups of small, related notes that would be
better as sections of one comprehensive note?"

## What to Observe

When running this scenario WITHOUT the skill, document:
1. Does Claude scan systematically or ad-hoc?
2. Does Claude use multiple signals (titles, tags, links, size) or just one?
3. Does Claude present results in a structured, reviewable format?
4. Does Claude offer to consolidate, or just list findings?
5. Does Claude ask about scope, or assume?
6. Does Claude require 2+ signals before flagging a group, or flag on any single match?
7. Does Claude rank results by strength?
8. Does Claude include safety guardrails (no auto-delete, confirm before changes)?

## Success Criteria (for WITH-skill test)

The skill is working if Claude:
- [x] Asks user which folders to scan (configurable scope)
- [x] Inventories files extracting title, tags, links, word count, folder
- [x] Uses ALL FOUR signals: title prefixes, mutual links, shared tags+folder, small size clusters
- [x] Requires 2+ signals before flagging a group
- [x] Ranks groups by signal strength (strongest first)
- [x] Presents each group using the structured format (signal strength, notes list with summaries, why consolidate, suggested structure)
- [x] Offers three choices per group: Consolidate now / Skip / Not related
- [x] On consolidation: uses Canonical Note template, merges content, preserves links, asks about source note handling
- [x] Never deletes files without confirmation
- [x] Presents summary at the end
```

**Step 2: Verify the scenario is clear and testable**

Read the scenario back. Every item in "What to Observe" should be binary (did/didn't). Every item in "Success Criteria" should be verifiable from the subagent's output.

---

### Task 2: Run Baseline Test (RED)

**Step 1: Launch a subagent WITHOUT the skill**

Use the Task tool to launch a subagent with the scenario prompt. The subagent should NOT have access to the consolidation detection skill. Use a prompt like:

```
You are helping a user maintain their Obsidian vault at /Users/asumner/Documents/Vault.

The user says: "I'd like to find notes in my Knowledge Base that could be collapsed
or consolidated into single documents. Can you look for groups of small, related
notes that would be better as sections of one comprehensive note?"

Scan the Knowledge Base 🧠/ folder and identify consolidation candidates.
Present your findings to the user.
```

**Important:** Use `subagent_type: "general-purpose"` so it has file access but NOT the skill.

**Step 2: Document baseline behavior**

After the subagent returns, record its behavior against every item in "What to Observe" from the scenario document. Write the findings into the scenario doc under a new `## Baseline Results` section.

Note exact rationalizations or shortcuts the agent took — these become the gaps the skill must fill.

**Step 3: Verify RED — confirm gaps exist**

The baseline should show at least some of these gaps:
- No systematic multi-signal approach
- No structured presentation format
- No configurable scope prompt
- No 2-signal minimum threshold
- No ranking by strength
- No consolidation action with template usage

If the baseline is surprisingly good, the skill may need less content. If it's poor, the skill needs more.

---

### Task 3: Write the Skill (GREEN)

**Files:**
- Create: `.claude/skills/vault-consolidation-detection/SKILL.md`

**Step 1: Create the skill directory**

```bash
mkdir -p .claude/skills/vault-consolidation-detection
```

**Step 2: Write SKILL.md**

Write the skill addressing the specific gaps identified in baseline testing. The skill should follow the structure of the existing vault skills (vault-duplicate-detection, vault-weekly-review) for consistency.

Required sections based on the design:

```markdown
---
name: vault-consolidation-detection
description: Use when searching for notes that could be consolidated into single documents, finding fragmented topics, running vault maintenance to identify merge candidates, or when the user mentions collapsing or combining related notes
---

# Vault Consolidation Detection

## Overview

Discovers groups of related notes that would be better served as sections of a single
comprehensive document. Unlike duplicate detection (which finds overlapping content),
this finds notes with *different* content about *related* sub-topics.

## When to Use

- User asks to "find notes to consolidate" or "collapse related notes"
- During weekly/monthly vault maintenance
- Before creating canonical notes — find which notes should merge
- When the user mentions fragmented knowledge or too many small notes

## Process

### Step 1: Determine Scope

Ask the user which folders to scan. Offer these options:
- Specific folder(s) the user names
- All vault (excluding Daily/, Templates/, 00-Inbox/, .obsidian/)
- Default: same exclusions as duplicate detection

### Step 2: Inventory

Read all markdown files in the scoped folders. For each file, extract:
- **Title** (filename without .md)
- **Tags** (from YAML frontmatter `tags:` field)
- **Wiki-links** (outgoing `[[links]]`)
- **Word count** (body text, excluding frontmatter and code blocks)
- **Folder path**

Flag notes under ~300 words as "small."

### Step 3: Identify Consolidation Groups

Cluster notes using these signals (strongest first):

1. **Title prefix patterns** — Notes sharing a common prefix of 2+ words
   (e.g., "Atlas API", "Atlas Auth", "Atlas Errors" share "Atlas")
2. **Mutual wiki-links** — 3+ notes that link to each other
3. **Shared tags + same folder** — Notes with identical tags in the same directory
4. **Small size cluster** — Related notes all under 300 words

**IMPORTANT:** A group needs AT LEAST 2 signals to be flagged. Single-signal matches
are too noisy.

### Step 4: Rank Groups

- More signals = higher rank
- More notes in group = higher rank
- All-small-notes groups get a ranking boost
- Present strongest groups first

### Step 5: Interactive Review

Present each group one at a time using this format:

~~~
### Group: [Suggested Canonical Title]
**Signal strength:** [Strong/Moderate] — [which signals matched]
**Notes in group:**
- `path/to/note1.md` (120 words) — [1-line summary of content]
- `path/to/note2.md` (85 words) — [1-line summary of content]
- `path/to/note3.md` (210 words) — [1-line summary of content]

**Why consolidate:** [Why these belong together as one document]
**Suggested structure:** [Section outline for the merged note]
~~~

Ask the user to choose:
- **Consolidate now** — proceed to create the canonical note
- **Skip** — move to next group
- **Not related** — dismiss this group entirely

### Step 6: Consolidation (when user approves)

1. Create the canonical note using `Templates/Canonical Note.md` template
2. Place in `Knowledge Base 🧠/` unless user specifies another folder
3. Merge content from source notes into logical sections, deduplicating any overlap
4. Add the `canonical` tag
5. Search for incoming wiki-links to any source note and update them to point
   to the new canonical note
6. Ask the user what to do with source notes:
   - **Delete** the originals
   - **Keep as stubs** with a redirect: `> See [[Canonical Note Title]]`

### Step 7: Summary

After reviewing all groups, present:
- Total groups found
- Groups consolidated
- Groups skipped
- Groups dismissed as not related

## Safety Guardrails

- NEVER delete files without explicit user confirmation
- NEVER move notes without asking
- NEVER modify notes outside the scanned scope
- Always show what will change before making changes

## Relationship to Other Skills

- **vault-duplicate-detection:** Finds notes with *overlapping content* (same thing
  said twice). This skill finds notes with *different content* about *related topics*
  (fragments of a bigger picture).
- **vault-weekly-review:** The weekly review prompts manual consolidation. This skill
  automates the *discovery* of candidates.
```

**Step 3: Verify skill structure**

Check that:
- YAML frontmatter has only `name` and `description`
- Description starts with "Use when..."
- Description does NOT summarize the workflow (per CSO rules)
- No special characters in name (only letters, numbers, hyphens)
- Sections match the existing vault skill patterns

---

### Task 4: Run Skill Test (GREEN verification)

**Step 1: Launch a subagent WITH the skill**

Use the Task tool to launch a subagent that has the skill content injected into its prompt. Use the same scenario as baseline:

```
You are helping a user maintain their Obsidian vault at /Users/asumner/Documents/Vault.

[INJECT THE FULL SKILL.MD CONTENT HERE]

The user says: "I'd like to find notes in my Knowledge Base that could be collapsed
or consolidated into single documents. Can you look for groups of small, related
notes that would be better as sections of one comprehensive note?"

Scan the Knowledge Base 🧠/ folder and identify consolidation candidates.
Present your findings to the user.
```

**Step 2: Verify GREEN — skill gaps are closed**

Compare the subagent's behavior against every item in the "Success Criteria" checklist from the scenario doc. Every item should now pass.

**Step 3: Document results**

Add a `## GREEN Test Results` section to the scenario doc with pass/fail for each criterion.

If any criterion fails, go back to Task 3 and revise the skill before proceeding.

---

### Task 5: Close Loopholes (REFACTOR)

**Step 1: Identify new rationalizations**

Review the GREEN test results. Look for:
- Did the agent take any shortcuts not covered by the skill?
- Did it interpret any instruction ambiguously?
- Did it skip any step or merge steps together?
- Did it present results in a different format than specified?

**Step 2: Revise the skill**

For each loophole found:
- Add explicit instruction to prevent the shortcut
- Clarify any ambiguous wording
- Add to a "Common Mistakes" section if pattern-worthy

**Step 3: Re-test**

Run the subagent test again (same as Task 4) to verify the revisions close the loopholes without breaking anything that was passing.

**Step 4: Final commit**

Once the skill passes all criteria with no loopholes:

```bash
git add .claude/skills/vault-consolidation-detection/SKILL.md
git commit -m "feat: add vault-consolidation-detection skill

Detects groups of related notes that could be consolidated into
single canonical documents using multi-signal analysis (title
prefixes, mutual wiki-links, shared tags, note size)."
```

---

### Task 6: Update CLAUDE.md and Related Docs

**Files:**
- Modify: `CLAUDE.md`
- Modify: `docs/Quick-Reference.md`

**Step 1: Add skill to CLAUDE.md skills list**

In the `### Skills (Claude Code)` section of `CLAUDE.md`, add:

```markdown
- **vault-consolidation-detection** - Find groups of related notes that could be consolidated into single documents
```

**Step 2: Add to Quick-Reference.md**

Add the skill to the common commands or maintenance section of Quick-Reference.md so users know it exists.

**Step 3: Commit documentation updates**

```bash
git add CLAUDE.md docs/Quick-Reference.md
git commit -m "docs: add vault-consolidation-detection to skill references"
```

---

### Task 7: Clean Up Test Artifacts

**Files:**
- Delete or archive: `docs/plans/2026-02-26-consolidation-baseline-scenario.md`

**Step 1: Decide on test artifact retention**

The baseline scenario doc was useful for testing but isn't needed long-term. Either:
- Delete it (test artifacts served their purpose)
- Move it to a `docs/plans/archive/` folder if you want to keep test history

**Step 2: Final commit if needed**

```bash
git add -u
git commit -m "chore: clean up consolidation skill test artifacts"
```
