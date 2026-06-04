#!/usr/bin/env bash
# run-e2e.sh — 菜单权限合并 YAML 预览导入一键入口
# 委托到 docs/menu/scripts/ 中的实际脚本

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG="${SCRIPT_DIR}/config/menu-import.config.json"

# 从 config 读取外部脚本路径
SCRIPT_BASE="$(python3 -c "import json; print(json.load(open('${CONFIG}'))['defaultScriptBase'])" 2>/dev/null)"
SCRIPT_BASE="${SCRIPT_BASE:-../../../docs/menu/scripts}"

echo "==== opencli-ux-menu-import ===="
echo "外部脚本目录: ${SCRIPT_DIR}/${SCRIPT_BASE}"
echo ""

# 委托到 docs/menu/scripts/
cd "${SCRIPT_DIR}/${SCRIPT_BASE}"
exec python3 menu_import_preview_loop.py "$@"
