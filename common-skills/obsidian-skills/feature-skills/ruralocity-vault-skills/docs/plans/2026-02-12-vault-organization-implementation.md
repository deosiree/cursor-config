# Vault Organization System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform a disorganized Obsidian vault with ~1,952 notes into a well-organized system with canonical notes, clear capture workflow, and sustainable weekly maintenance.

**Architecture:** Three-zone system (Capture/Active/Reference) with automated duplicate detection, manual curation workflows, and weekly maintenance ritual.

**Tech Stack:** Obsidian (markdown), Claude Code (automation), templater plugin (templates), waypoint plugin (indexes)

---

## Task 1: Create Duplicate Detection Automation

**Files:**
- Create: `scripts/find-duplicates.md`

**Step 1: Create the duplicate detection instructions**

Create a markdown file that Claude Code can use to scan for duplicates. This will serve as a prompt/script for finding duplicate content.

```markdown
# Duplicate Detection Instructions

This document provides instructions for Claude Code to detect duplicate and overlapping notes in the vault.

## Detection Criteria

### Title Similarity
- Find notes with similar titles using fuzzy matching
- Examples: "Docker Setup", "Docker setup notes", "Setting up Docker"
- Threshold: 80% similarity or higher

### Content Similarity
- Find notes with significant content overlap
- Compare note bodies (excluding YAML frontmatter)
- Threshold: 50% or more similar content
- Ignore code blocks in similarity calculation (they may legitimately appear in multiple notes)

## Scan Scope

**Exclude from scanning:**
- `Daily/` folder (daily notes expected to have some overlap)
- `Templates/` folder
- `00-Inbox/` folder (will be processed separately)
- `.obsidian/` folder

**Include in scanning:**
- `ORM 🧑‍🎓/` and all subdirectories
- `Knowledge Base 🧠/`
- `Left of the Dev 👨‍💻/`
- `Home 🏡/`
- `People 👥/`
- `Projects 🛠️/`
- `CRL Work 🛠️/`
- Root directory files

## Output Format

Generate a report in `00-Inbox/Duplicate-Detection-Report-YYYY-MM-DD.md` with this structure:

```markdown
# Duplicate Detection Report

Generated: [DATE]
Notes scanned: [COUNT]
Potential duplicate groups found: [COUNT]

---

## Group 1: [Topic Name]

**Similarity:** [XX]% content overlap

**Notes in this group:**
1. [[Path/To/Note1.md]] - [Brief description or first line]
2. [[Path/To/Note2.md]] - [Brief description or first line]
3. [[Path/To/Note3.md]] - [Brief description or first line]

**Recommendation:** [Merge into single canonical note / Keep separate with cross-links / Review manually]

**Action:** [ ] Reviewed

---

## Group 2: [Topic Name]

...

---

## Similar Titles (No significant content overlap)

These notes have similar titles but different content. Verify they're not duplicates:

- [[Note A]] and [[Note B]] (85% title similarity)
- [[Note C]] and [[Note D]] (82% title similarity)

---

## Empty or Near-Empty Notes

These notes have little to no content and may be candidates for deletion:

- [[Empty Note 1.md]] - 0 words
- [[Stub Note 2.md]] - 15 words

---

## Statistics

- Total notes scanned: XXX
- Duplicate groups found: XX
- Notes flagged as potentially duplicate: XX
- Empty notes: XX
```

## Execution

To run this detection:
1. Read this file
2. Scan the vault according to the criteria above
3. Generate the report in the specified location
4. Notify the user when complete
```

**Step 2: Verify the script file was created**

Check that the file exists:
```bash
ls -la scripts/find-duplicates.md
```

Expected: File exists and is readable

---

## Task 2: Create Weekly Review Template

**Files:**
- Create: `Templates/Weekly Review.md`

**Step 1: Create the weekly review checklist template**

```markdown
# Weekly Review - {{date}}

**Duration:** 15-30 minutes
**Frequency:** Weekly (same time each week)

---

## Step 1: Process Inbox (5-10 min)

**Goal:** Empty the inbox

- [ ] Review all notes in `00-Inbox/`
- [ ] For each note, choose action:
  - [ ] File to proper folder
  - [ ] Merge into existing note
  - [ ] Extract to canonical note
  - [ ] Delete if no longer relevant

**Inbox count at start:** ___
**Inbox count at end:** ___

---

## Step 2: Review Recent Daily Notes (5-10 min)

**Goal:** Extract important insights to canonical notes

- [ ] Skim daily notes from the past week
- [ ] Look for:
  - [ ] Insights that came up multiple times
  - [ ] Information worth preserving beyond daily notes
  - [ ] Topics that might need canonical notes

**Daily notes reviewed:**
- [ ] {{date:YYYY-MM-DD}}
- [ ] {{date:YYYY-MM-DD|-1}}
- [ ] {{date:YYYY-MM-DD|-2}}
- [ ] {{date:YYYY-MM-DD|-3}}
- [ ] {{date:YYYY-MM-DD|-4}}
- [ ] {{date:YYYY-MM-DD|-5}}
- [ ] {{date:YYYY-MM-DD|-6}}

**Insights extracted:** ___

---

## Step 3: Check for New Duplicates (3-5 min)

**Goal:** Prevent new duplication

- [ ] Review notes created this week using search: `created:7d`
- [ ] For each new note, verify no similar note exists
- [ ] If duplicate topic found, consolidate or create canonical note

**Notes created this week:** ___
**Duplicates found:** ___

---

## Step 4: Maintain One Canonical Note (5 min)

**Goal:** Gradually improve reference library

- [ ] Pick one canonical note to improve
- [ ] Add new insights
- [ ] Consolidate information
- [ ] Improve organization
- [ ] Update links

**Canonical note updated:** [[___]]

---

## Weekly Stats

- Inbox items processed: ___
- Notes filed: ___
- Notes merged: ___
- Canonical notes created/updated: ___
- Time spent: ___ minutes

---

## Notes & Reflections

What worked well this week:
-

What could be improved:
-

Topics that need canonical notes:
-

---

## Next Week's Focus

- [ ]
```

**Step 2: Verify the template was created**

Check that the file exists:
```bash
ls -la "Templates/Weekly Review.md"
```

Expected: File exists and is readable

---

## Task 3: Create Inbox Note Template

**Files:**
- Create: `Templates/Inbox Note.md`

**Step 1: Create the inbox note template**

```markdown
---
created: {{date:YYYY-MM-DD}}
tags:
  - to-process
---

# {{title}}

## Destination Folder?

Possible homes:
- `Knowledge Base 🧠/` - Reference/canonical information
- `ORM 🧑‍🎓/` - Work-related notes
- `Projects 🛠️/` - Personal projects
- `Home 🏡/` - Home/personal life
- `Left of the Dev 👨‍💻/` - Technical blog posts
- Other: ___

## Content

[Your content here]

## Related Notes

Might be related to:
- [[]]

## Processing Notes

Next action:
- [ ] File to folder
- [ ] Merge into existing note: [[]]
- [ ] Create canonical note
- [ ] Delete (no longer relevant)
```

**Step 2: Verify the template was created**

Check that the file exists:
```bash
ls -la "Templates/Inbox Note.md"
```

Expected: File exists and is readable

---

## Task 4: Create Canonical Note Template

**Files:**
- Create: `Templates/Canonical Note.md`

**Step 1: Create the canonical note template**

```markdown
---
created: {{date:YYYY-MM-DD}}
updated: {{date:YYYY-MM-DD}}
tags:
  - canonical
---

# {{title}}

> **Summary:** [2-3 sentence summary of key points]

---

## Overview

[Introduction to the topic]

## Main Content

### [Section 1]

[Content]

### [Section 2]

[Content]

## Common Issues / Troubleshooting

[If applicable]

## Examples

[If applicable]

## Related Notes

**See also:**
- [[Related Note 1]]
- [[Related Note 2]]

**Referenced in:**
- [[Note that links here 1]]
- [[Note that links here 2]]

---

**Last updated:** {{date:YYYY-MM-DD}}
```

**Step 2: Verify the template was created**

Check that the file exists:
```bash
ls -la "Templates/Canonical Note.md"
```

Expected: File exists and is readable

---

## Task 5: Session 1 - Run Duplicate Detection

**Files:**
- Read: `scripts/find-duplicates.md`
- Create: `00-Inbox/Duplicate-Detection-Report-{{date}}.md`

**Step 1: Read the duplicate detection instructions**

```bash
cat scripts/find-duplicates.md
```

Expected: Instructions are clear and complete

**Step 2: Scan the vault for duplicate notes**

Using the criteria from `scripts/find-duplicates.md`:
1. Scan all markdown files except excluded folders
2. Compare titles using fuzzy matching (80% threshold)
3. Compare content for significant overlap (50% threshold)
4. Group related duplicates together

**Step 3: Generate the duplicate detection report**

Create report in `00-Inbox/Duplicate-Detection-Report-{{date}}.md` following the format specified in the instructions.

**Step 4: Review the report for completeness**

Check that the report includes:
- Total notes scanned count
- Duplicate groups with similarity scores
- Recommendations for each group
- Similar titles section
- Empty notes section
- Statistics summary

**Step 5: Notify user**

Inform the user that the duplicate detection report is ready for review in the inbox.

---

## Task 6: Session 2 - Root Directory Cleanup

**Files:**
- Review: All `.md` files in root directory (except `CLAUDE.md`)
- Modify: Move files to appropriate folders

**Step 1: List all markdown files in root directory**

```bash
find . -maxdepth 1 -name "*.md" -type f ! -name "CLAUDE.md"
```

Expected: List of ~22 files

**Step 2: Read each file and determine destination**

For each file in the root directory:
1. Read the file to understand its content
2. Determine appropriate destination based on content:
   - Work-related → `ORM 🧑‍🎓/` (possibly specific subdirectory)
   - Technical knowledge → `Knowledge Base 🧠/`
   - Blog post → `Left of the Dev 👨‍💻/`
   - Personal → `Home 🏡/` or `Projects 🛠️/`
   - Index/Home page → Keep in root (like `Home.md`)

**Step 3: Create a filing plan document**

Create `00-Inbox/Root-Directory-Filing-Plan.md` with recommendations:

```markdown
# Root Directory Filing Plan

Generated: {{date}}

## Files to Move

1. `AI agents.md` → `Knowledge Base 🧠/AI agents.md`
   - Content: [Brief description]
   - Reason: Technical knowledge article

2. `Building an O'Reilly product (technical) dev session.md` → `ORM 🧑‍🎓/Dev Sessions/Building an O'Reilly product (technical) dev session.md`
   - Content: [Brief description]
   - Reason: Work-related development session notes

[... continue for all files ...]

## Files to Keep in Root

1. `Home.md` - Main index/navigation page
2. `CLAUDE.md` - Documentation for Claude Code

## Files to Review for Possible Merge

1. `Claude Code concepts.md` + `Claude Code skills.md` → Possibly merge into single note
2. [Any other merge candidates]

## Files to Delete (if obsolete)

1. [Any files that are empty or no longer relevant]

---

## Statistics

- Total files reviewed: XX
- Files to move: XX
- Files to keep: XX
- Files to merge: XX
- Files to delete: XX
```

**Step 4: User reviews and confirms the filing plan**

Present the filing plan to the user for approval before making changes.

Expected: User reviews and approves (possibly with modifications)

**Step 5: Execute the filing plan**

Move files to their designated locations as approved by the user.

For each file:
```bash
mv "File Name.md" "Destination Folder/File Name.md"
```

**Step 6: Verify root directory is clean**

```bash
find . -maxdepth 1 -name "*.md" -type f ! -name "CLAUDE.md"
```

Expected: Only intentional index files remain (like `Home.md`)

---

## Task 7: Session 3 - Inbox Processing

**Files:**
- Review: `00-Inbox/TickTick dump.md`
- Review: `00-Inbox/Obsidian cleanup prompt.md`
- Review: Any other notes in `00-Inbox/`

**Step 1: Count inbox items**

```bash
find "00-Inbox/" -name "*.md" -type f | wc -l
```

Expected: Number of files in inbox

**Step 2: Process TickTick dump**

Read `00-Inbox/TickTick dump.md`:
1. Extract any tasks that are still relevant
2. For each relevant task:
   - Add to appropriate daily note, OR
   - Add to project note, OR
   - Create dedicated note if substantial
3. Delete or archive the dump file

**Step 3: Process Obsidian cleanup prompt**

Read `00-Inbox/Obsidian cleanup prompt.md`:
1. This was the original cleanup prompt - task is now complete
2. Options:
   - Move to `Knowledge Base 🧠/Obsidian cleanup prompt.md` (for reference)
   - Delete (task complete, no longer needed)
3. Execute chosen option

**Step 4: Process remaining inbox items**

For each remaining note in `00-Inbox/`:
1. Read the note
2. Determine action:
   - **File** to proper folder (most common)
   - **Merge** into existing note
   - **Extract** to canonical note if important topic
   - **Delete** if no longer relevant
3. Execute the action

**Step 5: Verify inbox is clean**

```bash
find "00-Inbox/" -name "*.md" -type f | wc -l
```

Expected: 0 or very few files remaining (excluding reports from recent tasks)

---

## Task 8: Session 4 - First Consolidation Pass

**Files:**
- Read: `00-Inbox/Duplicate-Detection-Report-{{date}}.md`
- Modify: Various notes identified in the report
- Create: 3-5 canonical notes in `Knowledge Base 🧠/`

**Step 1: Review the duplicate detection report**

Read the duplicate detection report and prioritize groups for consolidation:
1. Groups with highest similarity scores first
2. Groups where consolidation is clearly beneficial
3. Topics that are referenced frequently

**Step 2: Select first duplicate group to consolidate**

For the first duplicate group:
1. Read all notes in the group
2. Identify the most complete/well-organized note (or decide to create new one)
3. Extract key information from all notes into one canonical note

**Step 3: Create or update canonical note**

Using the `Templates/Canonical Note.md` template:
1. Create new canonical note in `Knowledge Base 🧠/[Topic].md`
2. Consolidate information from all duplicate notes
3. Add proper structure, sections, and tags
4. Include "Related Notes" section linking to original sources

**Step 4: Update original notes with links**

For each original note that was consolidated:
1. Add a prominent link to the canonical note at the top
2. Optional: Add `#consolidated` tag to mark it as processed
3. Example: `> **Note:** This information has been consolidated into [[Canonical Topic Note]]`

**Step 5: Repeat for 2-4 more duplicate groups**

Repeat steps 2-4 for additional duplicate groups until you have:
- 3-5 canonical notes created
- Most obvious duplicates consolidated
- Clear examples of the consolidation pattern

**Step 6: Update the duplicate detection report**

Mark consolidated groups as complete:
- Change `**Action:** [ ] Reviewed` to `**Action:** [x] Reviewed - consolidated into [[Canonical Note]]`

**Step 7: Verify canonical notes are well-formed**

Check each created canonical note:
- Has clear title and summary
- Well-organized sections
- Includes related notes links
- Tagged with `#canonical`

```bash
grep -l "#canonical" "Knowledge Base 🧠/"*.md
```

Expected: 3-5 canonical notes listed

---

## Task 9: Update Home.md with Quick Links

**Files:**
- Modify: `Home.md`

**Step 1: Read the current Home.md**

```bash
cat Home.md
```

Expected: Current content of the home page

**Step 2: Add Quick Links section**

Add or update a "Quick Links" section in `Home.md`:

```markdown
# Home

## Quick Links

**Daily Work:**
- [[{{date:YYYY-MM-DD}}|Today's Daily Note]]
- [00-Inbox](00-Inbox/) ({{inbox-count}} items) ← Process weekly
- [[Templates/Weekly Review|Weekly Review Template]]

**Key Canonical Notes:**
- [[Knowledge Base 🧠/[Topic 1]]]
- [[Knowledge Base 🧠/[Topic 2]]]
- [[Knowledge Base 🧠/[Topic 3]]]
- [All canonical notes](Knowledge%20Base%20%F0%9F%A7%A0/?tag=canonical)

**Work:**
- [ORM Projects](ORM%20%F0%9F%91%A8%E2%80%8D%F0%9F%8E%93/)
- [[Pub Eng spark time ideas (2026)]]

**Personal:**
- [Projects](Projects%20%F0%9F%9B%A0%EF%B8%8F/)
- [Home Notes](Home%20%F0%9F%8F%A1/)

---

[Rest of existing content]
```

Note: Update `[Topic 1]`, `[Topic 2]`, etc. with actual canonical note names created in Task 8.

**Step 3: Verify links work**

Open `Home.md` in Obsidian and click through the links to verify they work correctly.

Expected: All links navigate to correct locations

---

## Task 10: Create Weekly Review Briefing Helper

**Files:**
- Create: `scripts/weekly-review-briefing.md`

**Step 1: Create the weekly review briefing instructions**

```markdown
# Weekly Review Briefing Instructions

This document provides instructions for Claude Code to generate a weekly review briefing.

## Purpose

Generate a briefing document that helps the user quickly understand what needs attention during their weekly review.

## Information to Gather

1. **Inbox Status**
   - Count of notes in `00-Inbox/`
   - List of note titles (not full content)

2. **Recent Notes (Past 7 Days)**
   - List of all notes created in the past 7 days
   - Exclude daily notes and inbox notes
   - Group by folder

3. **Daily Notes from Past Week**
   - List of the past 7 daily notes with links
   - Format: `- [[Daily/YYYY-MM-DD]]`

4. **Canonical Notes Count**
   - Total number of notes tagged with `#canonical`

## Output Format

Generate a briefing in `00-Inbox/Weekly-Review-Briefing-YYYY-MM-DD.md`:

```markdown
# Weekly Review Briefing

**Date:** {{date:YYYY-MM-DD}}
**Review Period:** {{date:YYYY-MM-DD|-7}} to {{date:YYYY-MM-DD}}

---

## Inbox Status

**Items to process:** XX notes

**Notes in inbox:**
1. [[Note Title 1]]
2. [[Note Title 2]]
...

---

## Recent Notes (Past 7 Days)

**Total created:** XX notes (excluding daily notes and inbox)

**By folder:**

### ORM 🧑‍🎓/
- [[New Work Note 1]] - Created {{date}}
- [[New Work Note 2]] - Created {{date}}

### Knowledge Base 🧠/
- [[New KB Article]] - Created {{date}}

### [Other folders with new notes]
...

---

## Daily Notes to Review

- [[Daily/{{date:YYYY-MM-DD}}]]
- [[Daily/{{date:YYYY-MM-DD|-1}}]]
- [[Daily/{{date:YYYY-MM-DD|-2}}]]
- [[Daily/{{date:YYYY-MM-DD|-3}}]]
- [[Daily/{{date:YYYY-MM-DD|-4}}]]
- [[Daily/{{date:YYYY-MM-DD|-5}}]]
- [[Daily/{{date:YYYY-MM-DD|-6}}]]

---

## Canonical Notes

**Total canonical notes:** XX

---

## Ready to Review?

Open [[Templates/Weekly Review]] and start your review!
```

## Execution

To generate the briefing:
1. Read this file
2. Gather the information specified above
3. Generate the briefing in the specified location
4. Notify the user when complete
```

**Step 2: Verify the script file was created**

```bash
ls -la scripts/weekly-review-briefing.md
```

Expected: File exists and is readable

---

## Task 11: Test the Weekly Review Workflow

**Files:**
- Read: `Templates/Weekly Review.md`
- Create: Test weekly review instance

**Step 1: Generate a weekly review briefing**

Run the weekly review briefing script to generate current status:
```bash
# This would invoke Claude Code to execute scripts/weekly-review-briefing.md
```

Expected: Briefing created in `00-Inbox/Weekly-Review-Briefing-{{date}}.md`

**Step 2: Create a weekly review instance**

Copy the template to create this week's review:
```bash
cp "Templates/Weekly Review.md" "00-Inbox/Weekly-Review-{{date}}.md"
```

**Step 3: Walk through Step 1 (Process Inbox)**

Test the inbox processing step:
1. Open the weekly review note
2. Check the briefing for inbox count
3. Process at least 1-2 inbox items
4. Update checkbox in weekly review

Expected: Inbox items successfully processed

**Step 4: Walk through Step 2 (Review Daily Notes)**

Test the daily note review step:
1. Open past week's daily notes (use links in briefing)
2. Skim for important insights
3. If found, extract to a test canonical note or existing note
4. Update checkbox in weekly review

Expected: Daily notes reviewed, any insights extracted

**Step 5: Walk through Step 3 (Check Duplicates)**

Test the duplicate check step:
1. Use Obsidian search: `created:7d`
2. Review recent notes
3. Check if any are duplicates
4. Update checkbox in weekly review

Expected: Recent notes reviewed for duplicates

**Step 6: Walk through Step 4 (Maintain Canonical Note)**

Test the canonical note maintenance step:
1. Pick one of the canonical notes created in Task 8
2. Add a small improvement (better wording, additional link, etc.)
3. Update checkbox in weekly review

Expected: Canonical note improved

**Step 7: Complete the weekly stats**

Fill in the statistics section of the weekly review:
- Inbox items processed
- Notes filed
- Notes merged
- Canonical notes updated
- Time spent

**Step 8: Archive the completed review**

Move the completed review out of inbox:
```bash
mv "00-Inbox/Weekly-Review-{{date}}.md" "Weekly Reviews/Weekly-Review-{{date}}.md"
```

Or create the folder first if it doesn't exist:
```bash
mkdir -p "Weekly Reviews"
mv "00-Inbox/Weekly-Review-{{date}}.md" "Weekly Reviews/Weekly-Review-{{date}}.md"
```

**Step 9: Reflect on the workflow**

Note what worked well and what could be improved. Update the `Templates/Weekly Review.md` if any adjustments are needed.

---

## Task 12: Document the Completed System

**Files:**
- Create: `docs/Vault-Organization-System.md`

**Step 1: Create user-facing documentation**

```markdown
# Vault Organization System

**Last updated:** {{date:YYYY-MM-DD}}

This document describes how this Obsidian vault is organized and maintained.

## The Three Zones

### 1. Capture Zone - `00-Inbox/`

Where new notes land when you're not sure where they belong.

**When to use:**
- Quick ideas that need processing
- Unclear destination
- Need to capture something fast

**Template:** `Templates/Inbox Note.md`

Gets emptied weekly during review.

### 2. Active Zone - Daily & Project Notes

Time-bound information and active work.

**Folders:**
- `Daily/YYYY-MM-DD.md` - Daily notes (auto-created)
- `ORM 🧑‍🎓/` - Work projects and notes
- `Projects 🛠️/` - Personal projects
- `Home 🏡/` - Home and personal life
- Other active work folders

**It's OK to have overlap here** - don't worry about duplicating information in daily/project notes. The important stuff will be extracted to canonical notes over time.

### 3. Reference Zone - `Knowledge Base 🧠/`

Single source of truth for important topics.

**Contains:**
- Canonical notes (tagged `#canonical`)
- Reference articles
- Consolidated knowledge

**When to create a canonical note:**
- Topic appears in 3+ notes
- You search for this info repeatedly
- It's a procedure that needs to stay current
- It's important to your work or thinking

**Template:** `Templates/Canonical Note.md`

## Quick Capture Workflow

When creating a new note, ask: **"Is this time-bound, needs processing, or has a clear home?"**

### Path 1: Time-Bound → Daily Note
Meeting notes, today's tasks, time-specific events → Today's daily note

### Path 2: Needs Processing → Inbox
Unclear destination, sudden ideas → `00-Inbox/` with `#to-process` tag

### Path 3: Clear Home → Direct Creation
You know exactly where this belongs → Create in proper folder
⚠️ Search first to avoid duplicates!

## Weekly Review Ritual

**Time:** 15-30 minutes, same time each week

### Before Starting

1. Generate briefing: Ask Claude Code to run `scripts/weekly-review-briefing.md`
2. Open template: [[Templates/Weekly Review]]
3. Create this week's review in inbox

### The Four Steps

**Step 1: Process Inbox (5-10 min)**
- Review each note in inbox
- File, merge, extract, or delete
- Goal: Empty inbox

**Step 2: Review Daily Notes (5-10 min)**
- Skim past week's daily notes
- Extract important insights to canonical notes
- Link from daily note to canonical note

**Step 3: Check Duplicates (3-5 min)**
- Search: `created:7d`
- Verify no duplicate notes created
- Consolidate if needed

**Step 4: Maintain Canonical Note (5 min)**
- Pick one canonical note
- Add insights, improve organization
- Update links

### After Review

- Complete the stats section
- Move review note to `Weekly Reviews/` folder
- Set reminder for next week

## Finding Duplicates

**On-demand:** Ask Claude Code to run `scripts/find-duplicates.md`

**Frequency:** Monthly or when you suspect duplicates

**Output:** Report in inbox with duplicate groups, similarity scores, and recommendations

## Navigation

**Home Page:** [[Home]]
- Quick links to today, inbox, key canonical notes

**Search Tips:**
- Recent notes: `created:7d`
- Canonical notes: `tag:#canonical`
- To-process: `tag:#to-process`

## Templates

All templates are in `Templates/` folder:

- **Daily note** - Auto-applied to daily notes
- **Work project notes** - For ORM projects
- **Weekly Review** - Weekly maintenance checklist
- **Inbox Note** - Quick capture with filing prompts
- **Canonical Note** - Single source of truth format

## Automation

**Scripts in `scripts/` folder:**

- `find-duplicates.md` - Detect duplicate and overlapping notes
- `weekly-review-briefing.md` - Generate weekly review briefing

**How to run:** Ask Claude Code to execute the script

## Maintenance Schedule

**Weekly:**
- [ ] Generate review briefing
- [ ] Complete weekly review (15-30 min)
- [ ] Empty inbox
- [ ] Extract insights from daily notes
- [ ] Maintain one canonical note

**Monthly:**
- [ ] Run duplicate detection
- [ ] Review and delete empty notes
- [ ] Verify canonical notes are current

**As Needed:**
- [ ] Update Home.md quick links
- [ ] Archive old weekly reviews
- [ ] Clean up obsolete notes

## Folder Index Notes

Some folders have auto-generated index notes (via waypoint plugin). These help navigate folder contents.

To regenerate: Use waypoint command palette in Obsidian.

## Tips

**Avoid Duplication:**
- Search before creating new notes
- Link to canonical notes rather than copying content
- Use weekly review to catch new duplicates

**Build Canonical Notes Gradually:**
- Don't try to create them all at once
- Let patterns emerge naturally
- Create when a topic proves important enough

**Make It Sustainable:**
- Weekly review should feel manageable
- If it's overwhelming, reduce scope
- The system should serve you, not vice versa

## Questions?

See the full design doc: [[docs/plans/2026-02-12-vault-organization-design]]
```

**Step 2: Create quick reference card**

Create `docs/Quick-Reference.md` for common actions:

```markdown
# Vault Organization - Quick Reference

## Creating Notes

| When | Where | How |
|------|-------|-----|
| Time-bound (today's work) | Today's daily note | Open daily note, add to section |
| Unclear destination | `00-Inbox/` | Use `Templates/Inbox Note.md` |
| Know where it goes | Proper folder | ⚠️ Search first! Then create |

## Weekly Review (15-30 min)

1. **Generate briefing** → Ask Claude: "Generate weekly review briefing"
2. **Process inbox** → File, merge, extract, or delete (5-10 min)
3. **Review daily notes** → Extract insights (5-10 min)
4. **Check duplicates** → Search `created:7d` (3-5 min)
5. **Maintain canonical** → Improve one note (5 min)

## Common Searches

```
created:7d          # Notes from past week
tag:#canonical      # All canonical notes
tag:#to-process     # Items needing filing
file:""             # Empty notes
```

## Running Scripts

Ask Claude Code:
- "Run duplicate detection"
- "Generate weekly review briefing"

## Templates

- Daily Note (auto)
- Work Project (`Templates/Work project notes.md`)
- Weekly Review (`Templates/Weekly Review.md`)
- Inbox Note (`Templates/Inbox Note.md`)
- Canonical Note (`Templates/Canonical Note.md`)

## Canonical Notes

**Create when:**
- Topic in 3+ notes
- Search repeatedly
- Needs to stay current
- Important to work

**Location:** `Knowledge Base 🧠/`
**Tag:** `#canonical`
**Template:** `Templates/Canonical Note.md`
```

**Step 3: Update CLAUDE.md with system reference**

Add a section to `CLAUDE.md`:

```markdown
## Vault Organization System

This vault uses a three-zone organization system with automated maintenance.

**Documentation:**
- System overview: `docs/Vault-Organization-System.md`
- Quick reference: `docs/Quick-Reference.md`
- Design doc: `docs/plans/2026-02-12-vault-organization-design.md`

**Key Scripts:**
- `scripts/find-duplicates.md` - Detect duplicate notes
- `scripts/weekly-review-briefing.md` - Generate weekly review briefing

**Weekly Maintenance:**
User performs a 15-30 minute weekly review using `Templates/Weekly Review.md` to process inbox, extract insights, and maintain canonical notes.

**When Helping:**
- Respect the three zones (Capture/Active/Reference)
- Suggest canonical notes for frequently duplicated topics
- Run duplicate detection when requested
- Generate weekly review briefings on request
```

**Step 4: Verify all documentation is complete and accessible**

Check that all documentation files exist:
```bash
ls -la docs/Vault-Organization-System.md
ls -la docs/Quick-Reference.md
ls -la docs/plans/2026-02-12-vault-organization-design.md
ls -la docs/plans/2026-02-12-vault-organization-implementation.md
```

Expected: All files exist and are readable

---

## Completion Checklist

### Phase 1: Setup (Tasks 1-4)
- [x] Task 1: Duplicate detection automation created
- [x] Task 2: Weekly review template created
- [x] Task 3: Inbox note template created
- [x] Task 4: Canonical note template created

### Phase 2: Initial Cleanup (Tasks 5-8)
- [x] Task 5: Duplicate detection report generated
- [x] Task 6: Root directory cleaned up
- [x] Task 7: Inbox processed
- [x] Task 8: First canonical notes created (3-5)

### Phase 3: Workflow Setup (Tasks 9-11)
- [x] Task 9: Home.md updated with quick links
- [x] Task 10: Weekly review briefing helper created
- [x] Task 11: Weekly review workflow tested

### Phase 4: Documentation (Task 12)
- [x] Task 12: System documentation created

### Success Criteria

- [ ] Root directory has <5 files (only intentional index files)
- [ ] Inbox is empty or has <3 items
- [ ] 3-5 canonical notes exist in Knowledge Base
- [ ] Weekly review template tested and working
- [ ] User understands the three-zone system
- [ ] Automation scripts ready to use
- [ ] Documentation complete and accessible

---

## Next Steps

After implementing this plan:

1. **Establish the weekly review habit**
   - Set recurring reminder
   - Do 3-4 weekly reviews to establish pattern
   - Adjust process based on what works

2. **Continue consolidation over time**
   - Run duplicate detection monthly
   - Create canonical notes as topics prove important
   - Don't rush - let the system evolve naturally

3. **Monitor and adjust**
   - Track time spent in weekly stats
   - Note what works and what doesn't
   - Update templates based on experience

4. **Consider future enhancements** (after 4-6 weeks)
   - Dashboard note with vault health metrics?
   - Convention for archiving old daily notes?
   - Additional automation?
