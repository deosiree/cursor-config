#!/bin/bash
# skill-bridge.sh — Hermes SKILL.md → Reasonix .skills/ 桥接
# 把 Hermes skill 同步到指定项目根目录的 .skills/ 下
# 供 Reasonix 的 /skill 命令加载使用
#
# Usage:
#   bash skill-bridge.sh <skill_name> <project_root>
#   bash skill-bridge.sh reasonix-dispatcher /mnt/c/.../repo
#
# 效果：
#   <project_root>/.skills/<skill_name>.md  →  Reasonix /skill <name> 可调用

set -euo pipefail

SKILL_NAME="${1:-}"
PROJECT_ROOT="${2:-}"

if [ -z "$SKILL_NAME" ] || [ -z "$PROJECT_ROOT" ]; then
    echo "Usage: skill-bridge.sh <skill_name> <project_root>"
    echo "Example: skill-bridge.sh reasonix-dispatcher /mnt/c/.../repo"
    exit 1
fi

# 查找 Hermes skill 目录（优先 ~/.hermes/skills/，回退 ~/.cc-switch/skills/）
HERMES_SKILL=""
for base in "$HOME/.hermes/skills" "$HOME/.cc-switch/skills"; do
    found=$(find "$base" -maxdepth 2 -type d -name "$SKILL_NAME" 2>/dev/null | head -1)
    if [ -n "$found" ] && [ -f "$found/SKILL.md" ]; then
        HERMES_SKILL="$found"
        break
    fi
done

if [ -z "$HERMES_SKILL" ]; then
    echo "ERROR: Skill '$SKILL_NAME' not found in Hermes skills directories"
    exit 2
fi

# 创建 .skills/ 目录并写入
mkdir -p "$PROJECT_ROOT/.skills"
cp "$HERMES_SKILL/SKILL.md" "$PROJECT_ROOT/.skills/$SKILL_NAME.md"

echo "Bridged: $HERMES_SKILL/SKILL.md"
echo "       → $PROJECT_ROOT/.skills/$SKILL_NAME.md"
echo "Reasonix: /skill $SKILL_NAME  now available in project"
