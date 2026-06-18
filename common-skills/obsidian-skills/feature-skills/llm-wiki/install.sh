#!/usr/bin/env bash
# claude-wiki-verbs installer
# Detects AI coding tools, symlinks skill, prompts for vault path, installs qmd.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CANONICAL="$REPO_ROOT/skills/wiki"

UNINSTALL=0
VAULT_OVERRIDE=""
FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --uninstall) UNINSTALL=1; shift ;;
    --vault) VAULT_OVERRIDE="$2"; shift 2 ;;
    --force)  FORCE=1; shift ;;
    -h|--help)
      echo "Usage: ./install.sh [--uninstall] [--vault /path/to/vault] [--force]"
      echo "  --force   Overwrite existing real skill dirs (default: back them up first)"
      exit 0 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

# Color helpers
red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }
blue()  { printf '\033[34m%s\033[0m\n' "$*"; }
dim()   { printf '\033[2m%s\033[0m\n' "$*"; }

# Tool detection targets
declare -A TARGETS=(
  [claude]="$HOME/.claude/skills/wiki"
  [antigravity]="$HOME/.antigravity/skills/wiki"
  [codex]="$HOME/.codex/skills/wiki"
  [gemini]="$HOME/.gemini/skills/wiki"
)

declare -A PARENTS=(
  [claude]="$HOME/.claude"
  [antigravity]="$HOME/.antigravity"
  [codex]="$HOME/.codex"
  [gemini]="$HOME/.gemini"
)

# ─── UNINSTALL ─────────────────────────────────────────────────────────────
if [[ $UNINSTALL -eq 1 ]]; then
  blue "Removing symlinks..."
  for tool in "${!TARGETS[@]}"; do
    link="${TARGETS[$tool]}"
    if [[ -L "$link" ]]; then
      rm "$link" && green "  ✓ removed $link"
    fi
  done
  green "✅ Uninstall complete. Vault and qmd index preserved."
  exit 0
fi

# ─── DETECT + SYMLINK ──────────────────────────────────────────────────────
blue "📦 claude-wiki-verbs installer"
echo
blue "Step 1/4: Detecting AI tools..."

linked_count=0
backup_ts="$(date +%Y%m%d-%H%M%S)"

for tool in "${!TARGETS[@]}"; do
  parent="${PARENTS[$tool]}"
  link="${TARGETS[$tool]}"
  if [[ -d "$parent" ]]; then
    mkdir -p "$(dirname "$link")"

    if [[ -L "$link" ]]; then
      # Existing symlink — safe to replace
      rm "$link"
    elif [[ -d "$link" ]]; then
      # Real dir with user content — back up unless --force
      if [[ $FORCE -eq 1 ]]; then
        red "  ⚠  $link is a real directory. --force given, deleting."
        rm -rf "$link"
      else
        backup="${link}.backup-${backup_ts}"
        mv "$link" "$backup"
        green "  ↩  backed up existing $link → $backup"
      fi
    fi

    ln -s "$CANONICAL" "$link"
    green "  ✓ $tool → $link"
    linked_count=$((linked_count + 1))
  else
    dim "  · $tool not detected (skip)"
  fi
done

if [[ $linked_count -eq 0 ]]; then
  red "⚠  No AI tools detected. Install Claude Code, Antigravity, Codex, or Gemini CLI first."
  exit 1
fi

# Cursor adapter (optional — .mdc format required)
if [[ -d "$HOME/.cursor" ]] || [[ -f "$REPO_ROOT/../.cursorrules" ]]; then
  dim "  · Cursor detected — manual step: copy skills/wiki/SKILL.md into .cursor/rules/wiki.mdc"
fi

# ─── VAULT PATH ────────────────────────────────────────────────────────────
echo
blue "Step 2/4: Vault path"

if [[ -n "$VAULT_OVERRIDE" ]]; then
  VAULT="$VAULT_OVERRIDE"
else
  read -rp "  Obsidian vault path (Enter = $REPO_ROOT/vault): " VAULT
  VAULT="${VAULT:-$REPO_ROOT/vault}"
fi

VAULT="${VAULT/#\~/$HOME}"  # expand tilde

if [[ ! -d "$VAULT" ]]; then
  echo "  Vault doesn't exist. Copy VAULT_TEMPLATE? (y/n)"
  read -r CREATE
  if [[ "$CREATE" =~ ^[Yy]$ ]]; then
    cp -r "$REPO_ROOT/VAULT_TEMPLATE" "$VAULT"
    green "  ✓ Vault scaffold created at $VAULT"
  else
    red "  Aborted. Point --vault at an existing vault."
    exit 1
  fi
fi

# Export VAULT_ROOT to user's shell rc (idempotent — won't duplicate)
# This keeps canonical skill files clean (no sed-in-place); bash expands
# ${VAULT_ROOT} at runtime in commands like `find ${VAULT_ROOT} -iname ...`.
RC_LINE="export VAULT_ROOT=\"$VAULT\"  # claude-wiki-verbs"
for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if [[ -f "$rc" ]]; then
    if grep -qF "claude-wiki-verbs" "$rc"; then
      # Update existing line in place
      sed -i "s|^export VAULT_ROOT=.*claude-wiki-verbs|$RC_LINE|" "$rc"
      green "  ✓ updated VAULT_ROOT in $rc"
    else
      printf '\n# claude-wiki-verbs\n%s\n' "$RC_LINE" >> "$rc"
      green "  ✓ exported VAULT_ROOT to $rc"
    fi
  fi
done
green "  Note: re-source your shell (\"source ~/.bashrc\") or open a new terminal to pick up VAULT_ROOT"
export VAULT_ROOT="$VAULT"  # available for the qmd step below in this session

# ─── QMD (optional) ────────────────────────────────────────────────────────
echo
blue "Step 3/4: qmd (semantic search — optional)"

if ! command -v npm >/dev/null; then
  red "  npm not found. Install Node.js to enable qmd."
  dim "  Skipping qmd setup. query/manage verbs will use find+grep fallback."
elif ! command -v qmd >/dev/null; then
  echo "  Install qmd now? (y/n)"
  read -r INSTALL_QMD
  if [[ "$INSTALL_QMD" =~ ^[Yy]$ ]]; then
    npm install -g qmd
  else
    dim "  Skipped. Install later with: npm i -g qmd"
  fi
fi

if command -v qmd >/dev/null; then
  green "  ✓ qmd available — registering vault collection"
  qmd collection add vault "$VAULT" --pattern "**/*.md" 2>/dev/null || dim "  (collection may already exist)"
  blue "  Running initial index..."
  qmd update
  qmd embed
  green "  ✓ qmd index ready"
fi

# ─── DONE ──────────────────────────────────────────────────────────────────
echo
green "✅ Install complete."
echo
blue "Linked tools: $linked_count"
blue "Vault:        $VAULT"
blue "Canonical:    $CANONICAL"
echo
dim "Try it out:"
dim "  • Claude Code:  type '/wiki' or 'what do I know about X?'"
dim "  • Codex/Antigravity: the agent reads AGENTS.md automatically"
echo
dim "Uninstall:  ./install.sh --uninstall"
