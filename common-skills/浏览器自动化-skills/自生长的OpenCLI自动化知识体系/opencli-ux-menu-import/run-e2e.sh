#!/usr/bin/env bash
# run-e2e.sh — 菜单权限合并 YAML 预览导入一键入口
# 委托到 docs/menu/scripts/ 中的实际脚本，退出时自动记录实跑结果

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="${SCRIPT_DIR}/config/menu-import.config.json"

SKILL_NAME="$(basename "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")"
# auto-log trap: 退出时记录实跑结果
trap 'EXIT_CODE=$?; if [[ $EXIT_CODE -eq 0 ]]; then R="PASS"; N="PREVIEW OK"; else R="FAIL"; N="exit code=$EXIT_CODE"; fi; bash "${SCRIPT_DIR}/../harvest/log-result.sh" "$R" "$N" "${SKILL_NAME}" 2>/dev/null || true' EXIT

# 从 config 读取外部脚本路径
SCRIPT_BASE="$(python3 -c "import json; print(json.load(open('${CONFIG}'))['defaultScriptBase'])" 2>/dev/null)"
SCRIPT_BASE="${SCRIPT_BASE:-../../../docs/menu/scripts}"

echo "==== opencli-ux-menu-import ===="
echo "外部脚本目录: ${SCRIPT_DIR}/${SCRIPT_BASE}"
echo ""

# 委托到 docs/menu/scripts/
cd "${SCRIPT_DIR}/${SCRIPT_BASE}"
python3 menu_import_preview_loop.py "$@"
