#!/bin/bash
# skill-rebalance.sh — 按 skill-track.tsv 的 count 重算 Top-30
# 由 cron 每天凌晨 4 点调用（配合 session_reset）
# Usage: bash ~/.hermes/scripts/skill-rebalance.sh [--dry-run]

set -euo pipefail

TSV="$HOME/.hermes/skill-track.tsv"
CONFIG="$HOME/.hermes/config.yaml"
DRY_RUN="${1:-}"

if [ ! -f "$TSV" ]; then
    echo "ERROR: $TSV not found"
    exit 1
fi

# Age all counts: multiply by 0.85 (gradual decay)
python3 << PYEOF
import os

tsv_path = os.path.expanduser("$TSV")

with open(tsv_path) as f:
    lines = f.readlines()

new_lines = [lines[0], lines[1]]
for line in lines[2:]:
    if not line.strip():
        new_lines.append(line)
        continue
    parts = line.strip().split("\t")
    if len(parts) >= 4:
        name = parts[0]
        count = int(parts[1])
        last_used = parts[2]
        pinned = parts[3]
        if pinned == "true":
            new_count = count
        elif count > 0:
            new_count = max(1, int(count * 0.85))
        else:
            new_count = 0
        new_lines.append(f"{name}\t{new_count}\t{last_used}\t{pinned}\n")

with open(tsv_path, "w") as f:
    f.writelines(new_lines)

print(f"TSV: aged ({len([l for l in new_lines if l.strip() and not l.startswith('#')])} skills)")
PYEOF

# Read aged TSV, extract ONLY skills with count > 0 → these are the active ones
ACTIVE=$(tail -n +3 "$TSV" | grep -v '^$' | awk -F'\t' '$2 > 0 {print}')
ACTIVE_COUNT=$(echo "$ACTIVE" | grep -c . || echo 0)
TOP30=$(echo "$ACTIVE" | sort -t$'\t' -k2 -rn | head -30 | cut -f1)
ALL_NAMES=$(tail -n +3 "$TSV" | grep -v '^$' | cut -f1)

echo "Skills with count>0: $ACTIVE_COUNT"

if [ "$DRY_RUN" = "--dry-run" ]; then
    echo "=== DRY RUN: Active skills (count>0) ==="
    echo "$ACTIVE" | sort -t$'\t' -k2 -rn | nl
    exit 0
fi

# Convert to JSON for Python
TOP30_JSON=$(echo "$TOP30" | python3 -c "import sys,json; lines=[l.strip() for l in sys.stdin if l.strip()]; print(json.dumps(lines))")
ALL_JSON=$(echo "$ALL_NAMES" | python3 -c "import sys,json; lines=[l.strip() for l in sys.stdin if l.strip()]; print(json.dumps(lines))")

# Build new disabled list and update config
python3 << PYEOF
import re, json, os

config_path = os.path.expanduser("$CONFIG")
top30 = set(json.loads("""$TOP30_JSON"""))
all_names = json.loads("""$ALL_JSON""")

to_disable = sorted([s for s in all_names if s not in top30])
to_enable = sorted(top30)

with open(config_path) as f:
    content = f.read()

# Build new YAML disabled block
if to_disable:
    yaml_items = "\n".join(f"  - {s}" for s in to_disable)
    new_block = f"  disabled:\n{yaml_items}"
else:
    new_block = "  disabled: []"

# Replace old disabled block
new_content = re.sub(
    r'  disabled:.*?(?=\n^\S|\Z)',
    new_block,
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open(config_path, "w") as f:
    f.write(new_content)

print(f"Rebalanced: {len(to_enable)} enabled, {len(to_disable)} disabled")
if to_enable:
    print(f"Active: {', '.join(to_enable)}")
PYEOF
