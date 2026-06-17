# AGENTS.md — claude-wiki-verbs

Entry point for **Codex CLI · Antigravity · Gemini CLI · any AGENTS.md-compatible agent**.

## Primary Skill

All agent logic lives in `skills/wiki/SKILL.md`. Read it on demand — do not eagerly load.

**Vault path**: `${VAULT_ROOT}` (set via `install.sh` or export env var).

## Verb Routing (lazy load)

When the user invokes any of the following, read the matching `skills/wiki/refs/<verb>.md`:

| Trigger (en / ko) | Verb | Ref file |
|---|---|---|
| "ingest", "수집", "이거 추가" | ingest | `skills/wiki/refs/ingest.md` |
| "what do you know about X", "검색", "찾아" | query | `skills/wiki/refs/query.md` |
| "save this", "저장" | save | `skills/wiki/refs/save.md` |
| "lint", "헬스체크" | lint | `skills/wiki/refs/lint.md` |
| "reindex", "qmd update" | manage | `skills/wiki/refs/manage.md` |
| "synthesize", "합성", "총정리" | synthesize | `skills/wiki/refs/synthesize.md` |
| "critique", "비판", "모순" | critique | `skills/wiki/refs/critique.md` |
| "compare", "A vs B" | compare | `skills/wiki/refs/compare.md` |
| "ELI5", "쉽게 설명" | eli5 | `skills/wiki/refs/eli5.md` |

## Core Rules

1. **4-Tier search chain** (query verb): 20_Wiki → 30_Claude → 10_Raw (manual) → external web (last)
2. **Gold In Soft filter** (ingest verb): 5 required fields, auto-suggest when missing
3. **Output storage**: `20_Wiki/**` for knowledge artifacts, `30_Claude/**` for collaboration records
4. **Wikilinks**: verify target exists via `find ${VAULT_ROOT} -iname "X*.md"` before writing `[[X]]`. If missing, write plain text.
5. **After save**: run `qmd update && qmd embed` (manage verb handles this automatically)

## Tools Required

- Read, Write, Edit, Glob, Grep, Bash (standard agent toolkit)
- Optional: `qmd` CLI (install: `npm i -g qmd`) for Tier 1-2 semantic search

## Vault Sanity Check

Before any wiki operation, confirm `${VAULT_ROOT}` is set and points to a valid Obsidian vault (has `10_Raw/`, `20_Wiki/`, `30_Claude/` or ask the user to run `./install.sh`).
