# CLAUDE.md — claude-wiki-verbs

Project guide for Claude Code. This repo is a **distributable skill package** — the 9-verb wiki engine.

## Invocation

After `./install.sh`, the skill is symlinked at `~/.claude/skills/wiki/`. Invoke via:
- `/wiki` slash command (if registered)
- Natural language: "ingest this", "search vault for X", "synthesize a page on Y", etc.

## Structure

- `skills/wiki/SKILL.md` — router (277 lines, 9-verb routing table)
- `skills/wiki/refs/*.md` — 9 verb playbooks (lazy-loaded)
- `skills/wiki/references/*.md` — scaffold templates (modes, css, frontmatter, etc.)
- `skills/wiki/TEMPLATES/` — Gold In frontmatter spec

## Maintenance

Edit `skills/wiki/**` in this repo. Changes are live across all tools (symlink propagation).

Never edit via the symlinked path (`~/.claude/skills/wiki/`) — it breaks the single source of truth.

## Vault Path

Installer substitutes `${VAULT_ROOT}` with your actual Obsidian vault path. To change:

```bash
./install.sh --vault /new/path
```

## QMD Integration

`query` and `manage` verbs use [qmd](https://www.npmjs.com/package/qmd) for BM25 + vector search. Without qmd, they fall back to `find` + `grep`.

Reindex after bulk changes:
```bash
qmd update && qmd embed
```
