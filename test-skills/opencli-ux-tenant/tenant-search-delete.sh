#!/usr/bin/env bash
# 仅执行步骤 7-10：搜索校验 → 删除 → 再搜索确认（需已登录且在租户列表页或可打开租户页）。

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

set -euo pipefail

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

mkdir -p "${UX_SUITE_ROOT}/screenshots"

log_step "0" "profile=${UX_PROFILE} 仅执行步骤7-10 tenant=${TENANT_NAME}"

oc_plain open "$TENANT_URL" >/dev/null
sleep 2
oc_plain wait text "租户列表" --timeout 20000 >/dev/null 2>&1 || true

log_step "7" "搜索「${TENANT_NAME}」，断言有且仅有 1 条"
assert_tenant_list_count "$TENANT_NAME" 1 || die "步骤7失败"

log_step "8" "更多 → 删除"
tenant_click_row_delete_menu "$TENANT_NAME" || die "步骤8失败"

log_step "9" "确认删除"
tenant_confirm_delete_dialog || die "步骤9失败"

log_step "10" "再次搜索，断言已删除（0 条）"
assert_tenant_list_count "$TENANT_NAME" 0 || die "步骤10失败"

tenant_clear_search

echo ""
echo "步骤 7-10 完成 (tenant=${TENANT_NAME})"
