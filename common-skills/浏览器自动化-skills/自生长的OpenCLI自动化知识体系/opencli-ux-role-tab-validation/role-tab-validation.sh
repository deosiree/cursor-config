#!/usr/bin/env bash
# 角色 Tab 校验跳转 UX：TC1~TC4（需已登录 session）。

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

# auto-log: 无论 PASS 还是 FAIL (die)，退出时自动记录实跑结果
SKILL_NAME="$(basename "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)")"
trap 'EXIT_CODE=$?; if [[ $EXIT_CODE -eq 0 ]]; then R="PASS"; N="TC1~TC4 全通过"; else R="FAIL"; N="die 退出 (code=$EXIT_CODE)"; fi; bash "${SCRIPT_DIR}/../harvest/log-result.sh" "$R" "$N" "${SKILL_NAME}" 2>/dev/null || true' EXIT

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

mkdir -p "${UX_SUITE_ROOT}/screenshots"

log_step "0" "profile=${UX_PROFILE} role=${ROLE_URL}"

if [[ "$SKIP_LOGIN" -eq 0 ]]; then
  bash "${SCRIPT_DIR}/login.sh" ${UX_PROFILE_ARG:+--profile "$UX_PROFILE_ARG"}
fi

assert_logged_in

# --- TC1：关联设备 Tab + 空角色名 ---
log_step "TC1" "关联设备 Tab + 空角色名 → 应跳回基础信息"
open_role_manage_page
close_role_dialog_if_open
open_role_create_dialog
clear_role_name
click_role_dialog_tab "关联设备"
click_dialog_confirm
assert_role_dialog_tab "基础信息" "tc1-tab" || die "TC1 失败：未跳转到基础信息 Tab"
assert_role_form_error "角色名称不能为空" "tc1-error" || die "TC1 失败：未显示角色名称校验错误"
click_dialog_cancel
sleep 1

# --- TC2：菜单权限 Tab + 空角色名 ---
log_step "TC2" "菜单权限 Tab + 空角色名 → 应跳回基础信息"
open_role_manage_page
close_role_dialog_if_open
open_role_create_dialog
clear_role_name
click_role_dialog_tab "菜单权限"
click_dialog_confirm
assert_role_dialog_tab "基础信息" "tc2-tab" || die "TC2 失败：未跳转到基础信息 Tab"
assert_role_form_error "角色名称不能为空" "tc2-error" || die "TC2 失败：未显示角色名称校验错误"
click_dialog_cancel
sleep 1

# --- TC3：合法提交（对照组）---
TEST_ROLE_NAME="$(generate_role_test_name)"
log_step "TC3" "合法角色名提交 → 弹窗关闭 / 新增成功 (${TEST_ROLE_NAME})"
open_role_manage_page
close_role_dialog_if_open
open_role_create_dialog
fill_role_name "$TEST_ROLE_NAME"
click_dialog_confirm
if ! assert_role_dialog_closed "tc3-closed"; then
  assert_toast_contains "新增成功" "tc3-toast" || die "TC3 失败：弹窗未关闭且无新增成功提示"
fi
delete_role_by_name "$TEST_ROLE_NAME" || log_step "cleanup" "TC3 清理跳过（角色可能未创建或已删除）"

# --- TC4：关闭后 Tab 重置 ---
log_step "TC4" "取消后重开 → 默认回到基础信息 Tab"
open_role_manage_page
close_role_dialog_if_open
open_role_create_dialog
click_role_dialog_tab "关联设备"
click_dialog_cancel
sleep 1
open_role_create_dialog
assert_role_dialog_tab "基础信息" "tc4-tab" || die "TC4 失败：重开弹窗未回到基础信息 Tab"
click_dialog_cancel

echo ""
echo "角色 Tab 校验 UX 流程完成 (profile=${UX_PROFILE})"
echo "  TC1: 关联设备 Tab + 空名 → 基础信息 + 校验错误 — 通过"
echo "  TC2: 菜单权限 Tab + 空名 → 基础信息 + 校验错误 — 通过"
echo "  TC3: 合法提交 — 通过"
echo "  TC4: 取消后重开 Tab 重置 — 通过"
