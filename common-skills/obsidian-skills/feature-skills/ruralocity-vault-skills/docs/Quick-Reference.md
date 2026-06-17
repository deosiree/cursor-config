# Vault Organization Quick Reference

A quick cheat sheet for common tasks in your vault organization system.

---

## Creating Notes

### Quick Capture (Inbox Note)

```markdown
# [Title]

**Created:** {{date}}
**Status:** Unprocessed
**Source:** [Where this came from]

## Tags
#inbox

## Content
[Your content here]

## Processing Notes
- [ ] Review and file
```

### Canonical Note

```markdown
# [Topic Name]

> Single source of truth for [topic]

## Related Topics
- [[Related Note 1]]
- [[Related Note 2]]

## Overview
[Core information about this topic]

## Key Points
- Point 1
- Point 2

## Details
[Detailed information]

## Sources
- [Source 1]
- Created from: [[Original Note]]

---
*Last Updated: {{date}}*
```

---

## Weekly Review Steps

### Quick Checklist

1. **Generate Briefing** (1 min)
   - Ask Claude: "Generate my weekly review briefing"

2. **Process Inbox** (5-10 min)
   - Review each item in `00-Inbox/`
   - File, merge, extract, or delete

3. **Review Daily Notes** (5-10 min)
   - Check last 7 daily notes
   - Extract recurring insights

4. **Check Duplicates** (3-5 min)
   - Review new notes: `created:7d`
   - Consolidate if needed

5. **Improve One Canonical** (5 min)
   - Pick one note in `Knowledge Base 🧠/`
   - Add insights, improve organization

---

## Common Searches

### Time-Based

```
created:7d          # Created in last 7 days
created:30d         # Created in last 30 days
modified:3d         # Modified in last 3 days
modified:1w         # Modified in last week
```

### Location-Based

```
path:"00-Inbox"               # All inbox items
path:"Knowledge Base 🧠"      # Canonical notes
path:"Daily"                  # Daily notes
path:"Projects 🛠️"           # Active projects
```

### Content-Based

```
tag:#inbox                    # Tagged as inbox
tag:#canonical                # Canonical notes
"TODO"                        # Contains TODO
file:(.md)                    # All markdown files
```

### Combined Searches

```
path:"00-Inbox" created:30d   # Inbox items from last month
tag:#inbox -tag:#processed    # Unprocessed inbox items
path:"Daily" modified:7d      # Recent daily notes
```

---

## Running Scripts

### Find Duplicates

**Option 1: Ask Claude**
```
"Search for duplicate notes in my vault"
"Find notes with similar content"
"Run duplicate detection"
```

**Option 2: Follow Script**
1. Open `/scripts/find-duplicates.md`
2. Follow the instructions
3. Review generated report
4. Consolidate as needed

**When to run:** Monthly or when suspected

### Weekly Review Briefing

**Ask Claude:**
```
"Generate my weekly review briefing"
"Create a briefing for weekly review"
"Show me this week's vault activity"
```

**Output includes:**
- Inbox status
- Recent activity
- Daily notes list
- Canonical notes count
- System health check

**When to run:** Weekly, before review

### Find Consolidation Candidates

**Ask Claude:**
```
"Find notes that could be consolidated"
"Look for related notes to collapse into single documents"
"Search for consolidation candidates in Knowledge Base"
```

**Output includes:**
- Groups of related notes ranked by signal strength
- Per-group review: consolidate, skip, or dismiss
- Automatic canonical note creation on approval

**When to run:** Monthly or during vault maintenance

---

## Templates List

| Template | Location | Use For |
|----------|----------|---------|
| Inbox Note | `/Templates/Inbox Note.md` | Quick captures |
| Weekly Review | `/Templates/Weekly Review.md` | Weekly reviews |
| Canonical Note | `/Templates/Canonical Note.md` | Reference notes |

### Using Templates in Obsidian

1. Open command palette (`Cmd+P` or `Ctrl+P`)
2. Type "Template"
3. Select "Insert template"
4. Choose the template you need

---

## Canonical Notes Guide

### When to Create a Canonical Note

Create one when:
- You have multiple notes on the same topic
- Information is scattered across vault
- You reference a topic frequently
- A concept appears in multiple projects

### How to Create

1. Use Canonical Note template
2. Give it a clear, searchable title
3. Consolidate information from sources
4. Link to related topics
5. Note where information came from
6. Place in `Knowledge Base 🧠/`

### Maintaining Canonical Notes

- Update during weekly reviews
- Add new insights as you learn
- Keep it as single source of truth
- Link to it from other notes
- Don't duplicate its content elsewhere

---

## File Organization Quick Guide

### Where Things Go

**00-Inbox/** → Everything new (temporary)
**Projects 🛠️/** → Active project work
**CRL Work 🛠️/** → Current work items
**Knowledge Base 🧠/** → Canonical/reference notes
**Daily/** → Daily notes and journals
**Templates/** → Note templates
**scripts/** → Automation helpers
**docs/** → System documentation

### Decision Tree

```
Is it new/unprocessed?
├─ YES → 00-Inbox/
└─ NO ↓

Is it actively being worked on?
├─ YES → Active Work folders (Projects, Work, etc.)
└─ NO ↓

Is it reference/permanent knowledge?
├─ YES → Knowledge Base 🧠/
└─ NO ↓

Is it a daily journal entry?
├─ YES → Daily/
└─ NO → Ask Claude for help
```

---

## Maintenance Schedule

### Daily
- Create daily note as needed
- Quick captures to inbox
- No organization required

### Weekly (15-30 min)
- Generate briefing
- Process inbox to zero
- Review daily notes
- Check for duplicates
- Improve one canonical note

### Monthly (30-45 min)
- Run full duplicate detection
- Review canonical notes
- Archive completed work
- Clean up tags

### Quarterly (1-2 hours)
- Deep vault review
- Refactor if needed
- Update templates
- Assess and improve system

---

## Common Commands for Claude

### Navigation & Search
```
"Show me recent notes"
"What's in my inbox?"
"List my daily notes from this week"
"Find notes about [topic]"
```

### Organization
```
"Help me process my inbox"
"Where should I file this note?"
"Find duplicates for [note name]"
"Consolidate notes about [topic]"
```

### Automation
```
"Generate weekly review briefing"
"Run duplicate detection"
"Create a canonical note for [topic]"
"Show me vault statistics"
```

### System Help
```
"How do I [task]?"
"Explain the weekly review process"
"What are canonical notes?"
"Help me get started with the system"
```

---

## Quick Tips

### Capture
- Don't overthink where things go initially
- Use inbox liberally
- Add tags for easy retrieval later
- Trust the weekly review to organize

### Search
- Use time filters to narrow results
- Combine path and content searches
- Search before creating new notes
- Use tags consistently

### Consolidate
- One topic = one canonical note
- Link instead of duplicating
- Update canonical notes regularly
- Delete redundant copies

### Maintain
- Weekly reviews are essential
- Process inbox to zero weekly
- Improve one thing each review
- Monthly duplicate detection

---

## Troubleshooting

**Can't find a note:**
- Check `00-Inbox/` first
- Search by creation date
- Look in `Daily/` notes
- Ask Claude to search

**Inbox is full:**
- Don't skip weekly reviews
- Process oldest items first
- Use timer (5 min bursts)
- Ask Claude for help

**Too many duplicates:**
- Run duplicate detection
- Create canonical notes
- Search before creating
- Link more, duplicate less

**System feels complex:**
- Start with just inbox workflow
- Add weekly reviews when ready
- Customize to your needs
- Ask Claude for guidance

---

## Key Links

- [Full System Guide](./Vault-Organization-System.md)
- [Implementation Plan](./plans/2026-02-12-vault-organization-implementation.md)
- [Home Page](../Home.md)
- [Scripts](../scripts/scripts.md)

---

*Last Updated: February 13, 2026*
