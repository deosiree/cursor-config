#!/usr/bin/env bash
# 演示：语法校验先于唯一性判重（/0522 等同项目路径会先报「段首不要为数字」而非重复文案）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

SYNTAX_BLOCK_PATH="${SYNTAX_BLOCK_PATH:-/0522}"

open_menu_manage_page
select_menu_project "$PROJECT_DUP"
open_menu_create_dialog
fill_menu_name "$(generate_menu_test_name)"
fill_menu_route_path "$SYNTAX_BLOCK_PATH"
blur_menu_route_path

raw="$(get_menu_form_state 2>/dev/null || true)"
state="$(echo "$raw" | extract_eval_json 2>/dev/null || true)"

if echo "$state" | grep -q "$DUP_ERROR_TEXT"; then
  die "预期应先语法错误，却出现判重文案: ${state}"
fi
if ! echo "$state" | grep -q "段首\|路径\|路由"; then
  die "未检测到语法类错误: ${state}"
fi

log_step "demo" "PASS: ${SYNTAX_BLOCK_PATH} 触发语法校验，未误报「${DUP_ERROR_TEXT}」"
close_menu_dialog_if_open
echo "语法先于判重 — 演示通过"
