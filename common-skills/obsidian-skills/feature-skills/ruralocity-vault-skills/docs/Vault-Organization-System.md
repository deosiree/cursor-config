# Vault Organization System

A comprehensive guide to organizing and maintaining your Obsidian vault using a three-zone system designed to prevent duplication and maintain clarity.

## Table of Contents
1. [System Overview](#system-overview)
2. [Three Zones](#three-zones)
3. [Quick Capture Workflow](#quick-capture-workflow)
4. [Weekly Review Ritual](#weekly-review-ritual)
5. [Finding Duplicates](#finding-duplicates)
6. [Navigation Tips](#navigation-tips)
7. [Templates](#templates)
8. [Automation](#automation)
9. [Maintenance Schedule](#maintenance-schedule)

---

## System Overview

This vault organization system is built on three core principles:

1. **Capture Everything Quickly** - Don't let friction stop you from capturing ideas
2. **Review Regularly** - Weekly reviews keep the system clean and functional
3. **Consolidate Knowledge** - Build canonical notes that become your single source of truth

The system uses a three-zone approach that mimics natural information lifecycle: Capture, Active Work, and Reference.

---

## Three Zones

### Zone 1: Capture (00-Inbox)

**Purpose:** Frictionless capture of all incoming information

**What goes here:**
- Quick notes and ideas
- Content to process later
- Items you're not sure where to file yet
- Temporary information dumps

**Key principle:** Low friction - just get it in here, organize it during weekly review

**Location:** `/00-Inbox/`

### Zone 2: Active Work

**Purpose:** Information you're actively working with

**What goes here:**
- Current projects
- Work in progress
- Active learning materials
- Topics you're currently engaged with

**Examples:**
- `Projects 🛠️/` - Active projects
- `CRL Work 🛠️/` - Current work-related items
- `ORM 🧑‍🎓/` - Active learning
- `Left of the Dev 👨‍💻/` - Development topics

**Key principle:** These are living documents you reference and update frequently

### Zone 3: Reference (Knowledge Base)

**Purpose:** Long-term, consolidated knowledge

**What goes here:**
- Canonical notes (single source of truth on topics)
- Completed project summaries
- Refined insights
- Stable reference material

**Location:** `Knowledge Base 🧠/` (or similar reference directories)

**Key principle:** Information here should be polished, consolidated, and permanent

---

## Quick Capture Workflow

The goal is to minimize friction when capturing information:

### Step 1: Capture to Inbox
1. Create new note in `00-Inbox/`
2. Use the Inbox Note template (optional but helpful)
3. Add basic information - don't worry about perfection
4. Tag as needed for easy retrieval

### Step 2: Don't Over-Think It
- Don't spend time deciding where it "should" go
- Don't format extensively
- Don't worry about duplicates yet
- Just capture and move on

### Step 3: Trust the System
- Weekly review will handle organization
- Duplicate detection will find similar content
- You'll have time to properly file and refine

---

## Weekly Review Ritual

The weekly review is the engine that keeps the system running. It should take 15-30 minutes.

### Before You Start

Generate a briefing to guide your review:
- Ask Claude: "Generate my weekly review briefing"
- Or follow `/scripts/weekly-review-briefing.md`
- Creates snapshot of current vault state

### The Four Steps

#### Step 1: Process Inbox (5-10 min)

**Goal:** Empty the inbox

Actions for each item:
- **File** - Move to appropriate active folder
- **Merge** - Combine with existing similar note
- **Extract** - Create/update canonical note
- **Delete** - Remove if no longer relevant

#### Step 2: Review Recent Daily Notes (5-10 min)

**Goal:** Extract important insights

Look for:
- Insights that came up multiple times
- Information worth preserving
- Topics that need canonical notes

#### Step 3: Check for New Duplicates (3-5 min)

**Goal:** Prevent duplication from spreading

- Review notes created this week
- Run duplicate detection if needed
- Consolidate similar content

#### Step 4: Maintain One Canonical Note (5 min)

**Goal:** Gradually improve your reference library

Pick one canonical note to:
- Add new insights
- Consolidate related information
- Improve organization
- Update links

### After the Review

- Update weekly stats
- Note what worked well
- Identify improvements for next week

---

## Finding Duplicates

Duplicate content naturally accumulates. The system helps you find and consolidate it.

### Running Duplicate Detection

1. **Manual Process** (follow `/scripts/find-duplicates.md`):
   - Ask Claude to search for similar content
   - Claude will analyze titles, content, and context
   - Review the generated report

2. **When to Run**:
   - Monthly for general maintenance
   - During weekly review if you suspect duplicates
   - After importing content from other systems
   - When a topic feels scattered

### Handling Duplicates

When you find duplicates, choose the best approach:

**Option 1: Merge**
- Combine into the most complete note
- Delete the redundant copy
- Update any links

**Option 2: Create Canonical Note**
- Use Canonical Note template
- Consolidate all variations
- Link from active notes to canonical
- Archive or delete originals

**Option 3: Keep Separate (If Justified)**
- Different contexts may warrant separate notes
- Add cross-references
- Note why they're separate

---

## Navigation Tips

### Quick Links in Home.md

Your `Home.md` file contains quick links to:
- Inbox for processing
- Daily notes
- Recently modified notes
- Key directories

### Search Strategies

**Find recent notes:**
- `created:7d` - Notes created in last 7 days
- `modified:3d` - Notes modified in last 3 days

**Find unprocessed items:**
- Search in `00-Inbox/`
- Look for notes without tags
- Check for "TODO" or "PROCESS"

**Find canonical notes:**
- Browse `Knowledge Base 🧠/`
- Search for `#canonical` tag
- Look for "Canonical" in title

### Daily Notes

- Located in `/Daily/`
- Create daily for journaling and quick capture
- Review during weekly review for insights to extract

---

## Templates

The system provides templates to maintain consistency:

### Inbox Note Template

**Location:** `/Templates/Inbox Note.md`

**Use when:** Creating quick capture notes

**Contains:**
- Basic metadata (created date, status)
- Source field
- Tags section
- Processing notes area

### Weekly Review Template

**Location:** `/Templates/Weekly Review.md`

**Use when:** Performing weekly review

**Contains:**
- Four-step review process
- Checklists for each step
- Stats tracking
- Reflection prompts

### Canonical Note Template

**Location:** `/Templates/Canonical Note.md`

**Use when:** Creating definitive reference notes

**Contains:**
- Clear title and purpose
- Related topics section
- Consolidated content area
- Source tracking
- Last updated metadata

---

## Automation

### Scripts Available

#### Find Duplicates Script

**Location:** `/scripts/find-duplicates.md`

**Purpose:** Detect and consolidate duplicate content

**How to use:**
1. Read the script instructions
2. Ask Claude to search for duplicates
3. Review the generated report
4. Consolidate as needed

**Frequency:** Monthly or as needed

#### Weekly Review Briefing Script

**Location:** `/scripts/weekly-review-briefing.md`

**Purpose:** Generate weekly review preparation document

**How to use:**
1. Ask Claude: "Generate my weekly review briefing"
2. Review the generated briefing
3. Use it to guide your weekly review

**Frequency:** Weekly, before review

### Future Automation Ideas

- Auto-tag inbox items by content
- Link suggestion between related notes
- Automatic canonical note identification
- Statistics dashboard generation

---

## Maintenance Schedule

### Daily (2-5 minutes)
- [ ] Create daily note
- [ ] Quick captures to inbox as needed
- [ ] No filing required - trust the system

### Weekly (15-30 minutes)
- [ ] Generate weekly review briefing
- [ ] Complete four-step review process
- [ ] Process inbox to zero
- [ ] Extract insights from daily notes
- [ ] Check for duplicates
- [ ] Improve one canonical note

### Monthly (30-45 minutes)
- [ ] Run full duplicate detection
- [ ] Review canonical notes structure
- [ ] Archive completed projects
- [ ] Clean up tags
- [ ] Assess what's working and what's not

### Quarterly (1-2 hours)
- [ ] Deep review of entire vault structure
- [ ] Refactor folder organization if needed
- [ ] Update templates based on learning
- [ ] Improve automation scripts
- [ ] Set goals for next quarter

---

## Tips for Success

### Start Small
- Don't try to reorganize everything at once
- Begin with consistent weekly reviews
- Let the system prove itself

### Trust the Process
- Inbox is meant to fill up
- Duplicates are normal
- Weekly reviews handle everything

### Adapt as Needed
- This is a starting framework
- Modify to fit your workflow
- Document changes in your Home.md

### Use Claude as Your Assistant
- Generate briefings
- Find duplicates
- Suggest consolidations
- Answer questions about the system

---

## Troubleshooting

**Problem:** Inbox is overwhelming

**Solution:**
- Don't skip weekly reviews
- Process oldest items first
- Batch similar items together
- Set a timer and do what you can

**Problem:** Too many duplicates

**Solution:**
- Run duplicate detection
- Create canonical notes for common topics
- Use search before creating new notes
- Link liberally instead of duplicating

**Problem:** Can't find things

**Solution:**
- Improve use of tags
- Create more canonical notes
- Use Home.md for key links
- Search by date when needed

**Problem:** System feels too complex

**Solution:**
- Focus on just the inbox workflow
- Skip steps that don't add value for you
- Simplify templates
- Ask Claude for help

---

## Related Documentation

- [Quick Reference Guide](./Quick-Reference.md) - Cheat sheet for common tasks
- [Implementation Plan](./plans/2026-02-12-vault-organization-implementation.md) - How the system was built
- [Design Document](./plans/2026-02-12-vault-organization-design.md) - Why the system works this way

---

*Last Updated: February 13, 2026*
