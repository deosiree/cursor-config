# claude-wiki-verbs

**9-verb knowledge engine for Obsidian vaults.** Karpathy LLM Wiki pattern, pure markdown prompts, zero code dependencies.

Works with **Claude Code · Antigravity · Codex · Gemini CLI · Cursor** via symlink distribution. Drop it in once, use everywhere.

---

## What You Get

9 verbs unified under `/wiki` — 2,600+ lines of lazy-loaded playbook:

| Verb | Role | Example |
|---|---|---|
| `ingest` | External source → Raw + Gold In filter | "ingest this paper" |
| `query` | 4-Tier vault search chain | "what do I know about X?" |
| `save` | 6-area routing + wikilink validation | "save this as design note" |
| `lint` | Structure check (FATAL/MAJOR/MINOR/POLISH) | "vault health check" |
| `manage` | qmd update/embed/status | "reindex vault" |
| `synthesize` | Compiler — many files → one compiled page | "compile everything on X" |
| `critique` | Runner — contradiction/stale/gap detection | "find inconsistencies" |
| `compare` | 5-dimension matrix comparison | "A vs B" |
| `eli5` | 6-section plain explanation | "explain like I'm a student" |

**Persistent artifact**: cross-references already resolved, contradictions already flagged, synthesis reflects all inputs. Knowledge compounds.

---

## Install

Two paths — pick the one that fits.

### Path A — Full setup (recommended)

```bash
git clone https://github.com/daniel8824-del/claude-wiki-verbs ~/repos/claude-wiki-verbs
cd ~/repos/claude-wiki-verbs
./install.sh
```

Handles everything:
1. Detects installed tools (Claude Code / Antigravity / Codex / Gemini CLI) and symlinks `skills/wiki/` into each
2. Prompts for Obsidian vault path, exports `VAULT_ROOT` to your shell rc (`~/.bashrc` / `~/.zshrc`) — the canonical skill files stay clean; Bash expands `${VAULT_ROOT}` at runtime
3. Offers to copy `VAULT_TEMPLATE/` (6-area scaffold) if the vault dir doesn't exist
4. Offers to install [qmd](https://www.npmjs.com/package/qmd) (`npm i -g qmd`); if available, registers the vault collection and runs initial indexing
5. Cursor users: prints a hint to copy `skills/wiki/SKILL.md` into `.cursor/rules/wiki.mdc` (Cursor needs `.mdc` format, can't use a symlink)

After install, run `source ~/.bashrc` (or open a new terminal) to pick up `VAULT_ROOT`.

Flags: `--vault /path` (skip prompt) · `--force` (overwrite existing real skill dirs without backup) · `--uninstall`

### Path B — Claude Code plugin marketplace (skill files only)

```
/plugin marketplace add daniel8824-del/claude-wiki-verbs
/plugin install claude-wiki-verbs@claude-wiki-verbs-marketplace
```

⚠️ **This path only registers the skill into Claude Code.** It does NOT:
- Substitute `${VAULT_ROOT}` — you must `export VAULT_ROOT=/path/to/your/vault` or sed-replace manually
- Install qmd or run initial indexing
- Copy `VAULT_TEMPLATE/` scaffold
- Symlink into Antigravity / Codex / Gemini CLI

Use Path B only if you're Claude Code-only and comfortable doing the vault + qmd setup yourself.

**One source of truth.** With Path A, editing `skills/wiki/**` propagates to all symlinked tools instantly (no sync step). Existing real `~/.claude/skills/wiki` directories are auto-backed up to `.backup-{timestamp}` before being replaced.

---

## Vault Structure (6-area convention)

`save` and `ingest` route outputs by type:

```
<VAULT_ROOT>/
├── 10_Raw/                    # Layer 1: immutable sources (manual retrieval only)
│   ├── 01_Articles/  02_Books/  03_Videos/  04_Notes/
│   └── 05_Conversations/  06_Research/  07_Scholar/
├── 20_Wiki/                   # Layer 2: compiled knowledge (synthesize outputs)
│   ├── 01_Sources/  02_Entities/  03_Concepts/  04_Comparisons/
│   ├── 05_Questions/  06_Meta/  07_Syntheses/  08_Critiques/  09_ELI5/
└── 30_Claude/                 # Layer 3: collaboration records (auto-searchable)
    ├── 00_Meta/ (index.md, log.md, hot.md)
    ├── 01_Sessions/  02_Learnings/  03_Retros/
    └── 04_Plans/  05_Research/  06_Designs/
```

Scaffold lives in `VAULT_TEMPLATE/` — `install.sh` copies it for you.

---

## 4-Tier Search Chain (query verb)

```
Tier 1 — 20_Wiki (compiled knowledge, automatic first)
         ↓ if sufficient, stop
Tier 2 — 30_Claude (collaboration records, automatic)
         ↓ if insufficient
Tier 3 — 10_Raw (sources, manual only — when user says "raw" or "원본")
         ↓ if still insufficient
Tier 4 — External web (Brave, Firecrawl — last fallback)
```

Score routing:
- **≥0.9** High → full Read + direct quote
- **0.7–0.9** Med-High → summary + "want the full page?"
- **0.5–0.7** Med → title only
- **<0.5** Low → silent skip

---

## Gold In Filter (ingest verb — Soft, 5 fields)

Every ingest must answer 5 questions (auto-suggested if missing):

1. **Why collected** — what pulled you here?
2. **My Take** — what does this mean in your context?
3. **One-line insight** — the single sentence core
4. **Gold Out** — what did you actually get? (asymmetry check vs. "why collected")
5. **Action Intent** — `{action}: {target}` (e.g., `synthesize: harness-wiki §1`)

Spec: `skills/wiki/TEMPLATES/gold-in-frontmatter.md`

---

## Optional: qmd (recommended)

[qmd](https://www.npmjs.com/package/qmd) powers `query` + `manage` verbs — hybrid BM25 + vector search.

**Without qmd**: `query` falls back to `find` + `grep` (works, no score ranking, slower). The other 8 verbs are unaffected.

---

## Cross-Tool Distribution

Canonical source lives at `skills/wiki/`. `install.sh` creates symlinks for every detected tool:

| Tool | Auto-link target | Notes |
|---|---|---|
| Claude Code | `~/.claude/skills/wiki/` | symlink |
| Antigravity | `~/.antigravity/skills/wiki/` | symlink |
| Codex CLI | `~/.codex/skills/wiki/` | symlink + repo-root `AGENTS.md` is the entry point |
| Gemini CLI | `~/.gemini/skills/wiki/` | symlink + repo-root `GEMINI.md` |
| Cursor | (manual) `.cursor/rules/wiki.mdc` | Cursor's `.mdc` format requires copy, not symlink |

Pattern credit: [heyitsnoah/claudesidian](https://github.com/heyitsnoah/claudesidian), [amtiYo/agents](https://github.com/amtiYo/agents), [AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian).

---

## Uninstall

```bash
./install.sh --uninstall
```

Removes symlinks only. Your vault, qmd index, and any backed-up `*.backup-{timestamp}` dirs are preserved.

---

## Troubleshooting

**`qmd: command not found` after install** — `npm i -g qmd` writes to your npm prefix. Check `npm config get prefix` is on `$PATH`. Re-run `./install.sh` after fixing.

**Wikilinks render as plain text** — `save` and `synthesize` verbs validate `[[X]]` targets via `find ${VAULT_ROOT} -iname "X*.md"` before writing. If the file doesn't exist, they fall back to plain text intentionally (avoids broken links).

**Vault path contains spaces** — Quote it: `./install.sh --vault "/path/with spaces/vault"`.

**My Claude Code skill stopped working after install** — The installer backs up your previous `~/.claude/skills/wiki/` to `.backup-{timestamp}` before symlinking. Restore with: `mv ~/.claude/skills/wiki.backup-* ~/.claude/skills/wiki`.

**Want to skip qmd entirely** — Just answer `n` at the install prompt. `query` and `manage` will use `find` + `grep` fallback (slower, no score ranking, but functional). The other 7 verbs are unaffected.

---

## Attribution

Inspired by:
- [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)
- [AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian) — multi-tool distribution layout reference

See `ATTRIBUTION.md` for full credits.

---

## License

MIT — see `LICENSE`.
