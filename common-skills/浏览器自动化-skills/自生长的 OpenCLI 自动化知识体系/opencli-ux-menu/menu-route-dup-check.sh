#!/usr/bin/env bash
# 菜单路由路径按项目判重 UX：TC1 同项目拒 / TC2 跨项目允。

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

mkdir -p "${UX_SUITE_ROOT}/screenshots"

log_step "0" "profile=${UX_PROFILE} menu=${MENU_URL} auth=${AUTH_MODE}"

if [[ "${AUTH_MODE}" == "login" && "$SKIP_LOGIN" -eq 0 ]]; then
  bash "${SCRIPT_DIR}/login.sh" ${UX_PROFILE_ARG:+--profile "$UX_PROFILE_ARG"}
  assert_logged_in
elif [[ "${AUTH_MODE}" == "login" && "$SKIP_LOGIN" -eq 1 ]]; then
  assert_logged_in
fi

open_menu_manage_page

# --- TC1：test0415 同项目重复 ---
log_step "TC1" "项目 ${PROJECT_DUP} + 路径 ${ROUTE_PATH_DUP} → 应提示项目内重复"
select_menu_project "$PROJECT_DUP"
open_menu_create_dialog
fill_menu_name "$(generate_menu_test_name)"
fill_menu_route_path "$ROUTE_PATH_DUP"
blur_menu_route_path
assert_menu_route_error_contains "$DUP_ERROR_TEXT" "tc1-dup-in-project"
close_menu_dialog_if_open
sleep 1

# --- TC2：test0601 跨项目相同路径 ---
log_step "TC2" "项目 ${PROJECT_CROSS} + 相同路径 ${ROUTE_PATH_DUP} → 不应判重"
select_menu_project "$PROJECT_CROSS"
open_menu_create_dialog
fill_menu_name "$(generate_menu_test_name)"
fill_menu_route_path "$ROUTE_PATH_DUP"
blur_menu_route_path
assert_menu_route_no_duplicate_error "tc2-cross-project"
close_menu_dialog_if_open
sleep 1

# --- TC3：test0415 编辑自身不改 path ---
log_step "TC3" "项目 ${PROJECT_DUP} 编辑已有菜单 ${ROUTE_PATH_DUP} → 不应因自身 id 判重"
select_menu_project "$PROJECT_DUP"
open_menu_edit_dialog_by_route_path "$ROUTE_PATH_DUP"
blur_menu_route_path
assert_menu_route_no_duplicate_error "tc3-edit-self"
close_menu_dialog_if_open

echo ""
echo "菜单路由路径按项目判重 UX 流程完成 (profile=${UX_PROFILE})"
echo "  TC1: ${PROJECT_DUP} 同项目重复 — 通过"
echo "  TC2: ${PROJECT_CROSS} 跨项目相同路径 — 通过"
echo "  TC3: ${PROJECT_DUP} 编辑自身 — 通过"
