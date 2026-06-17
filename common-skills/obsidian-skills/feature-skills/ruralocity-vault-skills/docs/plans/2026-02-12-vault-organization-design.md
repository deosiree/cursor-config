# Obsidian Vault Organization System Design

**Date:** 2026-02-12
**Status:** Approved
**Problem:** Duplicate and overlapping content scattered across ~1,952 notes, with no systematic process for consolidation and maintenance.

## Overview

This design establishes a sustainable system for organizing an Obsidian vault that has grown organically over several years. The approach balances an initial cleanup phase with an ongoing weekly maintenance ritual that prevents future disorganization.

## Goals

- **Primary:** Eliminate duplicate and overlapping content through consolidation into canonical notes
- **Secondary:** Establish a "quick capture to proper home" workflow
- **Ongoing:** Maintain organization with a manageable 15-30 minute weekly review

## Success Criteria

1. Can find information quickly when needed
2. Not creating duplicate notes anymore - new info goes to the right place
3. Weekly review is happening regularly and feels manageable
4. Vault feels less cluttered
5. Canonical notes are trustworthy single sources of truth

## Architecture

### Three Zones

**1. Capture Zone** (`00-Inbox/`)
- Where new notes land when destination is unclear
- Gets emptied during weekly review
- Low friction - just capture the idea

**2. Active Zone** (Daily notes, project notes, work folders)
- Time-bound information and active work
- Natural overlap and duplication is acceptable here
- Daily notes: `Daily/YYYY-MM-DD.md`
- Work projects: `ORM 🧑‍🎓/[project-name]/`
- Personal projects: `Projects 🛠️/`, `Home 🏡/`, etc.

**3. Reference Zone** (`Knowledge Base 🧠/`)
- Canonical notes - single source of truth for important concepts
- Curated, consolidated, maintained
- Linked from daily/project notes rather than duplicating content

### Information Flow

```
New Idea/Information
    ↓
[Is it time-bound?] → YES → Daily Note
    ↓ NO
[Know where it goes?] → YES → Create in proper folder
    ↓ NO
Inbox (process weekly)
    ↓
Weekly Review
    ↓
[Important enough for canonical note?] → YES → Knowledge Base
    ↓ NO
File to appropriate folder
```

## Phase 1: One-Time Audit (Initial Cleanup)

Break into 3-4 sessions of 30-45 minutes each.

### Session 1: Automated Duplicate Detection
- Run Claude Code script to scan for:
  - Notes with similar titles
  - Notes with significant content overlap (>50% similarity)
- Generate report in `00-Inbox/Duplicate-Detection-Report-[DATE].md`
- Review report and mark notes for consolidation

### Session 2: Root Directory Cleanup
- Review 22 files currently in root directory
- For each file, decide:
  - **Move** to proper folder (most common)
  - **Merge** into existing note
  - **Delete** if obsolete
  - **Keep** if it's a true index/home page (like `Home.md`)
- Exception: `CLAUDE.md` stays in root (it's documentation)

### Session 3: Inbox Processing
- Process `TickTick dump.md` - extract relevant tasks, delete the dump
- Handle `Obsidian cleanup prompt.md` - archive or delete (task complete)
- File any other inbox items to proper homes

### Session 4: First Consolidation Pass
- Using duplicate report from Session 1, merge obvious duplicates
- Create first 3-5 canonical notes for topics that clearly need them
- Examples: Docker setup, Rails testing, deployment procedures

### Output
- Root directory organized (only intentional index files remain)
- Inbox clear
- 3-5 canonical notes established as examples
- Obvious duplicates consolidated

## Phase 2: Quick Capture Workflow

### Three Capture Paths

**Path 1: Time-Bound Information → Daily Note**
- Use for: Meeting notes, daily observations, time-specific events
- Goes directly into today's daily note
- Use existing template sections:
  - `## action needed`
  - `## schedule`
  - `## in progress`
  - `## notes`

**Path 2: Quick Capture → Inbox**
- Use for: Sudden ideas, unclear destination, needs processing
- Create note in `00-Inbox/` with descriptive title
- Add `#to-process` tag
- Gets filed during weekly review

**Path 3: Known Destination → Direct Creation**
- Use for: Clear topic with known location
- Create directly in proper folder
- **Important:** Search first to avoid creating duplicate

### Implementation
- Root directory becomes "off limits" for new notes
- Set up templater hotkey for quick inbox notes (optional)
- Inbox note template includes:
  - Creation date
  - `#to-process` tag
  - Prompt: "Destination folder?"

## Weekly Review Ritual (15-30 Minutes)

**When:** Same time each week (e.g., Friday afternoon, Sunday evening)

### Step 1: Process Inbox (5-10 min)
- Review each note in `00-Inbox/`
- For each note, choose:
  - **File** to proper folder (most common)
  - **Merge** into existing note
  - **Extract** to canonical note in Knowledge Base
  - **Delete** if no longer relevant
- Goal: Empty inbox

### Step 2: Review Recent Daily Notes (5-10 min)
- Skim past week's daily notes
- Look for:
  - Insights that came up multiple times
  - Information worth preserving beyond the daily note
  - Topics that might need canonical notes
- When found:
  - Create/update canonical note in Knowledge Base
  - Link from daily note to canonical note
  - Optional: Add `#extracted` tag to mark processed content

### Step 3: Check for New Duplicates (3-5 min)
- Review notes created this week
- Search for similar existing notes
- If writing about same topic repeatedly → signal to create canonical note

### Step 4: Maintain One Canonical Note (5 min)
- Pick one canonical note to improve
- Add new insights, consolidate information, improve organization
- Slowly builds reference library without overwhelming

### Tools
- Create `Templates/Weekly Review.md` with checklist
- Use search: `created:7d` to find recent notes
- Set recurring reminder for review time

## Canonical Notes Strategy

### Definition
A canonical note is the single authoritative source for a topic. Other notes link to it rather than duplicating information.

### When to Create One
Create a canonical note when ANY of these are true:
- Topic appears in 3+ different notes
- You search for this information repeatedly
- It's a procedure that needs to stay current
- It's a concept important to your work or thinking

### Location
- Primary: `Knowledge Base 🧠/` (organize by topic)
- Optional: Create `Knowledge Base 🧠/Canonical/` subfolder for distinction

### Structure Template
```markdown
# [Clear Topic Title]

[2-3 sentence summary of key points]

## [Main Section 1]
[Content]

## [Main Section 2]
[Content]

## Troubleshooting / Common Issues
[If applicable]

## Related Notes
- [[Link to related note 1]]
- [[Link to related note 2]]

#canonical #topic-tag #domain-tag
```

### The Consolidation Process
1. Identify duplicate/overlapping content during weekly review
2. Create or update canonical note with consolidated information
3. Update original locations to link to canonical note
4. Optional: Add note like "→ See [[Canonical Note]]" in original locations

## Automated Tooling

### Duplicate Detection
**Tool:** Claude Code scripts
**Frequency:** Monthly or on-demand

**Detects:**
- Title similarity (fuzzy matching)
- Content similarity (>50% overlap)

**Output:** Report in `00-Inbox/` with:
- Grouped potential duplicates
- Similarity scores
- Links for easy review

### Weekly Review Support
**Generate briefing showing:**
- Number of notes in inbox
- Notes created in past 7 days
- Links to past week's daily notes

### Navigation Aids
- Use waypoint plugin for auto-generated folder indexes
- Update `Home.md` with quick links:
  - Today's daily note
  - Inbox (with item count)
  - Key canonical notes
  - Weekly review template

### Monthly Maintenance
- Run duplicate detection report
- Review and delete empty notes
- Verify canonical notes are current and properly linked

## Plugins Utilized

**Already Installed:**
- `templater-obsidian` - Quick capture templates
- `waypoint` - Auto-generate folder indexes
- `calendar` - Navigate daily notes
- `obsidian-auto-link-title` - Auto-fetch titles for URLs

**Consider Adding:**
- None required - current plugins support the system

## Implementation Approach

**Incremental, not big bang:**
1. Complete Phase 1 sessions over 1-2 weeks (one session every few days)
2. Establish weekly review habit before adding complexity
3. Build canonical notes gradually as needs emerge
4. Let the system prove itself before major structural changes

**Not changing:**
- Daily note template (working well)
- Main folder structure (ORM 🧑‍🎓/, Knowledge Base 🧠/, etc.)
- Obsidian plugins currently in use

## Open Questions / Future Considerations

- Should we create a `Knowledge Base 🧠/Canonical/` subfolder or keep canonical notes mixed with other knowledge notes?
- Would a simple dashboard note (updated weekly) showing vault health metrics be useful?
- Should we establish conventions for when to delete old daily notes vs. keeping them forever?

## References

- Current vault structure: See `CLAUDE.md`
- Templates: `Templates/Daily note.md`, `Templates/Work project notes.md`
- Inbox location: `00-Inbox/`
