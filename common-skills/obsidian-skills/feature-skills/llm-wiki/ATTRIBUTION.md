# Attribution

## Conceptual

- **[Andrej Karpathy — LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)**
  Persistent-artifact model: cross-references already resolved, contradictions pre-flagged, synthesis reflects all inputs. Knowledge compounds.

## Distribution pattern

- **[AgriciDaniel/claude-obsidian](https://github.com/AgriciDaniel/claude-obsidian)** — 10-skill multi-agent wiki companion. Reference for `.claude-plugin/ + AGENTS.md + CLAUDE.md + GEMINI.md` layout.
- **[heyitsnoah/claudesidian](https://github.com/heyitsnoah/claudesidian)** — Canonical-source-plus-symlinks pattern (`.agents/skills/` + links into `.claude/skills/`).
- **[amtiYo/agents](https://github.com/amtiYo/agents)** — Single source of truth across Codex, Claude Code, Gemini CLI, Cursor, Copilot, Antigravity.
- **[FrancyJGLisboa/agent-skill-creator](https://github.com/FrancyJGLisboa/agent-skill-creator)** — Auto-detection installer pattern (14+ tools).

## Tools used

- **[qmd](https://www.npmjs.com/package/qmd)** — Quick Markdown Search. Powers the `query` and `manage` verbs via BM25 + vector hybrid search.
- **[Obsidian](https://obsidian.md/)** — Host application for the vault.

## Agent Skills spec

This repo follows the emerging [Agent Skills specification](https://agents.md/) (AGENTS.md + SKILL.md frontmatter conventions).
