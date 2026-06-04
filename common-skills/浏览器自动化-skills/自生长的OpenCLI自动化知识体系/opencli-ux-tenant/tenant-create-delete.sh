#!/usr/bin/env bash
#===============================================================================
# 租户管理全流程：创建 → 搜索校验 → 删除 → 空列表校验（需已登录 session）
#
# 用法：
#   bash tenant-create-delete.sh                      # local 环境
#   bash tenant-create-delete.sh --profile cloud      # cloud 环境
#   bash tenant-create-delete.sh --check              # 自检模式
#
# 步骤对应业务用例 1-10：
#   1-2: 打开租户页 → 点击新增
#   3:   填写基础信息（租户名 / 用户名 / 密码直设 / 手机 / 邮箱）
#   4-5: 下一步 → 关联项目 → 勾选 test_plat
#   6:   下一步 → 角色确认 → 确定提交
#   7:   搜索 → 断言 1 条
#   8-9: 更多 → 删除 → 确定
#   10:  再次搜索 → 断言 0 条
#
# 依赖：opencli browser 已登录 session
# 来源：自生长的OpenCLI自动化知识体系/opencli-ux-tenant/
#===============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/common.sh
source "${SCRIPT_DIR}/lib/common.sh"

parse_args_profile "$@"
load_profile "${UX_PROFILE_ARG:-}" || exit 1
require_opencli

mkdir -p "${UX_SUITE_ROOT}/screenshots"

log_step "0" "profile=${UX_PROFILE} tenant=${TENANT_URL}"
log_step "data" "固定租户名: ${TENANT_NAME}（创建与搜索一致）"

# ---- 步骤 1：打开租户管理页 ----
log_step "1" "打开租户管理页"
oc_plain open "$TENANT_URL" >/dev/null
sleep 3
oc_plain wait text "租户列表" --timeout 20000 >/dev/null 2>&1 || true

# ---- 步骤 2：点击新增按钮 ----
log_step "2" "点击新增"
click_button "新增"
sleep 2
oc_plain wait text "基础信息" --timeout 15000 >/dev/null 2>&1 || true

# ---- 步骤 3：填写基础信息与所有者 ----
log_step "3" "填写基础信息与所有者"
fill_tenant_create_step1 "$TENANT_NAME" "$OWNER_USER" "$OWNER_PASSWORD" "$PHONE" "$EMAIL"

# ---- 步骤 4：下一步 → 关联项目 ----
log_step "4" "下一步 → 关联项目"
click_dialog_next
sleep 2
wait_dialog_text "项目列表" 25 || die "未进入「项目选择」步骤（可能表单校验未通过，请检查截图）"

# ---- 步骤 5：选择项目 ----
log_step "5" "选择项目 ${PROJECT_NAME}"
select_project_by_name "$PROJECT_NAME" || die "未找到项目: ${PROJECT_NAME}"

# ---- 步骤 6：下一步 → 角色确认 → 确定提交 ----
log_step "6" "下一步 → 角色确认"
click_dialog_next
sleep 2
wait_dialog_text "角色确认" 20 || true

log_step "6b" "确定 → 提交创建"
click_dialog_confirm
wait_after_tenant_created

# ====== 步骤 7-10：查询 → 删除 → 再查询确认 ======

# ---- 步骤 7：搜索并断言有且仅有 1 条 ----
log_step "7" "搜索「${TENANT_NAME}」，断言有且仅有 1 条（指数退避轮询）"
assert_tenant_list_count "$TENANT_NAME" 1 || die "步骤7失败：创建后未在列表中找到租户，请确认是否创建成功"

# ---- 步骤 8：操作列 → 更多 → 删除 ----
log_step "8" "对租户「${TENANT_NAME}」操作列：更多 → 删除"
tenant_click_row_delete_menu "$TENANT_NAME" || die "步骤8失败：未能从操作列打开删除"

# ---- 步骤 9：确认弹窗 → 确定，等待删除成功 ----
log_step "9" "在确认弹窗点击「确定」，等待删除成功"
tenant_confirm_delete_dialog || die "步骤9失败：删除确认或删除成功提示未出现"

# ---- 步骤 10：再次搜索，断言列表为空 ----
log_step "10" "再次搜索「${TENANT_NAME}」，断言列表为空（确认已删除）"
assert_tenant_list_count "$TENANT_NAME" 0 || die "步骤10失败：删除后仍能搜索到该租户"

echo ""
echo "租户 UX 流程完成 (profile=${UX_PROFILE}, tenant=${TENANT_NAME})"
echo "  步骤7:  创建后查询    — 通过（1 条）"
echo "  步骤8-9: 更多 → 删除 → 确定 — 通过"
echo "  步骤10: 删除后再查询  — 通过（0 条）"

tenant_clear_search
