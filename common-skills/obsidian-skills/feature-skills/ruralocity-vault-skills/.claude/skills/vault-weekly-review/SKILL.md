---
name: vault-weekly-review
description: Use when generating a weekly review briefing, preparing for weekly review, checking vault activity, reviewing inbox status, or when the user asks about recent vault activity
---

# Weekly Review Briefing

## Overview

Generates a comprehensive briefing document to support the weekly vault review process. Scans the vault for inbox items, recent activity, daily notes, and system health.

## When to Use

- User asks to "generate weekly review briefing" or "prepare for weekly review"
- User asks "what happened this week" or "show vault activity"
- User wants to check inbox status or recent notes
- Before completing the Weekly Review template

## Information to Gather

### 1. Inbox Status
- Count items in `00-Inbox/`
- List unprocessed items (oldest first)

### 2. Recent Notes (Past 7 Days)
- Notes created/modified in the past 7 days
- Organized by directory
- Exclude daily notes from this list

### 3. Daily Notes This Week
- All daily notes from the past 7 days
- Listed chronologically

### 4. Canonical Notes Status
- Total count of canonical/reference notes
- Recently added or modified canonical notes

### 5. System Health
- Notes that may need attention
- Orphaned files or anomalies

## Output Format

Generate the briefing as:

```markdown
# Weekly Review Briefing
Generated: [Date and Time]

## Inbox Status
- Total items: [count]
- Items to process:
  - [filename] (created: [date])

## Recent Activity (Past 7 Days)
### Notes Created/Modified
- **[Directory]/**
  - [filename]

## Daily Notes This Week
- [date] - [filename]

## Canonical Notes
- Total canonical notes: [count]
- Recently added:
  - [filename]

## System Health
- [Any observations or items needing attention]

---
Next steps: Use this briefing to complete your weekly review template.
```

## Execution Steps

1. Scan `00-Inbox/` for items and count
2. Find recently modified files across the vault (past 7 days)
3. List daily notes from `Daily/` for the past 7 days
4. Check canonical/reference note status
5. Note any anomalies (orphaned files, broken links if detectable)
6. Compile into the briefing format above
7. Present to the user (do not write to a file unless asked)

## After the Briefing

The user should:
- Copy the briefing into their weekly review note
- Use it as a guide for processing inbox items
- Reference it while completing the Weekly Review template (`Templates/Weekly Review.md`)
