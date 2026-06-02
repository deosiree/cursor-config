#!/usr/bin/env bash
# 只读诊断：打开菜单页并 dump URL / 项目 / routePath 列表 / 弹窗状态

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

open_menu_manage_page
dump_menu_page_diagnostic
echo ""
echo "诊断完成。可配合: opencli browser ${SESSION} screenshot screenshots/diag.png"
