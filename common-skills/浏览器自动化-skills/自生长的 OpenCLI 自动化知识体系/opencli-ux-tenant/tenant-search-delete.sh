#!/usr/bin/env bash
#===============================================================================
# 步骤 7-10：搜索校验 → 删除 → 再搜索确认（需已登录 session）
#
# 适用于线上已创建租户后的清理或回归验证。
# 等价于 tenant-create-delete.sh 的后半段。
#
# 用法：
#   bash tenant-search-delete.sh                           # local 环境
#   bash tenant-search-delete.sh --profile cloud           # cloud 环境
#   bash tenant-search-delete.sh --check                   # 自检模式
#
# 步骤：
#   7: 搜索 → 断言 1 条
#   8: 更多 → 删除
#   9: 确认弹窗 → 确定
#   10: 再次搜索 → 断言 0 条
#
# 依赖：opencli browser 已登录 session
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-tenant/
#===============================================================================

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

# ---- 步骤 7：搜索并断言 1 条 ----
log_step "7" "搜索「${TENANT_NAME}」，断言有且仅有 1 条（指数退避轮询）"
assert_tenant_list_count "$TENANT_NAME" 1 || die "步骤7失败：未在列表中找到租户「${TENANT_NAME}」"

# ---- 步骤 8：更多 → 删除 ----
log_step "8" "更多 → 删除"
tenant_click_row_delete_menu "$TENANT_NAME" || die "步骤8失败：未能从操作列打开删除"

# ---- 步骤 9：确认删除弹窗 ----
log_step "9" "确认删除"
tenant_confirm_delete_dialog || die "步骤9失败：删除确认或删除成功提示未出现"

# ---- 步骤 10：再次搜索，断言已删除 ----
log_step "10" "再次搜索，断言已删除（0 条）"
assert_tenant_list_count "$TENANT_NAME" 0 || die "步骤10失败：删除后仍能搜索到该租户"

tenant_clear_search

echo ""
echo "步骤 7-10 完成 (tenant=${TENANT_NAME})"
